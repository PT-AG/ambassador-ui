import { inject, Lazy } from 'aurelia-framework';
import { Router } from 'aurelia-router';
import { Service } from './service';
import { Base64Helper } from '../../../utils/base-64-coded-helper';

@inject(Router, Service)
export class Edit {
    constructor(router, service) {
        this.router = router;
        this.service = service;
    }
    isEdit = true;

    async activate(params) {
        var id = Base64Helper.decode(params.id);
        this.data = await this.service.getById(id);
    }

    view(data) {
        const encoded = Base64Helper.encode(this.data.Id);
        this.router.navigateToRoute('view', { id: encoded });
    }

    save() {
        if(this.data.SalesContractROs){
            for(var item of this.data.SalesContractROs){
                if(item.Items && item.Items.length===0){
                    item.Price=item.Price?item.Price:0;
                }
            }
        }
        
        this.service.update(this.data).then(result => {
            this.view();
        }).catch(e => {
            this.error = e;
        })
    }
}