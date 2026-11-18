import { inject, Lazy } from 'aurelia-framework';
import { Router } from 'aurelia-router';
import { Service } from './service';
import { Base64Helper } from '../../../utils/base-64-coded-helper';


@inject(Router, Service)
export class View {
    
    constructor(router, service) {
        this.router = router;
        this.service = service;
        this.hasCancel = true;
        this.hasEdit = true;
        this.hasDelete = true;
        this.hasRebudget = false;
    }

    async activate(params) {
        const decoded = Base64Helper.decode(params.id);
        var id = decoded;
        this.hasEdit = true;
        this.hasDelete = true;
        this.data = await this.service.getById(id);
        this.currency = this.data.currency;
        this.supplier = this.data.supplier;
        this.data.isView = true;
        const today = new Date();
        const firstDayOfCurrentMonth = new Date(
            today.getFullYear(),
            today.getMonth(),
            1
        );
        const inDate = new Date(this.data.inDate);
        this.hasDelete = !(inDate < firstDayOfCurrentMonth);
        if (!this.data.isEdit){
            this.hasEdit = false;
            this.hasDelete = false;
        }

        if(this.data.isPosted){
            this.hasEdit = false;
            this.hasDelete = false;
        }

        if(!this.data.IsApprovedBudget1 && this.data.IsApprovedVerification && this.data.ReasonRejected != null 
            && this.data.Position == 4 && this.data.BudgetSubmissionDate == null){
            this.hasRebudget = true;
        }
    }

    cancel(event) {
        this.router.navigateToRoute('list');
    }

    edit(event) {
        const encoded = Base64Helper.encode(this.data.Id);
        this.router.navigateToRoute('edit', { id: encoded });
    }

    delete(event) {
        this.service.delete(this.data).then(result => {
            this.cancel();
        });
    }

    rebudget(event) {
        if (confirm("Ajukan Budget Bulan Depan?")) {
            this.service.rebudget(this.data.Id)
                .then(result => {
                    this.cancel(event);
                })
                .catch(e => {
                    this.error = e;
                    if (e.statusCode === 500) {
                        alert("Gagal menyimpan, silakan coba lagi!");
                    }
                });
        }
    }
}
