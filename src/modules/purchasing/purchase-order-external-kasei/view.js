import {inject, Lazy} from 'aurelia-framework';
import {Router} from 'aurelia-router';
import {Service} from './service';
import { Base64Helper } from '../../../utils/base-64-coded-helper';

@inject(Router, Service)
export class View {
    hasCancel = true;
    hasEdit = false;
    hasDelete = false;
    hasCancelPo = false;
    hasUnpost = false;
    hasClosePo = false;
    hasView = true;

    constructor(router, service) {
        this.router = router;
        this.service = service;
    }

    async activate(params) {
        var isVoid = false;
        var canClose=false;
        var isArriving = false;
        const decoded = Base64Helper.decode(params.id);
        var id = decoded;
        this.poExId = id;
        this.data = await this.service.getById(id);
        for(var a of this.data.items){
            for(var b of a.details){
                if(b.doQuantity && b.doQuantity > 0 ){
                    isVoid = true;
                }
                if(b.doQuantity < b.dealQuantity){
                    canClose = true;
                }
                if(b.priceBeforeTax){
                    b.priceBeforeTax=b.priceBeforeTax.toLocaleString('en-EN', { minimumFractionDigits: 4 });
                  }
            }
        }
        
        if (!this.data.isPosted) {
            this.hasDelete = true;
            this.hasEdit = true;
        }
        if (this.data.isPosted && !isVoid  && !this.data.isClosed && !this.data.isCanceled) {
            this.hasUnpost = true;
            this.hasCancelPo = true;
        }
        if (this.data.isPosted && !this.data.isClosed && isVoid && canClose) {
            this.hasClosePo = true;
        }

        if(this.data.isClosed || this.data.isCanceled){
            this.hasDelete = false;
            this.hasEdit = false;
            this.hasUnpost = false;
            this.hasClosePo = false;
            this.hasCancelPo = false;
        }
    }

    cancel(event) {
        this.router.navigateToRoute('list');
    }

    edit(event) {
        const encoded = Base64Helper.encode(this.data._id);
        this.router.navigateToRoute('edit', { id: encoded });
    }

    delete(event) {
        this.service.delete(this.data).then(result => {
            this.cancel();
        });
    }

    cancelPO(e) {
        this.service.cancel(this.poExId).then(result => {
            this.cancel();
        }).catch(e => {
            this.error = e;
        })
    }

    unpostPO(e) {
        this.service.unpost(this.poExId).then(result => {
            this.cancel();
        }).catch(e => {
            this.error = e;
        })
    }

    closePO(e) {
        this.service.close(this.poExId).then(result => {
            this.cancel();
        }).catch(e => {
            this.error = e;
        })
    }

}