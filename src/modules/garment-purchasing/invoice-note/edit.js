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
        const decoded = Base64Helper.decode(params.id);
        var id = decoded;
        this.data = await this.service.getById(id);
        this.supplier = this.data.supplier;
        this.currency = this.data.currency;
        this.incomeTax={Id:this.data.incomeTaxId,name:this.data.incomeTaxName,rate:this.data.incomeTaxRate};
        this.vat={Id:this.data.vatId, Rate:this.data.vatRate};
        //this.vat = this.data.vat;

        

        this.data.items.map((items) => {
            items.check = true;
        })
        
    }

    cancel(event) {
        const encoded = Base64Helper.encode(this.data._id);
        this.router.navigateToRoute('view', { id: encoded });
        //this.router.navigateToRoute('view', { id: this.data.Id });
    }

    save(event) {
        // console.log(this.data);
        // var itemToBeSaved = this.data.items.filter(function (item) {
        //     return item.check
        // });
        // var _data = Object.assign({}, this.data);
        // _data.items = itemToBeSaved;
        // console.log(_data);
        this.service.update( this.data).then(result => {
            this.cancel();
        }).catch(e => {
            this.error = e;
        })

    }
}
