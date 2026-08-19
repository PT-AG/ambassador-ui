import { inject, Lazy } from 'aurelia-framework';
import { Router } from 'aurelia-router';
import { Service, ProductionService } from './service';
import { Base64Helper } from '../../../utils/base-64-coded-helper';

@inject(Router, Service, ProductionService)
export class View {

    constructor(router, service, productionService) {
        this.router = router;
        this.service = service;
        this.productionService = productionService;
    }

    async activate(params) {
        const decoded = Base64Helper.decode(params.id);
        var id = decoded;

        this.data = await this.service.getById(id);

        this.selectedPackingList = this.data.invoiceNo;
        
        let exist = await this.productionService.getExpenditureGoodByInvoiceNo({ size: 1, filter: JSON.stringify({ Invoice: this.data.invoiceNo }) });
        if (exist.data.length > 0) {
          this.deleteCallback = undefined;
        }
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
