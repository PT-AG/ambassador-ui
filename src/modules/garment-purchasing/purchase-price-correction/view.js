import { inject, Lazy } from 'aurelia-framework';
import { Router } from 'aurelia-router';
import { Service } from './service';
import { Base64Helper } from '../../../utils/base-64-coded-helper';

@inject(Router, Service)
export class View {
    isView = true

    constructor(router, service) {
        this.router = router;
        this.service = service;
    }

    async activate(params) {
        const decoded = Base64Helper.decode(params.id);
        var id = decoded;
        this.data = await this.service.getById(id);
        this.deliveryOrder = await this.service.getdeliveryOrderById(this.data.DOId);
        this.selectedSupplier=this.data.Supplier;
        this.correctionType = this.data.CorrectionType;
        this.deliveryOrder = { doNo:this.data.DONo};
    }

    cancelCallback(event) {
        this.router.navigateToRoute('list');
    }
}
