import { inject, Lazy } from 'aurelia-framework';
import { Router } from 'aurelia-router';
import { Service } from './service';
import { RejectReason } from "./dialog-template/reject-reason";
import { Dialog } from "../../../au-components/dialog/dialog";


@inject(Router, Service, Dialog)
export class View {
    
    constructor(router, service,dialog) {
        this.router = router;
        this.service = service;
        this.hasCancel = true;
        this.hasEdit = false;
        this.hasDelete = false;
        this.hasApprove = false;
        this.hasReject= false;
        this.dialog = dialog;
    }

    async activate(params) {
        var id = params.id;
        this.data = await this.service.getById(id);
        this.currency = this.data.currency;
        this.supplier = this.data.supplier;
        this.data.isView = true;

        this.hasApprove = true;
        this.hasReject= true;

        this.hasEdit = false;
        this.hasDelete = false;
    }

    cancelling(event) {
        this.router.navigateToRoute('list');
    }

    approve(event) {
        if (confirm("Apakah Anda yakin ingin menyetujui Nota Intern ini?")) {
            this.service.approve(this.data.Id)
                .then(result => {
                    alert("Nota Intern berhasil di-approve.");
                    this.cancelling();
                })
                .catch(e => {
                    alert(e.message || e);
                });
        }
    }

    reject(event) {
        console.log("a")
        this.dialog.show(RejectReason, {message: "Silakan masukkan alasan reject:" })
        .then(response => {
        if (!response.wasCancelled) {
            const reason = response.output;
            if (!reason || String(reason).trim() === "") {
            alert('Alasan tidak boleh kosong.');
            return;
            }
            this.service
            .Rejected(this.data.Id, String(reason).trim())
            .then((result) => {
                this.cancelling();
            })
            .catch((e) => {
                this.error = e;
            });
        }
        });
    }
}
