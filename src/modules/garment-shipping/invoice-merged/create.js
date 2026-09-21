import { inject, Lazy } from 'aurelia-framework';
import { Router } from 'aurelia-router';
import { Service } from './service';
import { activationStrategy } from 'aurelia-router';

@inject(Router, Service)
export class Create {
    hasCancel = true;
    hasSave = true;

    constructor(router, service) {
        this.router = router;
        this.service = service;
    }

    bind() {
        this.partial = true;
        this.data = { 
            isPartial: true,
            shippingStaff: {},
            shippingStaffId: 0,
            buyerAgent: {},
            section: {},
            invoiceDate: new Date(),
            packingListId: 0,
            items: [], 
            itemsByPackingInvoice: [] 
        };
        this.error = {};
    }

    determineActivationStrategy() {
        return activationStrategy.replace; //replace the viewmodel with a new instance
        // or activationStrategy.invokeLifecycle to invoke router lifecycle methods on the existing VM
        // or activationStrategy.noChange to explicitly use the default behavior
    }

    cancel(event) {
        this.router.navigateToRoute('list');
    }

    save(event) {
        for (var item of this.data.items) {
            if (item.quantity == "") { item.quantity = 0; }
            if (item.price == "") { item.price = 0; }
        }

        // if (this.data.isPartial) {
        //     this.data.itemsByPackingInvoice;
        // }

        this.service.create(this.data)
            .then(result => {
                alert("Data berhasil dibuat");
                this.router.navigateToRoute('create', {}, { replace: true, trigger: true });
            })
            .catch(error => {
                this.error = error;
                if (typeof (this.error) == "string") {
                    alert(this.error);
                } else {
                    alert("Data gagal dibuat");
                }
            });
    }

    cancel(event) {
        this.router.navigateToRoute('list');
    }
}