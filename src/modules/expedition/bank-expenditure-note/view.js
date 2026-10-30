import { inject, Lazy, bindable } from 'aurelia-framework';
import { Router } from 'aurelia-router';
import Service from './service';
import { Dialog } from '../../../au-components/dialog/dialog'
import { Base64Helper } from '../../../utils/base-64-coded-helper';
import numeral from 'numeral';

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
    controlOptions1 = {
        label: {
            length: 4,
        }
    };

    sortingControlOptions = {
        label: {
            length: 5,
            align: "right"
        },
        control: {
            length: 7,
        }
    };

    sortingTypeControlOptions = {
        control: {
            length: 8,
        }
    };

    sortingOptions = ["", "No. SPB", "Tanggal SPB", "Tanggal Jatuh Tempo", "Nomor Invoice"];
    sortingTypeOptions = ["A - Z", "Z - A"];

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
            columns: ['No. SPB', 'Tanggal SPB', 'Tanggal Jatuh Tempo', 'Nomor BTU', 'Nomor Invoice', 'Supplier', 'Category', 'Divisi', 'PPN', 'PPh', 'Total Harga ((DPP + PPN) - PPh)', 'Mata Uang', 'Jumlah yang telah dibayar', 'Jumlah dibayar ke Supplier', 'Saldo Hutang', ''],
        };
    }

    bind() {
        this.selectedSortOption = "";
        this.selectedSortTypeOption = "A - Z";
    }

    bankView = "";
    async activate(params) {
        const decoded = Base64Helper.decode(params.id);
        var id = decoded;
        this.data = await this.service.getById(id);
        const supplierName = this.data.Supplier ? (this.data.Supplier.name || this.data.Supplier.Name) : "";
        for (var a of this.data.Details) {
            a.SupplierName = a.SupplierName || supplierName;
            a.Currency = this.data.Bank.Currency.Code;
            a.PaymentDifference = a.TotalPaid - (a.AmountPaid + a.SupplierPayment);
        }

        if (this.data.IsPosted) {
            this.editCallback = undefined;
            this.deleteCallback = undefined;
        }

        this.IDR = false;
        this.sameCurrency = false;
        let baseGrandTotal = (this.data.GrandTotal || 0) + (this.data.OtherExpense || 0);
        this.GrandTotal = baseGrandTotal;
        if (this.data.Bank.Currency.Code == "IDR") {
            this.IDR = true;
            if (this.data.CurrencyCode == "IDR") {
                this.sameCurrency = true;
            }
            this.GrandTotal = baseGrandTotal * this.data.CurrencyRate;

        }

        if (!this.IDR || this.sameCurrency) {
            this.collection = {
                columns: ['No. SPB', 'Tanggal SPB', 'Tanggal Jatuh Tempo', 'Nomor BTU', 'Nomor Invoice', 'Supplier', 'Category', 'Divisi', 'PPN', 'PPh', 'Total Harga ((DPP + PPN) - PPh)', 'Mata Uang', 'Jumlah yang telah dibayar', 'Jumlah dibayar ke Supplier', 'Saldo Hutang', ''],
            };
        } else {
            this.collection = {
                columns: ['No. SPB', 'Tanggal SPB', 'Tanggal Jatuh Tempo', 'Nomor BTU', 'Nomor Invoice', 'Supplier', 'Category', 'Divisi', 'PPN', 'PPh', 'Total Harga ((DPP + PPN) - PPh)', 'Mata Uang', 'Total Harga ((DPP + PPN) - PPh) (IDR)', 'Mata Uang', 'Jumlah yang telah dibayar', 'Jumlah dibayar ke Supplier', 'Saldo Hutang', ''],
            };
        }
        this.collectionOptions = {
            IDR: this.IDR,
            rate: this.data.CurrencyRate,
            SameCurrency: this.sameCurrency
        };
        this.bankView = this.data.Bank.AccountName ? `${this.data.Bank.AccountName} - A/C : ${this.data.Bank.AccountNumber}` : '';
        this.data.OtherExpense=numeral(this.data.OtherExpense).format("0,000.00");
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

    _selectedSortOption = "";
    get selectedSortOption() {
        return this._selectedSortOption;
    }
    set selectedSortOption(val) {
        this._selectedSortOption = val;
        this.sortItems();
    }

    _selectedSortTypeOption = "A - Z";
    get selectedSortTypeOption() {
        return this._selectedSortTypeOption;
    }
    set selectedSortTypeOption(val) {
        this._selectedSortTypeOption = val;
        this.sortItems();
    }

    sortItems() {
        if (!this.data || !this.data.Details || this.data.Details.length === 0) return;

        let sortOption = this.selectedSortOption;
        let isAsc = (this.selectedSortTypeOption || "A - Z") !== "Z - A";

        let sorted = [...this.data.Details].sort((item1, item2) => {
            let val1, val2;
            switch (sortOption) {
                case "Tanggal SPB":
                case "Tanggal Invoice":
                    val1 = item1.UPODate ? new Date(item1.UPODate).getTime() : 0;
                    val2 = item2.UPODate ? new Date(item2.UPODate).getTime() : 0;
                    break;
                case "Tanggal Jatuh Tempo":
                    val1 = item1.DueDate ? new Date(item1.DueDate).getTime() : 0;
                    val2 = item2.DueDate ? new Date(item2.DueDate).getTime() : 0;
                    break;
                case "Nomor Invoice":
                    val1 = (item1.InvoiceNo || "").toString().toLowerCase();
                    val2 = (item2.InvoiceNo || "").toString().toLowerCase();
                    break;
                case "No. SPB":
                default:
                    val1 = (item1.UnitPaymentOrderNo || "").toString().toLowerCase();
                    val2 = (item2.UnitPaymentOrderNo || "").toString().toLowerCase();
                    break;
            }

            if (val1 < val2) return isAsc ? -1 : 1;
            if (val1 > val2) return isAsc ? 1 : -1;

            let no1 = (item1.UnitPaymentOrderNo || "").toString().toLowerCase();
            let no2 = (item2.UnitPaymentOrderNo || "").toString().toLowerCase();
            if (no1 < no2) return isAsc ? -1 : 1;
            if (no1 > no2) return isAsc ? 1 : -1;
            return 0;
        });

        const collection = this.ItemsCollection;
        this.data.Details = [];
        if (collection) {
            collection.items = [];
            collection.buildContext();
        }
        setTimeout(() => {
            this.data.Details = sorted;
            if (collection) {
                collection.items = sorted;
                collection.buildContext();
            }
        }, 10);
    }
}
