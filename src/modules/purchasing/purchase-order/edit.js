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
        this.data.isSplit = true;
        this.data.purchaseRequest=this.data;

        this.data.purchaseRequest.toString = function () {
            return `${this.prNo}`
        }
        this.purchaseRequest=this.data.purchaseRequest;
        
        this.data.purchaseRequest.date=this.data.prDate;
        
        this.data.purchaseRequest.unit.toString = function () {
            return [this.division.name, this.name]
                .filter((item, index) => {
                    return item ;
                }).join(" - ");
        }

        this.data.purchaseRequest.category.toString = function () {
            return [this.code, this.name]
                .filter((item, index) => {
                    return item ;
                }).join(" - ");
        }

        this.data.items.forEach(item => {
            item.product.toString = function () {
                return [this.code, this.name]
                    .filter((item, index) => {
                        return item ;
                    }).join(" - ");      
            }
        })
    }

    cancel(event) {
        const encoded = Base64Helper.encode(this.data._id);
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
        var newInternalPurchaseOrder = Object.assign({}, this.data);
        delete newInternalPurchaseOrder.purchaseRequest;
        delete newInternalPurchaseOrder.toString();
        delete newInternalPurchaseOrder._id;
        this.service.spliting(this.data._id, newInternalPurchaseOrder).then(result => {
            // console.log(this.data);
            this.cancel();
        }).catch(e => {
            this.error = e;
        })
    }
    // split(event) {
    //     this.service.split(this.copyForSplit(this.data)).then(result => {
    //         this.cancel();
    //     }).catch(e => {
    //         this.error = e;
    //     })
    // }

    // copyForSplit(purchaseOrder) {
    //     var newPurchaseOrder = Object.assign({}, purchaseOrder);
    //     delete newPurchaseOrder._id;
    //     newPurchaseOrder.sourcePurchaseOrderId = purchaseOrder._id;
    //     newPurchaseOrder.sourcePurchaseOrder = Object.assign({}, purchaseOrder);
    //     console.log(newPurchaseOrder);
    //     return newPurchaseOrder;
    // }
}