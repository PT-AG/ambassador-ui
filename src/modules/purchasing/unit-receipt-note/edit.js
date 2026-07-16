import {inject, Lazy} from 'aurelia-framework';
import {Router} from 'aurelia-router';
import {Service} from './service';
import { Base64Helper } from '../../../utils/base-64-coded-helper';


@inject(Router, Service)
export class Edit {
    constructor(router, service) {
        this.router = router;
        this.service = service;
    }

    async activate(params) {
        const decoded = Base64Helper.decode(params.id);
        var id = decoded;
        this.data = await this.service.getById(id);
        this.unit = this.data.unit;
        this.supplier = this.data.supplier;
        this.deliveryOrder = this.data.items;
        if(this.data.doNo){
            this.deliveryOrder.no=this.data.doNo;
            
        }
        for(var _item of this.deliveryOrder){
            _item.deliveredUom=_item.product.uom;
        }
        if(this.data.unit && this.data.supplier){
            this.data.unitId=this.data.unit._id;
            this.data.supplierId=this.data.supplier._id;
        }
    }

    view() {
        const encoded = Base64Helper.encode(this.data._id);
        this.router.navigateToRoute('view', { id: encoded });
        //this.router.navigateToRoute('view', { id: this.data.Id });
    }

    save() {
        if(typeof this.data.date === 'object')
            this.data.date.setHours(this.data.date.getHours() - this.data.date.getTimezoneOffset() / 60);

        this.service.update(this.data).then(result => {
            this.view();
        }).catch(e => {
            this.error = e;
        })
    }
}
