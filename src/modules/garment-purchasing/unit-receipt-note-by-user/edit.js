import { inject, Lazy } from 'aurelia-framework';
import { Router } from 'aurelia-router';
import { Service } from './service';
import { Base64Helper } from '../../../utils/base-64-coded-helper';

@inject(Router, Service)
export class Edit {
    hasCancel = true;
    hasSave = true;
    constructor(router, service) {
        this.router = router;
        this.service = service;
    }

    bind() {
        this.error = {};
    }

    async activate(params) {
        var id = params.id;
        const decoded = Base64Helper.decode(params.id);
        var id = decoded;
        this.data = await this.service.getById(id);
        this.unit = this.data.Unit;
        this.supplier = {Id: this.data.Supplier.Id, code: this.data.Supplier.Code, name: this.data.Supplier.Name};
        this.deliveryOrder = { "Id": this.data.DOId, "doNo": this.data.DONo };
        this.storage = this.data.Storage;
        this.URNType=this.data.URNType;
    }

    cancel(event) {
        const encoded = Base64Helper.encode(this.data._id);
        this.router.navigateToRoute('view', { id: encoded });
    }

    save() {
        if(this.data.URNType=="SISA SUBCON"){
            for(var a of this.data.Items){
                a.ReceiptQuantity=a.SmallQuantity;
            }
        }
        this.service.update(this.data).then(result => {
            this.cancel();
        }).catch(e => {
            this.error = e;
        })
    }
}
