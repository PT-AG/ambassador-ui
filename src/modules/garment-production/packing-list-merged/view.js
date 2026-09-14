import { inject, Lazy } from 'aurelia-framework';
import { Router } from 'aurelia-router';
import { Service, CoreService } from './service';

@inject(Router, Service, CoreService)
export class View {

    constructor(router, service, coreService) {
        this.router = router;
        this.service = service;
        this.coreService = coreService;
    }

    formOptions = {
        cancelText: "Back",
        saveText: "Save"
    }

    async activate(params) {
        let id = params.id;
        this.data = await this.service.getById(id);
        this.error = {};

        let idx = 0;
        if (this.data.measurements) {
            for (let i of this.data.measurements) {
                i.MeasurementIndex = idx;
                idx++;
            }
        }

        if (this.data.items) {
            for (const item of this.data.items) {
                item.buyerAgent = this.data.buyerAgent;
                item.section = this.data.section;
            }

            this.data.mode = "UPDATE";
        } else {
            this.data.mode = "CREATE";
        }

        switch (this.data.status) {
            case "MERGED":
                if (!this.data.items || this.data.items.length <= 0 || !this.data.documentsFile || this.data.documentsFile.length <= 0)
                    this.saveCallback = null
                break;
            case "POSTED":
            case "APPROVED_MD":
                this.saveCallback = null;
                break;
            case "CANCELED":
            case "APPROVED_SHIPPING":
                this.deleteCallback = null;
                this.editCallback = null;
                this.saveCallback = null;
                break;
            case "REJECTED_SHIPPING_MD":
                this.saveCallback = null;
            default:
                this.editCallback = null;
                this.deleteCallback = null;
                break;
        }

        switch (this.data.status) {
            case "MERGED":
                this.formOptions.saveText = "Post Packing List";
                break;
            case "POSTED":
                this.formOptions.saveText = "Unpost Packing List";
                break;
            case "REJECTED_MD":
            case "REVISED_MD":
            case "REJECTED_SHIPPING_UNIT":
            case "REVISED_SHIPPING":
                this.formOptions.saveText = "Unpost Packing List";
                break;
            default:
                break;
        }

        switch (this.data.status) {
            case "REJECTED_MD":
                this.alertInfo = "<strong>Alasan Reject oleh Md:</strong> " + (this.data.statusActivities.slice(-1)[0] || {}).remark;
                break;
            case "REJECTED_SHIPPING_UNIT":
                this.alertInfo = "<strong>Alasan Reject oleh Shipping:</strong> " + (this.data.statusActivities.slice(-1)[0] || {}).remark;
                break;
            case "REVISED_MD":
                this.alertInfo = "<strong>Alasan Revisi oleh Md:</strong> " + (this.data.statusActivities.slice(-1)[0] || {}).remark;
                break;
            case "REVISED_TO_MD":
                this.alertInfo = "<strong>Alasan Revisi:</strong> " + (this.data.statusActivities.slice(-1)[0] || {}).remark;
                break;
            case "REVISED_SHIPPING":
                this.alertInfo = "<strong>Alasan Revisi oleh Shipping:</strong> " + (this.data.statusActivities.slice(-1)[0] || {}).remark;
                break;
            case "CANCELED":
                this.alertInfo = "<strong>Alasan Cancel:</strong> " + (this.data.statusActivities.slice(-1)[0] || {}).remark;
                break;
            default:
                break;
        }
    }

    cancelCallback(event) {
        this.router.navigateToRoute('list');
    }

    editCallback(event) {
        this.router.navigateToRoute('edit', { id: this.data.id });
    }

    deleteCallback(event) {
        if (confirm("Hapus?")) {
            this.service.delete(this.data).then(result => {
                this.cancelCallback();
            });
        }
    }

    saveCallback() {
        // Validasi: Pastikan ada minimal 1 file sebelum melanjutkan
        if (this.data.documentsFile.length === 0) {
            alert("Wajib mengunggah file dokumen item format PDF atau EXCEL");
            return;
        }

        if (confirm(this.formOptions.saveText + "?")) {
            switch (this.data.status) {
                case "MERGED":
                    this.service.postPackingList(this.data.id)
                        .then(result => {
                            this.cancelCallback();
                        }) 
                        .catch(error => {
                            this.error = error;

                            let errorNotif = "";
                            if (error.InvoiceType || error.Type || error.Date) {
                              errorNotif += "Tab DESCRIPTION ada kesalahan pengisian.\n"
                            }

                            if (error.GrossWeight || error.NettWeight || error.totalCartons || error.SayUnit || error.MeasurementsCount || error.Measurements) {
                                errorNotif += "Tab DETAIL MEASUREMENT ada kesalahan pengisian.\n"
                            }
                            
                            if (error.ShippingMark || error.SideMark || error.Remark) {
                                errorNotif += "Tab SHIPPING MARK - SIDE MARK - REMARK ada kesalahan pengisian."
                            }

                            if (errorNotif) {
                                alert(errorNotif);
                            }
                        });
                    break;    
                case "POSTED":
                case "REJECTED_MD":
                case "REVISED_MD":
                case "REJECTED_SHIPPING_UNIT":
                case "REVISED_SHIPPING":
                    this.service.unpostPackingList(this.data.id)
                        .then(result => {
                            this.cancelCallback();
                        });
                    break;
                default:
                    break;
            }
        }
    }
}
