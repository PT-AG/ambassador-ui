import { inject, Lazy, bindable } from 'aurelia-framework';
import { Router } from 'aurelia-router';
import { Dialog } from '../../../components/dialog/dialog'
import { Base64Helper } from '../../../utils/base-64-coded-helper';
import Service from './service';


@inject(Router, Service, Dialog)
export class Edit {

    controlOptions = {
        label: {
            length: 4,
        },
        control: {
            length: 4,
        },
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
        saveText: 'Simpan',
    };

    constructor(router, service, dialog) {
        this.router = router;
        this.service = service;
        this.dialog = dialog;
        this.grandTotal = 0;

        this.collection = {
            columns: ['__check', 'No. SPB', 'Tanggal SPB', 'Tanggal Jatuh Tempo', 'Nomor BTU', 'Nomor Invoice', 'Supplier', 'Category', 'Divisi', 'PPN', 'PPh', 'Total Harga ((DPP + PPN) - PPh)', 'Mata Uang', 'Jumlah yang telah dibayar', 'Jumlah dibayar ke Supplier', 'Selisih pembayaran', ''],
        };
    }

    bind() {
        this.error = {};
        this.typingOtherExpense = null;
        this.selectedSortOption = "";
        this.selectedSortTypeOption = "A - Z";
        this.calculateGrandTotal();
    }

    parseExpenseInput(val) {
        if (!val || typeof val !== "string") return 0;
        let trimmed = val.trim();
        if (trimmed === "" || trimmed === "-") return 0;

        if (trimmed.includes(",") && trimmed.includes(".")) {
            let lastComma = trimmed.lastIndexOf(",");
            let lastDot = trimmed.lastIndexOf(".");
            if (lastDot > lastComma) {
                trimmed = trimmed.replace(/,/g, "");
            } else {
                trimmed = trimmed.replace(/\./g, "").replace(",", ".");
            }
        } else if (trimmed.includes(",")) {
            let parts = trimmed.split(",");
            if (parts.length === 2 && parts[1].length !== 3) {
                trimmed = trimmed.replace(",", ".");
            } else {
                trimmed = trimmed.replace(/,/g, "");
            }
        } else if (trimmed.includes(".")) {
            let parts = trimmed.split(".");
            if (parts.length > 2) {
                trimmed = trimmed.replace(/\./g, "");
            }
        }

        let num = parseFloat(trimmed);
        return isNaN(num) ? 0 : num;
    }

    onOtherExpenseFocus(event) {
        if (event && event.target && typeof event.target.select === "function") {
            event.target.select();
        }
    }

    onOtherExpenseInput(event) {
        if (event && event.target) {
            let val = event.target.value;
            this.typingOtherExpense = this.parseExpenseInput(val);
            this.calculateGrandTotal();
        }
    }

    onOtherExpenseBlur(event) {
        if (event && event.target) {
            let val = event.target.value;
            this.typingOtherExpense = this.parseExpenseInput(val);
        }
        let finalVal = (this.typingOtherExpense !== null && this.typingOtherExpense !== undefined)
            ? this.typingOtherExpense
            : (Number(this.data && this.data.OtherExpense) || 0);

        this.data.OtherExpense = finalVal;
        this.typingOtherExpense = null;
        this.calculateGrandTotal();
    }

    bankView = "";
    UPOResults = [];
    @bindable grandTotal = 0;
    async activate(params) {
        const decoded = Base64Helper.decode(params.id);
        var id = decoded;
        this.data = await this.service.getById(id);

        this.bankView = this.data.Bank.AccountName ? `${this.data.Bank.AccountName} - A/C : ${this.data.Bank.AccountNumber}` : '';

        this.UPOResults = this.data.Details.map((detail) => {
            detail.Select = true;
            return detail;
        });
        this.data.OtherExpense = parseFloat(this.data.OtherExpense) || 0;
        let arg = {
            page: 1,
            size: Number.MAX_SAFE_INTEGER,
            filter: this.data.Supplier && this.data.Supplier.code ? JSON.stringify({ "Position": 7, "Currency": this.data.Bank.Currency.Code, "SupplierCode": this.data.Supplier.code, "IsPaid": false }) : JSON.stringify({ "Position": 7, "Currency": this.data.Bank.Currency.Code, "IsPaid": false }) //CASHIER DIVISION
        };

        let existingUPONos = new Set(this.UPOResults.map(d => d.UnitPaymentOrderNo));
        let newData = await this.service.searchAllByPosition(arg)
            .then((result) => {
                let resultData = result.data && result.data.length > 0 ? result.data.filter((datum) => datum.PaymentMethod && datum.PaymentMethod.toLowerCase() != "cash" && datum.IsPosted == true && !existingUPONos.has(datum.UnitPaymentOrderNo)) : [];
                for (let datum of resultData) {
                    datum.Select = false;
                    let amountPaid = Number(datum.AmountPaid) || 0;
                    let totalPaid = Number(datum.TotalPaid) || 0;
                    if (!datum._incomeTaxDeducted && datum.IncomeTaxBy && datum.IncomeTaxBy.toUpperCase() == "SUPPLIER") {
                        totalPaid = totalPaid - (Number(datum.IncomeTax) || 0);
                        datum.TotalPaid = totalPaid;
                        datum._incomeTaxDeducted = true;
                    }
                    let remaining = totalPaid - amountPaid;
                    if (remaining <= 0 && totalPaid > 0) {
                        datum.AmountPaid = 0;
                        amountPaid = 0;
                        remaining = totalPaid;
                    }
                    datum.SupplierPayment = remaining;
                    datum.PaymentDifference = totalPaid - (amountPaid + remaining);
                }
                return resultData;
            });

        if (newData.length > 0) {
            this.UPOResults = this.UPOResults.concat(newData);
        }

        const supplierName = this.data.Supplier ? (this.data.Supplier.name || this.data.Supplier.Name) : "";
        for (var a of this.UPOResults) {
            a.SupplierName = a.SupplierName || supplierName;
            a.Currency = this.data.Bank.Currency.Code;
            let totalPaid = Number(a.TotalPaid) || 0;
            let amountPaid = Number(a.AmountPaid) || 0;
            let supplierPayment = Number(a.SupplierPayment) || 0;
            if (supplierPayment <= 0 && totalPaid > 0) {
                let remaining = totalPaid - amountPaid;
                if (remaining <= 0) {
                    a.AmountPaid = 0;
                    amountPaid = 0;
                    remaining = totalPaid;
                }
                a.SupplierPayment = remaining;
                supplierPayment = remaining;
            }
            if (a.PaymentDifference === undefined || a.PaymentDifference === null) {
                a.PaymentDifference = totalPaid - (amountPaid + supplierPayment);
            }
        }

        this.IDR = false;
        this.sameCurrency = false;
        if (this.data.Bank.Currency.Code == "IDR") {
            this.IDR = true;
            if (this.data.CurrencyCode == "IDR") {
                this.sameCurrency = true;
            }

        }

        if (!this.IDR || this.sameCurrency) {
            this.collection = {
                columns: ['__check', 'No. SPB', 'Tanggal SPB', 'Tanggal Jatuh Tempo', 'Nomor BTU', 'Nomor Invoice', 'Supplier', 'Category', 'Divisi', 'PPN', 'PPh', 'Total Harga ((DPP + PPN) - PPh)', 'Mata Uang', 'Jumlah yang telah dibayar', 'Jumlah dibayar ke Supplier', 'Selisih pembayaran', ''],
            };
        }
        else {
            this.collection = {
                columns: ['__check', 'No. SPB', 'Tanggal SPB', 'Tanggal Jatuh Tempo', 'Nomor BTU', 'Nomor Invoice', 'Supplier', 'Category', 'Divisi', 'PPN', 'PPh', 'Total Harga ((DPP + PPN) - PPh)', 'Mata Uang', 'Total Harga ((DPP + PPN) - PPh) (IDR)', 'Mata Uang', 'Jumlah yang telah dibayar', 'Jumlah dibayar ke Supplier', 'Selisih pembayaran', ''],
            };
        }
        this.collectionOptions = {
            IDR: this.IDR,
            rate: this.data.CurrencyRate,
            SameCurrency: this.sameCurrency,
            onCheck: () => this.calculateGrandTotal(),
            onPaymentChange: () => this.calculateGrandTotal()
        };
        this.calculateGrandTotal();
        console.log(this.data.OtherExpense);
    }

    cancelCallback(event) {
        const encoded = Base64Helper.encode(this.data.Id);
        this.router.navigateToRoute('view', { id: encoded });
        //this.router.navigateToRoute('view', { id: this.data.Id });
    }

    saveCallback(event) {
        this.data.Details = this.UPOResults.filter((detail) => detail.Select);
        const supplierName = this.data.Supplier ? (this.data.Supplier.name || this.data.Supplier.Name) : "";
        const supplierCode = this.data.Supplier ? (this.data.Supplier.code || this.data.Supplier.Code) : "";
        for (let detail of this.data.Details) {
            detail.SupplierName = detail.SupplierName || supplierName;
            detail.SupplierCode = detail.SupplierCode || supplierCode;
        }

        const otherExpense = (this.typingOtherExpense !== null && this.typingOtherExpense !== undefined)
            ? this.typingOtherExpense
            : (Number(this.data && this.data.OtherExpense) || 0);
        this.data.OtherExpense = otherExpense;

        var dataPrep = this.data;
        this.dialog.prompt("Apakah anda yakin akan menyimpan data?", "Simpan Data")
            .then(response => {
                if (response == "ok") {
                    this.service.update(this.data).then(result => {
                        this.cancelCallback();
                    }).catch(e => {
                        this.error = e;
                    })
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
        if (!this.UPOResults || this.UPOResults.length === 0) return;

        let sortOption = this.selectedSortOption;
        let isAsc = (this.selectedSortTypeOption || "A - Z") !== "Z - A";

        let sorted = [...this.UPOResults].sort((item1, item2) => {
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

        const collection = this.ItemsCollectionRate;
        this.UPOResults = [];
        if (collection) {
            collection.items = [];
            collection.buildContext();
        }
        setTimeout(() => {
            this.UPOResults = sorted;
            if (collection) {
                collection.items = sorted;
                collection.buildContext();
            }
            this.calculateGrandTotal();
        }, 10);
    }

    calculateGrandTotal() {
        let result = 0;
        let viewResult = 0;
        if (this.UPOResults && this.UPOResults.length > 0) {
            for (let detail of this.UPOResults) {
                if (detail.Select) {
                    let amount = (detail.SupplierPayment !== undefined && detail.SupplierPayment !== null)
                        ? Number(detail.SupplierPayment)
                        : (Number(detail.TotalPaid) - (Number(detail.AmountPaid) || 0));
                    result += Number(amount) || 0;
                    viewResult += ((Number(amount) || 0) * (Number(this.data && this.data.CurrencyRate) || 1));
                }
            }
        }
        this.data.GrandTotal = result;
        let other = (this.typingOtherExpense !== null && this.typingOtherExpense !== undefined)
            ? this.typingOtherExpense
            : (Number(this.data && this.data.OtherExpense) || 0);
        let total = result + other;
        let viewTotal = viewResult + (other * (Number(this.data && this.data.CurrencyRate) || 1));
        this.grandTotal = this.IDR ? viewTotal : total;
        return this.grandTotal;
    }

    onCheckAll(event) {
        let isChecked = event && event.detail && event.detail.target ? event.detail.target.checked : (event && event.target ? event.target.checked : false);
        if (this.UPOResults && this.UPOResults.length > 0) {
            for (var item of this.UPOResults) {
                item.Select = isChecked;
            }
        }
        this.calculateGrandTotal();
    }

    onTableChange(event) {
        this.calculateGrandTotal();
    }
}
