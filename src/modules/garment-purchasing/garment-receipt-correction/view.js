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
        this.correctionType = this.data.CorrectionType;
        this.unitReceiptNote = {URNNo:this.data.URNNo};

        var urn= await this.service.getURNById(this.data.URNId);
        for (var item of this.data.Items){
            var urnItem= urn.Items.find(a=>a.Id==item.URNItemId);
            if(urnItem){
                item.OriginConversion=urnItem.Conversion;
                item.leftOverQty=urnItem.ReceiptCorrection-(urnItem.OrderQuantity/urnItem.CorrectionConversion);
            }
        }
    }

    cancelCallback(event) {
        this.router.navigateToRoute('list');
    }
}
