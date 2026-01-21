import { inject, Lazy } from 'aurelia-framework';
import { Router } from 'aurelia-router';
import { Service } from './service';
import { Dialog } from '../../../au-components/dialog/dialog';

@inject(Router, Service, Dialog)
export class View {
    constructor(router, service, dialog) {
        this.router = router;
        this.service = service;
        this.dialog = dialog;
    }

    async activate(params) {
        var id = params.id;
        this.data = await this.service.getById(id);
    }

    cancel(event) {
        this.router.navigateToRoute('list');
    }

    approve(event) {
        let remark = this.data.Items && this.data.Items.length > 0 ? this.data.Items[0].OverBudgetRemark : "-";

        if (confirm(`Apakah Anda yakin ingin menyetujui PO Over Budget ini?\n\nNo. PO: ${this.data.EPONo}\nSupplier: ${this.data.Supplier.Name}\nKeterangan: ${remark}`)) {
            this.service.approve(this.data.Id)
                .then(result => {
                    this.cancel();
                })
                .catch(e => {
                    alert(e);
                });
        }
    }
}
