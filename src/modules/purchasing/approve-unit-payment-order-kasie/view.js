import { inject, Lazy } from 'aurelia-framework';
import { Router } from 'aurelia-router';
import { Service } from './service';


@inject(Router, Service)
export class View {
    hasCancel = true;
    hasApprove = true;

    constructor(router, service) {
        this.router = router;
        this.service = service;
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

        if (this.data.IsCorrection) {
            this.hasEdit = false;
            this.hasDelete = false;
        }
    }

    cancel(event) {
        this.router.navigateToRoute('list');
    }

    approve(event) {
        if (!confirm("Yakin ingin menyetujui SPB External ini?")) return;

        this.service.approveKasie(this.id)
            .then(() => {
                alert("SPB berhasil di-approve Kasie.");
                this.router.navigateToRoute("list");
            })
            .catch(err => {
                console.error(err);
                alert("Terjadi kesalahan saat approve.");
            });
    }
}
