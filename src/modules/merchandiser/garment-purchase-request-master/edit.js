import { inject } from 'aurelia-framework';
import { Router } from 'aurelia-router';
import { Service, CoreService } from './service';
import { Base64Helper } from '../../../utils/base-64-coded-helper';

@inject(Router, Service, CoreService)
export class Edit {
    constructor(router, service, coreService) {
        this.router = router;
        this.service = service;
        this.coreService = coreService;
    }

    bind() {
        this.error = {};
    }

    async activate(params) {
        const decoded = Base64Helper.decode(params.id);
        var id = decoded;
        this.data = await this.service.read(id);

        if (this.data) {
            this.selectedPreSalesContract = {
                Id: this.data.SCId,
                SCNo: this.data.SCNo
            };

            if (this.data.Items) {
                let fabricItemsProductIds = this.data.Items
                    .filter(i => i.Category.Name === "FABRIC")
                    .map(i => i.Product.Id);

                if (fabricItemsProductIds.length > 0) {
                    const products = await this.coreService.getGarmentProductsByIds(fabricItemsProductIds);
                    this.data.Items
                        .filter(i => i.Category.Name === "FABRIC")
                        .forEach(i => {
                            const product = products.find(d => d.Id == i.Product.Id);

                            i.Composition = product;
                            i.Const = product;
                            i.Yarn = product;
                            i.Width = product;
                        });
                }
            }
        }
    }

    backToView() {
        const encoded = Base64Helper.encode(this.data.Id);
        this.router.navigateToRoute('view', { id: encoded });
        //this.router.navigateToRoute('view', { id: this.data.Id });
    }

    cancelCallback(event) {
        this.backToView();
    }

    saveCallback(event) {
        this.service.update(this.data).then(result => {
            this.backToView();
        }).catch(e => {
            this.error = e;
        })
    }
}
