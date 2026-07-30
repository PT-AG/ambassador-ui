import { inject } from 'aurelia-framework';
import { Router } from 'aurelia-router';
import { Service } from './service';
import { activationStrategy } from 'aurelia-router';
import moment from 'moment';

@inject(Router, Service)
export class Create {
    isCreate = true;

    constructor(router, service) {
        this.router = router;
        this.service = service;
    }

    activate(params) {

    }

    bind() {
        this.data = { Items: [] };
        this.error = {};
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
        this.data.ReturnDate = this.data.ReturnDate ? moment(moment(this.data.ReturnDate).format("DD MMM YYYY")).toDate() : null;
        // let objData = {};
        // let data = Object.assign(objData, this.data);
        // data.Items = data.Items.filter(x => x.IsSave==true);
        this.service.create(this.data)
            .then(result => {
                alert("Data berhasil dibuat");
                this.router.navigateToRoute('create', {}, { replace: true, trigger: true });
            })
            .catch(e => {
                const errors = this.normalizeValidationErrors(e)
                this.error = errors;
                if (typeof (this.error) == "string") {
                    alert(this.error);
                } else {
                    alert("Missing Some Data");
                }
            })
    }

    normalizeValidationErrors(errors) {
        const result = {
            ...errors,
            Items: Array.isArray(errors.Items)
            ? errors.Items.map(item => ({ ...item }))
            : []
        };

        Object.entries(errors).forEach(([key, message]) => {
            const match = key.match(/^Items\[(\d+)\]\.(.+)$/);

            if (!match) return;

            const index = Number(match[1]);
            const field = match[2];

            // Buat object pada index tersebut jika belum ada
            if (!result.Items[index]) {
        result.Items[index] = {};
        }

            // Masukkan pesan error ke field terkait
            result.Items[index][field] = message;

            // Hapus property lama: "Items[2].Quantity"
            delete result[key];
        });

        return result;
    }
}