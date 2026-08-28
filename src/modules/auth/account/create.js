import { inject, Lazy } from 'aurelia-framework';
import { Router } from 'aurelia-router';
import { Service } from './service';

@inject(Router, Service)
export class Create {
    constructor(router, service) {
        this.router = router;
        this.service = service;
        this.data = { profile: {}, roles: [] };
        this.error = { profile: {},roles: [] };
    }

    activate(params) {

    }

    list() {
        this.router.navigateToRoute('list');
    }

    save() {
        this.error = { profile: {}, roles: [] };
        let count = 0;

        if (!this.data.digitalId && !this.data.DigitalId) {
            this.error.digitalId = "Digital ID tidak boleh kosong";
            count++;
        }

        if (count > 0) {
            return;
        }

        this.service.create(this.data)
            .then(result => {
                this.list();
            })
            .catch(e => {
                this.error = e;
            })
    }
}
