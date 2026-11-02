import { inject, bindable, computedFrom } from 'aurelia-framework';
import { Service } from './service';
import moment from 'moment';
const IncomeTaxLoader = require('../../../loader/vat-loader');
const AccountBankLoader = require('../../../loader/account-banks-loader');
const DivisionLoader = require('../../../loader/division-group-loader');

@inject(Service)
export class DataForm {
    @bindable title;
    @bindable readOnly;
    @bindable dateFrom;
    @bindable dateTo;
    @bindable incomeTax;
    @bindable bank;

    PPHTotal = 0;
    Currency = '';

    formOptions = {
        cancelText: "Kembali",
        saveText: "Simpan",
        deleteText: "Hapus",
        editText: "Ubah",
    };

    controlOptions = {
        label: {
            length: 4,
        },
        control: {
            length: 4,
        },
    };

    constructor(service) {
        this.service = service;
        this.calculateTotalPPHCallback = this.calculateTotalPPHCallback.bind(this);
    }

    bind(context) {
        this.context = context;
        this.data = this.context.data;
        this.error = this.context.error;

        this.cancelCallback = this.context.cancelCallback;
        this.deleteCallback = this.context.deleteCallback;
        this.editCallback = this.context.editCallback;
        this.saveCallback = this.context.saveCallback;

        this.columns = ['No. SPB', 'Tanggal SPB', 'Tanggal Jatuh Tempo', 'Nomor Invoice', 'Supplier', 'Category', 'Divisi', 'Pasal PPh', 'Rate PPh', 'PPh', 'PPN', 'Total Bayar (DPP + PPN)', 'Mata Uang', ''];

        if (!this.readOnly)
            this.columns.unshift('__check');

        if (this.data.Id && !this.readOnly) {
            this.isEdit = true;

            let info = {
                // incomeTaxName: this.data.IncomeTax.name,
                // incomeTaxRate: this.data.IncomeTax.rate,
                currency: this.data.Bank.Currency ? this.data.Bank.Currency.Code : this.data.Bank.currency.code
            };

            this.service.getUnitPaymentOrders(info)
                .then(response => {
                    this.data.UnitPaymentOrders.push(...response.data);
                });
        }

        if (this.isEdit || this.readOnly) {
            this.Currency = this.data.Bank.Currency ? this.data.Bank.Currency.Code : this.data.Bank.currency.code;
            this.calculateTotalPPHCallback();
        }

        this.options = {
            calculateTotalPPHCallback: this.calculateTotalPPHCallback
        };
    }

    dateFromChanged(newV, oldV) {
        this.data.dateFrom = newV;
        this.loadItems();
    }

    dateToChanged(newV, oldV) {
        this.data.dateTo = newV;
        this.loadItems();
    }

    // incomeTaxChanged(newV, olV) {
    //     if (newV) {
    //         this.data.IncomeTax = newV;
    //     }
    //     else {
    //         this.data.IncomeTax = undefined;
    //     }

    //     this.loadItems();
    // }

    bankChanged(newV, olV) {
        if (newV) {
            this.data.Bank = newV;
            this.data.Bank.code = this.data.Bank.bankCode;
            this.Currency = this.data.Bank.Currency ? this.data.Bank.Currency.Code : this.data.Bank.currency.code;
        }
        else {
            this.data.Bank = undefined;
            this.Currency = undefined;
        }

        this.loadItems();
    }

    loadItems() {
        if (this.data.dateFrom && this.data.dateFrom != 'Invalid Date'
            && this.data.dateTo && this.data.dateTo != 'Invalid Date'
            && this.data.Division
            /*&& this.data.IncomeTax*/ && this.data.Bank) {

            let info = {
                dateFrom: moment(this.data.dateFrom).format("MM/DD/YYYY"),
                dateTo: moment(this.data.dateTo).format("MM/DD/YYYY"),
                divisionCodes: this.data.Division.DivisionCodes.join(),
                // incomeTaxName: this.data.IncomeTax.name,
                // incomeTaxRate: this.data.IncomeTax.rate,
                currency: this.data.Bank.Currency.Code
            };

            console.log(info)
            this.service.getUnitPaymentOrders(info)
                .then(response => {
                    this.data.UnitPaymentOrders = response.data;
                });
        }
    }

    bankView(bank) {
        return bank.AccountName ? `${bank.AccountName} - ${bank.BankName} - ${bank.AccountNumber} - ${bank.Currency.Code}` : bank.accountName ? `${bank.accountName} - ${bank.bankName} - ${bank.accountNumber} - ${bank.currency.code}` : '';
    }

    // incomeTaxView = (incomeTax) => {
    //     return `${incomeTax.name} - ${incomeTax.rate}`
    // }

    onClickAllDataSource($event) {
        for (let item of this.data.UnitPaymentOrders) {
            item.Check = $event.detail.target.checked;
        }
    }

    calculateTotalPPHCallback() {
        this.PPHTotal = this.data.UnitPaymentOrders
            .filter(p => p.Check === true || this.readOnly)
            .reduce((p, c) => p + c.IncomeTax, 0);
    }

    // get incomeTaxLoader() {
    //     return IncomeTaxLoader;
    // }

    get accountBankLoader() {
        return AccountBankLoader;
    }

    get divisionLoader() {
        return DivisionLoader;
    }

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
        if (!this.data || !this.data.UnitPaymentOrders || this.data.UnitPaymentOrders.length === 0) return;

        let sortOption = this.selectedSortOption;
        let isAsc = (this.selectedSortTypeOption || "A - Z") !== "Z - A";

        let sorted = [...this.data.UnitPaymentOrders].sort((item1, item2) => {
            let val1, val2;
            switch (sortOption) {
                case "Tanggal SPB":
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
                    val1 = (item1.No || item1.UnitPaymentOrderNo || "").toString().toLowerCase();
                    val2 = (item2.No || item2.UnitPaymentOrderNo || "").toString().toLowerCase();
                    break;
            }

            if (val1 < val2) return isAsc ? -1 : 1;
            if (val1 > val2) return isAsc ? 1 : -1;

            let no1 = (item1.No || item1.UnitPaymentOrderNo || "").toString().toLowerCase();
            let no2 = (item2.No || item2.UnitPaymentOrderNo || "").toString().toLowerCase();
            if (no1 < no2) return isAsc ? -1 : 1;
            if (no1 > no2) return isAsc ? 1 : -1;
            return 0;
        });

        const collection = this.ItemsCollection || (this.context && this.context.ItemsCollection);
        this.data.UnitPaymentOrders = [];
        if (collection) {
            collection.items = [];
            collection.buildContext();
        }
        setTimeout(() => {
            this.data.UnitPaymentOrders = sorted;
            if (collection) {
                collection.items = sorted;
                collection.buildContext();
            }
        }, 10);
    }
}
