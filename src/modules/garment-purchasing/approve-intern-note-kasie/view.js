import { inject, Lazy } from 'aurelia-framework';
import { Router } from 'aurelia-router';
import { Service } from './service';


@inject(Router, Service)
export class View {
    
    constructor(router, service) {
        this.router = router;
        this.service = service;
        this.hasCancel = true;
        this.hasEdit = false;
        this.hasDelete = false;
        this.hasApprove = false;
    }

    async activate(params) {
        var id = params.id;
        this.data = await this.service.getById(id);
        this.currency = this.data.currency;
        this.supplier = this.data.supplier;
        this.data.isView = true;

        if (!this.data.IsApprovedKasie) {
            this.hasApprove = true;
        }

        this.hasEdit = false;
        this.hasDelete = false;
    }

    cancel(event) {
        this.router.navigateToRoute('list');
    }

    approve(event) {
        if (confirm("Apakah Anda yakin ingin menyetujui Nota Intern ini?")) {
            this.service.approve(this.data.Id)
                .then(result => {
                    alert("Nota Intern berhasil di-approve.");
                    this.cancel();
                })
                .catch(e => {
                    alert(e.message || e);
                });
        }
    }
}
