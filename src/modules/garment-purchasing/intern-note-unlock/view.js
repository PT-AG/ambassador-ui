import { inject, Lazy } from 'aurelia-framework';
import { Router } from 'aurelia-router';
import { Service } from './service';


@inject(Router, Service)
export class View {
    
    constructor(router, service) {
        this.router = router;
        this.service = service;
        this.hasCancel = true;
        this.hasDelete = false;
        this.isUnlock = true;
    }

    async activate(params) {
        var id = params.id;
        this.hasDelete = false;
        this.isUnlock = true;
        this.data = await this.service.getById(id);
        this.currency = this.data.currency;
        this.supplier = this.data.supplier;
        this.data.isView = true;

        if (!this.data.isEdit ){
            this.hasDelete = false;
        }
        if(this.data.IsApprovedKasie){
            this.hasDelete = false;
        }
    }

    cancel(event) {
        this.router.navigateToRoute('list');
    }

    edit(event) {
        this.router.navigateToRoute('edit', { id: this.data.Id });
    }

    delete(event) {
        this.service.delete(this.data).then(result => {
            this.cancel();
        });
    }
    unlock(event) {
        this.service.unlock(this.data.Id).then(result => {
            this.cancel();
        });
    }
}
