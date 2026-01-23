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
        this.partial = false;
        this.data = { items: [], itemsByPackingInvoice: [] };
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

        if (!this.data.shippingStaffId) {
            const selectedShippingStaff = this.data.shippingStaff;
            this.data.shippingStaffId = selectedShippingStaff.Id || selectedShippingStaff.id;
            this.data.shippingStaff = selectedShippingStaff.Name || selectedShippingStaff.name;
        }

        if (this.data.isPartial) {
            this.data.itemsByPackingInvoice = this.data.itemsByPackingInvoice.filter(i => i.isSave);
        }

        this.service.create(this.data)
            .then(result => {
                if (result.statusCode == 200 || result.statusCode == 201) {
                    alert("Data berhasil dibuat");
                    this.router.navigateToRoute('create', {}, { replace: true, trigger: true });
                } else {
                    alert("Data gagal dibuat");
                }
            })
            .catch(error => {
                this.error = error;
            });
    }

    cancel(event) {
        this.router.navigateToRoute('list');
    }
}