import { inject } from 'aurelia-framework';
import { Router } from 'aurelia-router';
import { Service } from './service';
import { AuthService } from "aurelia-authentication";
import { Dialog } from '../../../au-components/dialog/dialog';
import { RejectDialog } from "./dialog/reject";
import { Base64Helper } from '../../../utils/base-64-coded-helper';

@inject(Router, Service, AuthService,Dialog)
export class View {
    readOnly = true;
    hasApprove = false;
    hasReject = false;
    // hasUnApprove = false;


    constructor(router, service, authService,dialog) {
        this.router = router;
        this.service = service;
        this.authService = authService;
        this.dialog = dialog;
    }

    async activate(params, routeConfig, navigationInstruction) {
        const decoded = Base64Helper.decode(params.id);
        let id = decoded;

        this.data = await this.service.read(id);

        const instruction = navigationInstruction.getAllInstructions()[0];
        const parentInstruction = instruction.parentInstruction;
        this.title = parentInstruction.config.title;
        const type = parentInstruction.config.settings.type;
        const ccg = this.data && this.data.CostCalculationGarment;

        switch (type) {
            case "kabagmd":
                this.type = "MD";
                this.hasApprove = Boolean(
                    this.data.IsPosted &&
                    !this.data.IsRejected &&
                    ccg &&
                    !ccg.IsValidatedROMD &&
                    !ccg.IsValidatedROSample
                );
                break;
            case "sample":
                this.type = "Sample";
                this.saveCallback = () => {
                    this.service.getPdfById(id);
                };
                {
                    const canValidateSample = Boolean(
                        this.data.IsPosted &&
                        !this.data.IsRejected &&
                        ccg &&
                        ccg.IsValidatedROMD &&
                        !ccg.IsValidatedROSample
                    );
                    this.hasApprove = canValidateSample;
                    this.hasReject = canValidateSample;
                }
                break;
            default: break;
        }

        if (this.authService.authenticated) {
            this.me = this.authService.getTokenPayload();
        }
        else {
            this.me = null;
        }

         if (this.data.IsRejected) {
            this.alertInfo =
                "<strong>Alasan Reject: </strong> " +
                this.data.RejectReason;
        }

    }

    backToList() {
        this.router.navigateToRoute('list');
    }

    cancelCallback(event) {
        this.backToList();
    }

    // editCallback(event) {
    //     this.router.navigateToRoute('edit', { id: this.data.Id });
    // }

    // deleteCallback(event) {
    //     if (confirm(`Hapus Data?`))
    //         this.service.delete(this.data)
    //             .then(result => {
    //                 this.backToList();
    //             });
    // }

    _extractErrorMessage(error) {
        if (!error) {
            return "Terjadi kesalahan saat memproses data.";
        }
        if (typeof error === "string") {
            return error;
        }
        if (error.message) {
            return error.message;
        }
        const firstValue = Object.values(error)[0];
        return typeof firstValue === "string" ? firstValue : JSON.stringify(error);
    }

    approveCallback(event) {
        if (!confirm(`Approve Data?`)) {
            return;
        }

        if (this.type === "Sample" && !this.data.CostCalculationGarment.IsValidatedROMD) {
            alert("Data belum di validasi oleh MD, harap follow up ke MD terlebih dahulu");
            this.backToList();
            return;
        }

        let jsonPatch = [
            { op: "replace", path: `/IsValidatedRO${this.type}`, value: true },
            { op: "replace", path: `/Validation${this.type}By`, value: this.me.username },
            { op: "replace", path: `/Validation${this.type}Date`, value: new Date() }
        ];

        if (this.type === "Sample") {
            jsonPatch.push(
                { op: "replace", path: `/IsValidatedROPPIC`, value: true },
                { op: "replace", path: `/ValidationPPICBy`, value: this.me.username },
                { op: "replace", path: `/ValidationPPICDate`, value: new Date() },
                { op: "replace", path: `/IsROAccepted`, value: true },
                { op: "replace", path: `/ROAcceptedBy`, value: this.me.username },
                { op: "replace", path: `/ROAcceptedDate`, value: new Date() },
            );
        }

        this.service.replaceCostCalculation(this.data.CostCalculationGarment.Id, jsonPatch)
            .then(result => {
                this.backToList();
            })
            .catch(e => {
                this.error = e;
                alert(`Approve dibatalkan : ${this._extractErrorMessage(e)}`);
            });
    }

    rejectCallback(event) {
        this.dialog
        .show(RejectDialog, { title: `Alasan Reject ${event}` })
        .then((response) => {
          if (!response.wasCancelled) {
            var info = {};
  
            info.id = this.data.Id;
            info.rejectReason = response.output;
  
            this.service
              .reject(info)
              .then((result) => {
                alert("RO berhasil diReject");
                this.backToList();
              })
              .catch((error) => {
                alert(`Reject dibatalkan : ${this._extractErrorMessage(error)}`);
              });
          }
        });
    }
    // unapproveCallback(event) {
    //     if (confirm(`UnApprove Data?`))
    //         this.service.unapprove({ Id: this.data.Id })
    //             .then(result => {
    //                 this.backToList();
    //             });
    // }
}