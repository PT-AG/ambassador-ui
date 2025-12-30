import { inject, Lazy } from 'aurelia-framework';
import { Router } from 'aurelia-router';
import { Service, AzureService } from './service';


@inject(Router, Service, AzureService)
export class View {
    hasCancel = true;
    hasApprove = true;

    constructor(router, service, azureService) {
        this.router = router;
        this.service = service;
        this.azureService = azureService;
    }

    async activate(params) {
        this.id = params.id;
        this.data = await this.service.getById(this.id);
        if (this.data.division) {
            this.selectedDivision = this.data.division;
        }
        if (this.data.supplier) {
            this.selectedSupplier = this.data.supplier;
        }
        if (this.data.category) {
            this.selectedCategory = this.data.category;
        }
        if (this.data.currency) {
            this.selectedCurrency = this.data.currency;
        }
        if (this.data.incomeTax) {
            this.selectedIncomeTax = this.data.incomeTax;
        }

        if (this.data.vatTax) {
            this.selectedVatTax = this.data.vatTax;
        }

        // if (this.data.items) {
        //     // this.isCorrection = this.data.items
        //     //     .map((item) => {
        //     //         return item.unitReceiptNote.items
        //     //             .map((urnItem) => urnItem.correction.length > 0)
        //     //             .reduce((prev, curr, index) => {
        //     //                 return prev || curr
        //     //             }, false);
        //     //     })
        //     //     .reduce((prev, curr, index) => {
        //     //         return prev || curr
        //     //     }, false);


        //     // if (!this.isCorrection) {
        //     //     this.hasEdit = true;
        //     //     this.hasDelete = true;
        //     // }
        // }

        // if (this.data.position !== 1 && this.data.position !== 6) {
        //     this.hasEdit = false;
        //     this.hasDelete = false;
        // }

        if (this.data.IsCorrection) {
            this.hasEdit = false;
            this.hasDelete = false;
        }
    }

    cancel(event) {
        this.router.navigateToRoute('list');
    }

    approve(event) {
        if (!confirm("Yakin ingin menyetujui SPB ini?")) return;

        this.service.approveKabag(this.id)
            .then(() => {
                alert("SPB berhasil di-approve Kabag.");
                this.router.navigateToRoute("list");
            })
            .catch(err => {
                console.error(err);
                alert("Terjadi kesalahan saat approve.");
            });
    }
}
