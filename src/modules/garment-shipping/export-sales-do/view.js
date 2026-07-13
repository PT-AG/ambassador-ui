import { inject, Lazy } from 'aurelia-framework';
import { Router } from 'aurelia-router';
import { Service } from './service';

@inject(Router, Service)
export class View {

    constructor(router, service) {
        this.router = router;
        this.service = service;
    }

    async activate(params) {
        const decoded = Base64Helper.decode(params.id);
        var id = decoded;

        this.data = await this.service.getById(id);
        this.selectedPackingList = await this.service.getPackingListById(this.data.packingListId);
        this.selectedBuyerAgent = this.data.buyerAgent;
    }

    cancelCallback(event) {
        this.router.navigateToRoute('list');
    }

    editCallback(event) {
        const encoded = Base64Helper.encode(this.data.id);
        this.router.navigateToRoute('edit', { id: encoded });
    }

    deleteCallback(event) {
        if (confirm("Hapus?")) {
            this.service.delete(this.data).then(result => {
                this.cancelCallback();
            });
        }
    }

}
