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

    async activate(params) {
        const decoded = Base64Helper.decode(params.id);
        var id = decoded;
        this.data = await this.service.getById(id)
            .then((correctionNote) => {
                return this.service.getUnitPaymentOrderById(correctionNote.uPOId)
                    .then((unitPaymentOrder) => {
                        console.log(unitPaymentOrder);

                        for (let upoItem in unitPaymentOrder.items) {
                            for (let upoDetail in upoItem.unitReceiptNote.items) {
                                let correctionItem = correctionNote.items.find(item => item.uPODetailId == upoDetail.Id);

                                if (correctionItem)
                                    correctionItem.deliveredQuantity = upoDetail.deliveredQuantity;
                            }
                        }

                        return correctionNote;
                    })
            });
    }

    view() {
        const encoded = Base64Helper.encode(this.data._id);
        this.router.navigateToRoute('view', { id: encoded });
        //this.router.navigateToRoute('view', { id: this.data.Id });
    }

    save() {
        this.service.update(this.data).then(result => {
            this.view();
        }).catch(e => {
            this.error = e;
        })
    }
}