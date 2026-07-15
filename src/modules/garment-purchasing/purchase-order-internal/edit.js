import {inject, Lazy} from 'aurelia-framework';
import {Router} from 'aurelia-router';
import {Service} from './service';
import { Base64Helper } from '../../../utils/base-64-coded-helper';


@inject(Router, Service)
export class Edit {
    hasCancel = true;
    hasSplit = true;

    constructor(router, service) {
        this.router = router;
        this.service = service;
    }

    bind() {
        this.error = {};
    }

    async activate(params) {
        const decoded = Base64Helper.decode(params.id);
        var id = decoded;
        this.data = await this.service.getById(id);
        // var items = this.data.items.filter(function (item) {
        //     return !item.isClosed
        // });
        // this.data.items = items
    }

    cancel(event) {
    	const encoded = Base64Helper.encode(this.data.Id);
    	this.router.navigateToRoute('view', { id: encoded });
    	//this.router.navigateToRoute('view', { id: this.data.Id });
    }

    save(event) {
        this.service.update(this.data).then(result => {
            this.cancel();
        }).catch(e => {
            this.error = e;
        })
    }

    split(event) {
        this.service.split(this.data).then(result => {
            this.cancel();
        }).catch(e => {
            this.error = e;
        })
    }

    copyForSplit(purchaseOrder) {
        var newPurchaseOrder = Object.assign({}, purchaseOrder);
        delete newPurchaseOrder.Id;

        // newPurchaseOrder.sourcePurchaseOrderId = purchaseOrder._id;
        // newPurchaseOrder.sourcePurchaseOrder = Object.assign({}, purchaseOrder);
        console.log(newPurchaseOrder);
        return newPurchaseOrder;
    }
}
