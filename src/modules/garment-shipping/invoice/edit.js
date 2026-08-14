import { inject, Lazy } from 'aurelia-framework';
import { Router } from 'aurelia-router';
import { Service } from './service';


@inject(Router, Service)
export class Edit {
    hasCancel = true;
    hasSave = true;
    isEdit = true;
    isUpdated = false;
    isCreate = false;
    partial = false;

    constructor(router, service) {
        this.router = router;
        this.service = service;
    }

    bind() {
        this.error = {};
    }

    async activate(params) {
        var id = params.id;
        this.data = await this.service.getById(id);
        this.partial = this.data.isPartial;

        if (this.data.isUsed == true) {
            this.isUsed = true;
        } else {
            this.isUsed = false;
        }

        if (this.data.isPartial) {
            this.data.items = [];
        }
    }

    cancel(event) {
        this.router.navigateToRoute('view', { id: this.data.id });
    }

    save(event) {
        this.service.update(this.data).then(result => {
            if (result.statusCode == 200 || result.statusCode == 201) {
                this.cancel();
            } else {
                this.error = result.error;
            }
        }).catch(e => {
            this.error = e;
        })
    }
}

