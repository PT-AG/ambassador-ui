import { inject, Lazy } from 'aurelia-framework';
import { Router } from 'aurelia-router';
import { Service } from './service';
import { Dialog } from '../../../au-components/dialog/dialog';
import { Base64Helper } from "../../../utils/base-64-coded-helper";

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
        this.itemOptions={
            readOnly: true
        }

        if (this.data.IsPosted) {
            this.editCallback = undefined;
            this.deleteCallback = undefined;
        }
    }

    bankView = (bank) => {
        return bank.BankName + " " + bank.Currency.Code + " - " + bank.AccountNumber
    }

    list() {
        this.router.navigateToRoute('list');
    }

    cancelCallback(event) {
        this.list();
    }

    editCallback(event) {
        const encoded = Base64Helper.encode(this.data.Id);
        this.router.navigateToRoute("edit", { id: encoded });
    }

    deleteCallback(event) {
        this.dialog.prompt('Apakah anda yakin akan menghapus data ini?')
            .then(response => {
                if (response.ok) {
                    this.service.delete(this.data)
                        .then(result => {
                            this.list();
                        });
                }
            });
    }

    columns2 = [
         "No Realisasi","Tanggal Realisasi VB","Tipe VB", "Pemohon VB", "Bagian/Unit","Nominal Realisasi","Mata Uang","Keterangan"
    ];

    
    controlOptions = {
        label: {
            length: 4,
        },
        control: {
            length: 4,
        },
    };
    get grandTotal() {
        let result = 0;
        if (this.data && this.data.Items && this.data.Items.length > 0) {
            for (let detail of this.data.Items) {
                if (detail.VBRealizationAmount) {
                    result += Number(detail.VBRealizationAmount) || 0;
                }
            }
        }
        if (this.data && this.data.OtherExpense) {
            result += Number(this.data.OtherExpense) || 0;
        }
        this.data.GrandTotal = result;
        return result;
    }

    get currencyCode() {
        return (this.data && this.data.Currency && (this.data.Currency.Code || this.data.Currency.code)) ||
               (this.data && this.data.Bank && this.data.Bank.Currency && this.data.Bank.Currency.Code) || "";
    }
}
