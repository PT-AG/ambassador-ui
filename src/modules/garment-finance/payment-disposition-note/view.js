import { inject, Lazy } from 'aurelia-framework';
import { Router } from 'aurelia-router';
import Service from './service';
import { Dialog } from '../../../au-components/dialog/dialog'
import { Base64Helper } from '../../../utils/base-64-coded-helper';


@inject(Router, Service, Dialog)
export class View {
    controlOptions = {
        label: {
            length: 4,
        },
        control: {
            length: 4,
        },
    };

    formOptions = {
        cancelText: 'Kembali',
        editText: 'Ubah',
        deleteText: 'Hapus'
    };

    constructor(router, service, dialog) {
        this.router = router;
        this.service = service;
        this.dialog = dialog;

        this.collection = {
            columns: ['No. Disposisi', 'Tanggal Disposisi', 'Tanggal Jatuh Tempo', 'Nomor Proforma/Invoice', 'Supplier', 'Kategori', 'PPN', 'Total Pembayaran', 'Total Yang sudah dibayar', 'Total Yang dibayar', 'Selisih Total Yang Dibayar', 'Mata Uang'],
        };
    }

    get isIDR() {
        return this.data && this.data.AccountBank && this.data.AccountBank.Currency && this.data.AccountBank.Currency.Code === "IDR";
    }

    get Amount() {
        let totalAmount = 0;
        let totalAmountIDR = 0;
        let rate = (this.data && (this.data.CurrencyCode === "IDR" || !this.data.CurrencyRate)) ? 1 : (this.data && Number(this.data.CurrencyRate) || 1);
        if (this.data && this.data.Items) {
            for (var a of this.data.Items) {
                let payment = Number(a.TotalPaidPayment) || 0;
                totalAmount += payment;
                totalAmountIDR += payment * rate;
            }
        }
        let otherExpense = this.data ? (Number(this.data.OtherExpense) || 0) : 0;
        if (this.isIDR) {
            return totalAmountIDR + (otherExpense * rate);
        } else {
            return totalAmount + otherExpense;
        }
    }

    async activate(params) {
        const decoded = Base64Helper.decode(params.id);
        var id = decoded;
        this.data = await this.service.getById(id);
        for (var a of this.data.Items) {
            a.SupplierName = this.data.Supplier ? this.data.Supplier.Name : a.SupplierName;
            a.Currency = this.data.AccountBank && this.data.AccountBank.Currency ? this.data.AccountBank.Currency.Code : a.CurrencyCode;
            let totalPaid = Number(a.TotalPaid) || 0;
            let totalPaidPayment = Number(a.TotalPaidPayment) || 0;
            let totalPaidPaymentBefore = Number(a.TotalPaidPaymentBefore) || 0;
            a.TotalPaidPaymentAccumulated = parseFloat((totalPaidPaymentBefore + totalPaidPayment).toFixed(4));
            a.DiffTotalPaidPayment = parseFloat((totalPaid - a.TotalPaidPaymentAccumulated).toFixed(4));
        }

        // if (this.data.AccountBank.Currency.Code == "IDR") {
        //     this.IDR = true;
        //     if (this.data.CurrencyCode == "IDR") {
        //         this.sameCurrency = true;
        //     }
        //     this.Amount = this.data.Amount * this.data.CurrencyRate;

        // }

        // this.collection = {
        //     columns: ['No. Disposisi', 'Tanggal Disposisi', 'Tanggal Jatuh Tempo', 'Nomor Proforma/Invoice', 'Supplier', 'Kategori', 'PPN', 'Total Pembayaran','Total Yang dibayar','Total Yang sudah dibayar', 'Mata Uang', ''],
        // };

        // if (!this.IDR || this.sameCurrency) {
        //     this.collection = {
        //         columns: ['No. Disposisi', 'Tanggal Disposisi', 'Tanggal Jatuh Tempo', 'Nomor Proforma/Invoice', 'Supplier', 'Kategori', 'Divisi', 'PPN', 'Jumlah dibayar ke Supplier', 'Mata Uang', ''],
        //     };
        // } else {
        //     this.collection = {
        //         columns: ['No. Disposisi', 'Tanggal Disposisi', 'Tanggal Jatuh Tempo', 'Nomor Proforma/Invoice', 'Supplier', 'Kategori', 'Divisi', 'PPN', 'Jumlah dibayar ke Supplier', 'Mata Uang', 'Jumlah dibayar ke Supplier(IDR)', 'Mata Uang', ''],
        //     };
        // }

        if (this.data.IsPosted) {
            this.editCallback = undefined;
            this.deleteCallback = undefined;
        }

        // this.collectionOptions = {
        //     IDR: this.IDR,
        //     rate: this.data.CurrencyRate,
        //     SameCurrency: this.sameCurrency,
        //     payToSupplierCurrency: this.data.CurrencyCode
        // };
    }

    cancelCallback(event) {
        this.router.navigateToRoute('list');
    }

    editCallback(event) {
            const encoded = Base64Helper.encode(this.data.Id);
            this.router.navigateToRoute('edit', { id: encoded });
    }

    deleteCallback(event) {
        this.dialog.prompt("Apakah anda yakin akan menghapus data?", "Hapus Data")
            .then(response => {
                if (response.ok) {
                    this.service.delete(this.data).then(result => {
                        this.cancelCallback();
                    });
                }
            });
    }
}