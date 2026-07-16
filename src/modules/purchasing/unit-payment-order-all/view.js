import { inject, Lazy } from 'aurelia-framework';
import { Router } from 'aurelia-router';
import { Service, AzureService } from './service';
import { Base64Helper } from '../../../utils/base-64-coded-helper';


@inject(Router, Service, AzureService)
export class View {
    hasCancel = true;
    hasEdit = true;
    hasDelete = true;
    hasCreate = false;
    isUnlock = false;

    constructor(router, service, azureService) {
        this.router = router;
        this.service = service;
        this.azureService = azureService;
    }

    async activate(params) {
        const decoded = Base64Helper.decode(params.id);
        var id = decoded;
        this.data = await this.service.getById(id);
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

        let totalAmount = 0;
        if (this.data.items) {
            for (let item of this.data.items) {
                if (item.unitReceiptNote && item.unitReceiptNote.items) {
                    for (let urnItem of item.unitReceiptNote.items) {
                        totalAmount += (urnItem.PriceTotal || 0);
                    }
                }
            }
        }

        this.hasEdit = true;
        this.hasDelete = true;

        const today = new Date();
        const firstDayOfCurrentMonth = new Date(
            today.getFullYear(),
            today.getMonth(),
            1
        );
        const date = new Date(this.data.date);
        if(this.data.Unlocked && (date < firstDayOfCurrentMonth)){
            this.hasDelete = true;
            this.hasEdit = true;
        }
        else{
            this.hasDelete = false;
            this.hasEdit = false;
        }

        if (this.data.isPosted) {
            if (totalAmount <= 3000000) {
                if (this.data.IsApprovedKasie) {
                    this.hasEdit = false;
                    this.hasDelete = false;
                }
            } else {
                if (this.data.IsApprovedKasie || this.data.IsApprovedKabag) {
                    this.hasEdit = false;
                    this.hasDelete = false;
                }
            }
        }
        
        if (this.data.IsCorrection) {
            this.hasEdit = false;
            this.hasDelete = false;
        }

    }

    cancel(event) {
        this.router.navigateToRoute('list');
    }

    edit(event) {
        const encoded = Base64Helper.encode(this.data._id);
        this.router.navigateToRoute('edit', { id: encoded });
    }

    delete(event) {
        Promise.all([this.service.delete(this.data), this.azureService.delete(this.data)])
            .then(result => {
                this.cancel();
            });
    }
}