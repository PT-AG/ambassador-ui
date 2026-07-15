import {inject, Lazy} from 'aurelia-framework';
import {Router} from 'aurelia-router';
import {Service} from './service';
import { Base64Helper } from '../../../utils/base-64-coded-helper';


@inject(Router, Service)
export class Edit {
    hasCancel = true;

    constructor(router, service) {
        this.router = router;
        this.service = service;
    }

    bind() {
        this.error = {};
    }

    async activate(params) {
        var locale = 'id-ID';
        var moment = require('moment');
        moment.locale(locale);
        const decoded = Base64Helper.decode(params.id);
        var id = decoded;
        this.data = await this.service.getById(id);
        this.data.date = moment(this.data.date).format("YYYY-MM-DD");
        this.data.expectedDeliveryDate = moment(this.data.expectedDeliveryDate).format("YYYY-MM-DD");
        this.data.shipmentDate = moment(this.data.shipmentDate).format("YYYY-MM-DD");

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
}
