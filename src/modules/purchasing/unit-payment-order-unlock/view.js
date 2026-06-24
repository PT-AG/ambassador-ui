import { inject, Lazy } from 'aurelia-framework';
import { Router } from 'aurelia-router';
import { Service, AzureService } from './service';


@inject(Router, Service, AzureService)
export class View {
    hasCancel = true;isUnlock = true;

    constructor(router, service, azureService) {
        this.router = router;
        this.service = service;
        this.azureService = azureService;
    }

    async activate(params) {
        var id = params.id;
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
    }

    cancel(event) {
        this.router.navigateToRoute('list');
    }

    edit(event) {
        this.router.navigateToRoute('edit', { id: this.data._id });
    }

    delete(event) {
        Promise.all([this.service.delete(this.data), this.azureService.delete(this.data)])
            .then(result => {
                this.cancel();
            });
    }

    unlock(event) {
        this.service.unlock(this.data.Id).then(result => {
            this.cancel();
        });
    }
}
