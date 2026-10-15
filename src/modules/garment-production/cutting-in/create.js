import { inject, bindable } from 'aurelia-framework';
import { Router } from 'aurelia-router';
import { Service } from './service';
import { activationStrategy } from 'aurelia-router';

@inject(Router, Service)
export class Create {

    @bindable error = {};

    constructor(router, service) {
        this.router = router;
        this.service = service;
    }

    bind() {
        this.data = {};
        this.error = {};
        this.checkedAll = false;
    }

    determineActivationStrategy() {
        return activationStrategy.replace; //replace the viewmodel with a new instance
        // or activationStrategy.invokeLifecycle to invoke router lifecycle methods on the existing VM
        // or activationStrategy.noChange to explicitly use the default behavior
        // return activationStrategy.invokeLifecycle;
    }

    cancelCallback(event) {
        this.router.navigateToRoute('list');
    }

    saveCallback(event) {
        this.data.CuttingFrom = "PREPARING";
        this.service.create(this.data)
            .then(result => {
                alert("Data berhasil dibuat");
                this.router.navigateToRoute('create', {}, { replace: true, trigger: true });
            })
            .catch(e => {
                const normalizedError = Object.assign({}, e);

                Object.keys(e).forEach(key => {
                    const match = /^Items\[(\d+)\]\.Details\[(\d+)\]\.(.+)$/.exec(key);
                    if (!match) return;

                    const itemIndex = Number(match[1]);
                    const detailIndex = Number(match[2]);
                    const field = match[3];

                    normalizedError.Items = normalizedError.Items || [];
                    const itemError = normalizedError.Items[itemIndex] ||
                        (normalizedError.Items[itemIndex] = { Details: [] });

                    const detailError = itemError.Details[detailIndex] ||
                        (itemError.Details[detailIndex] = {});

                    detailError[field] = e[key];
                });

                this.error = normalizedError;
            })
    }
}