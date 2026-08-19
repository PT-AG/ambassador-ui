import { inject, Lazy } from 'aurelia-framework';
import { Router } from 'aurelia-router';
import { Service } from './service';
import { Dialog } from '../../../au-components/dialog/dialog';
import { Base64Helper } from '../../../utils/base-64-coded-helper';

@inject(Router, Service, Dialog)
export class View {
    constructor(router, service, dialog) {
        this.router = router;
        this.service = service;
        this.dialog = dialog;
    }

    async activate(params) {
        const decoded = Base64Helper.decode(params.id);
        let id = decoded;
        this.data = await this.service.getById(id);
        this.data.UnitPaymentOrders = this.data.PPHBankExpenditureNoteItems;
        this.bank = this.data.Bank;
        this.incomeTax = this.data.IncomeTax;
        if(!this.incomeTax.rate)
            this.incomeTax.rate = this.incomeTax.Rate;
        if (this.data.IsPosted) {
            this.editCallback = undefined;
            this.deleteCallback = undefined;
        }
    }

    list() {
        this.router.navigateToRoute('list');
    }

    cancelCallback(event) {
        this.list();
    }

    editCallback(event) {
        const encoded = Base64Helper.encode(this.data.Id);
        this.router.navigateToRoute('edit', { id: encoded });
    }

    deleteCallback(event) {
        this.dialog.prompt('Apakah anda yakin mau menghapus data ini?', 'Hapus Data Bukti Pengeluaran Bank PPH')
            .then(response => {
                if (response.ok) {
                    this.service.delete(this.data)
                        .then(result => {
                            this.list();
                        });
                }
            });
    }
}
