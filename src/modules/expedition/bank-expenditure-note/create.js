import { inject, bindable, computedFrom } from 'aurelia-framework';
import { Dialog } from '../../../components/dialog/dialog';
import { Router } from 'aurelia-router';
import { AzureService } from './service';
import { activationStrategy } from 'aurelia-router';

import SupplierLoader from '../../../loader/supplier-loader';
import BankLoader from '../../../loader/account-banks-loader';

import CurrencyLoader from '../../../loader/garment-currency-loader';

import Service from './service';

@inject(Router, Service, Dialog)
export class Create {
    controlOptions = {
        label: {
            length: 4,
        },
        control: {
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
        saveText: 'Simpan',
    };

    constructor(router, service, dialog) {
        this.router = router;
        this.service = service;
        this.dialog = dialog;
        this.data = { OtherExpense: 0 };
        this.grandTotal = 0;
        this.typingOtherExpense = null;
        if (!this.IDR || this.sameCurrency) {
            this.collection = {
                columns: ['__check', 'No. SPB', 'Tanggal SPB', 'Tanggal Jatuh Tempo', 'Nomor BTU', 'Nomor Invoice', 'Supplier', 'Category', 'Divisi', 'PPN', 'PPh', 'Total Harga ((DPP + PPN) - PPh)', 'Mata Uang', 'Jumlah yang telah dibayar', 'Jumlah dibayar ke Supplier', 'Saldo Hutang', ''],
            };
        } else {
            this.collection = {
                columns: ['__check', 'No. SPB', 'Tanggal SPB', 'Tanggal Jatuh Tempo', 'Nomor BTU', 'Nomor Invoice', 'Supplier', 'Category', 'Divisi', 'PPN', 'PPh', 'Total Harga ((DPP + PPN) - PPh)', 'Mata Uang', 'Total Harga ((DPP + PPN) - PPh) (IDR)', 'Mata Uang', 'Jumlah yang telah dibayar', 'Jumlah dibayar ke Supplier', 'Saldo Hutang', ''],
            };
        }
        this.collectionOptions = {
            IDR: this.IDR,
            rate: this.data.CurrencyRate,
            SameCurrency: this.sameCurrency,
            onCheck: () => this.calculateGrandTotal(),
            onPaymentChange: () => this.calculateGrandTotal()
        };
        this.itemOptions = this.collectionOptions;

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

    determineActivationStrategy() {
        return activationStrategy.replace;
    }

    cancelCallback(event) {
        this.router.navigateToRoute('list');
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

    saveCallback(event) {
        this.data.Details = this.UPOResults.filter((detail) => detail.Select);
        const supplierName = this.data.Supplier ? (this.data.Supplier.name || this.data.Supplier.Name) : "";
        const supplierCode = this.data.Supplier ? (this.data.Supplier.code || this.data.Supplier.Code) : "";
        for (let detail of this.data.Details) {
            detail.SupplierName = detail.SupplierName || supplierName;
            detail.SupplierCode = detail.SupplierCode || supplierCode;
        }
        if (this.data.CurrencyRate == "") {
            this.data.CurrencyRate = 0;
        }
        const otherExpense = (this.typingOtherExpense !== null && this.typingOtherExpense !== undefined)
            ? this.typingOtherExpense
            : (Number(this.data && this.data.OtherExpense) || 0);
        this.data.OtherExpense = otherExpense;

        var dataPrep = this.data;
        this.dialog.prompt("Apakah anda yakin akan menyimpan data?", "Simpan Data")
            .then(response => {
                if (response == "ok") {
                    this.service.create(this.data)
                        .then(result => {
                            alert('Data berhasil dibuat');
                            this.router.navigateToRoute('create', {}, { replace: true, trigger: true });
                        })
                        .catch(e => {
                            this.error = e;
                        });
                }
            });
    }

    get supplierLoader() {
        return SupplierLoader;
    }

    get bankLoader() {
        return BankLoader;
    }

    get currencyLoader() {
        return CurrencyLoader;
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

        const collection = this.ItemsCollectionRate || this.ItemsCollection;
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

    @bindable selectedSupplier;
    async selectedSupplierChanged(newVal, oldVal) {
        this.data.Supplier = newVal;
        if (newVal) {
            if (this.selectedBank && this.selectedBank.Currency.Code) {
                var currency = this.data.CurrencyCode ? this.data.CurrencyCode : this.selectedBank.Currency.Code;
                let arg = {
                    page: 1,
                    size: Number.MAX_SAFE_INTEGER,
                    filter: JSON.stringify({ "Position": 7, "SupplierCode": newVal.code, "Currency": currency, "IsPaid": false }) //CASHIER DIVISION
                };

                this.UPOResults = await this.service.searchAllByPosition(arg)
                    .then((result) => {
                        let resultData = result.data && result.data.length > 0 ? result.data.filter((datum) => datum.PaymentMethod && datum.PaymentMethod.toLowerCase() != "cash" && datum.IsPosted == true) : [];

                        return this.formatUPOResults(resultData);
                    });
                this.sortItems();
            }
        } else {
            // if (this.selectedBank && this.selectedBank.Currency.Code) {
            //     let arg = {
            //         page: 1,
            //         size: Number.MAX_SAFE_INTEGER,
            //         filter: JSON.stringify({ "Position": 7, "Currency": this.selectedBank.Currency.Code, "IsPaid": false }) //CASHIER DIVISION
            //     };

            //     this.UPOResults = await this.service.searchAllByPosition(arg)
            //         .then((result) => {
            //             let resultData = result.data && result.data.length > 0 ? result.data.filter((datum) => datum.PaymentMethod && datum.PaymentMethod.toLowerCase() != "cash") : [];

            //             return resultData;
            //         });
            // }

            this.UPOResults = [];
        }
        Object.assign(this.collectionOptions, {
            IDR: this.IDR,
            rate: this.data.CurrencyRate,
            SameCurrency: this.sameCurrency
        });
        this.calculateGrandTotal();
    }

    @computedFrom("selectedBank", "selectedSupplier")
    get isExistBankAndSupplier() {
        if (this.selectedBank && this.selectedSupplier)
            return true;
        else
            return false;
    }

    @bindable selectedBank;
    // isExistBankAndSupplier = false;
    UPOResults = [];
    currency = "";
    @bindable grandTotal = 0;
    async selectedBankChanged(newVal) {
        this.data.Bank = newVal;
        this.IDR = false;
        if (newVal) {
            console.log(newVal);
            if (this.selectedSupplier) {
                let arg = {
                    page: 1,
                    size: Number.MAX_SAFE_INTEGER,
                    filter: this.selectedSupplier && this.selectedSupplier.code ? JSON.stringify({ "Position": 7, "SupplierCode": this.selectedSupplier.code, "Currency": newVal.Currency.Code, "IsPaid": false }) : JSON.stringify({ "Position": 7, "Currency": newVal.Currency.Code, "IsPaid": false }) //CASHIER DIVISION
                };

                this.UPOResults = await this.service.searchAllByPosition(arg)
                    .then((result) => {
                        let resultData = result.data && result.data.length > 0 ? result.data.filter((datum) => datum.PaymentMethod && datum.PaymentMethod.toLowerCase() != "cash" && datum.IsPosted == true) : [];

                        return this.formatUPOResults(resultData);
                    });
                this.sortItems();
            }


            // this.isExistBankAndSupplier = true;
            this.currency = newVal.Currency.Code;
            if (this.currency == "IDR") {
                this.IDR = true;
            }
            if (!this.IDR || this.sameCurrency) {
                this.collection = {
                  columns: ['__check', 'No. SPB', 'Tanggal SPB', 'Tanggal Jatuh Tempo', 'Nomor BTU', 'Nomor Invoice', 'Supplier', 'Category', 'Divisi', 'PPN', 'PPh', 'Total Harga ((DPP + PPN) - PPh)', 'Mata Uang', 'Jumlah yang telah dibayar', 'Jumlah dibayar ke Supplier', 'Saldo Hutang', ''],
                };

                this.data.CurrencyCode = this.currency;
                this.data.CurrencyId = newVal.Id;
                this.data.CurrencyRate = newVal.Currency.Rate;
            } else {
                this.collection = {
                  columns: ['__check', 'No. SPB', 'Tanggal SPB', 'Tanggal Jatuh Tempo', 'Nomor BTU', 'Nomor Invoice', 'Supplier', 'Category', 'Divisi', 'PPN', 'PPh', 'Total Harga ((DPP + PPN) - PPh)', 'Mata Uang', 'Total Harga ((DPP + PPN) - PPh) (IDR)', 'Mata Uang', 'Jumlah yang telah dibayar', 'Jumlah dibayar ke Supplier', 'Saldo Hutang', ''],
                };
            }
            Object.assign(this.collectionOptions, {
                IDR: this.IDR,
                rate: this.data.CurrencyRate,
                SameCurrency: this.sameCurrency
            });
            this.calculateGrandTotal();
        } else {
            this.currency = "";
            this.UPOResults = [];
            this.data.CurrencyCode = "";
            this.data.CurrencyId = 0;
            this.data.CurrencyRate = 0;
            this.data.Supplier = null;
            this.selectedCurrency = null;
            this.selectedSupplier = null;
            this.calculateGrandTotal();
        }
    }

    @bindable selectedCurrency;
    async selectedCurrencyChanged(newVal) {
        this.sameCurrency = false;
        this.data.CurrencyRate = 0;
        if (newVal) {
            this.data.CurrencyCode = newVal.code;
            this.data.CurrencyId = newVal.Id;
            if (newVal.code == "IDR") {
                this.sameCurrency = true;
                this.data.CurrencyRate = 1;
            }

            Object.assign(this.collectionOptions, {
                IDR: this.IDR,
                rate: this.data.CurrencyRate,
                SameCurrency: this.sameCurrency
            });
            this.calculateGrandTotal();
            if (this.selectedSupplier) {
                let arg = {
                    page: 1,
                    size: Number.MAX_SAFE_INTEGER,
                    filter: this.selectedSupplier && this.selectedSupplier.code ? JSON.stringify({ "Position": 7, "SupplierCode": this.selectedSupplier.code, "Currency": newVal.code, "IsPaid": false }) : JSON.stringify({ "Position": 7, "Currency": newVal.code, "IsPaid": false }) //CASHIER DIVISION
                };

                this.UPOResults = await this.service.searchAllByPosition(arg)
                    .then((result) => {
                        let resultData = result.data && result.data.length > 0 ? result.data.filter((datum) => datum.PaymentMethod && datum.PaymentMethod.toLowerCase() != "cash" && datum.IsPosted == true) : [];

                        return this.formatUPOResults(resultData);
                    });
                this.sortItems();
            }



            if (!this.IDR || this.sameCurrency) {
                this.collection = {
                  columns: ['__check', 'No. SPB', 'Tanggal SPB', 'Tanggal Jatuh Tempo', 'Nomor BTU', 'Nomor Invoice', 'Supplier', 'Category', 'Divisi', 'PPN', 'PPh', 'Total Harga ((DPP + PPN) - PPh)', 'Mata Uang', 'Jumlah yang telah dibayar', 'Jumlah dibayar ke Supplier', 'Saldo Hutang', ''],
                };
            } else {
                this.collection = {
                  columns: ['__check', 'No. SPB', 'Tanggal SPB', 'Tanggal Jatuh Tempo', 'Nomor BTU', 'Nomor Invoice', 'Supplier', 'Category', 'Divisi', 'PPN', 'PPh', 'Total Harga ((DPP + PPN) - PPh)', 'Mata Uang', 'Total Harga ((DPP + PPN) - PPh) (IDR)', 'Mata Uang', 'Jumlah yang telah dibayar', 'Jumlah dibayar ke Supplier', 'Saldo Hutang', ''],
                };
            }


            // this.ItemsCollection.bind();
            // this.ItemsCollectionRate.bind();
        } else {
            this.data.CurrencyCode = null;
            this.data.CurrencyId = 0;
            this.sameCurrency = false;
            this.data.CurrencyRate = 0;
            this.calculateGrandTotal();
        }
    }

    // @bindable selectedCurrency;
    // async selectedCurrencyChanged(newVal) {
    //     this.sameCurrency = false;
    //     this.data.CurrencyRate = 0;
    //     if (newVal) {
    //         this.data.CurrencyCode = newVal.code;
    //         this.data.CurrencyId = newVal.Id;
    //         if (newVal.code == "IDR") {
    //             this.sameCurrency = true;
    //             this.data.CurrencyRate = 1;
    //         }

    //         this.collectionOptions = Object.assign({}, {
    //             IDR: this.IDR,
    //             rate: this.data.CurrencyRate,
    //             SameCurrency: this.sameCurrency
    //         });
    //         if (this.selectedSupplier) {
    //             let arg = {
    //                 page: 1,
    //                 size: Number.MAX_SAFE_INTEGER,
    //                 filter: this.selectedSupplier && this.selectedSupplier.code ? JSON.stringify({ "Position": 7, "SupplierCode": this.selectedSupplier.code, "Currency": newVal.code, "IsPaid": false }) : JSON.stringify({ "Position": 7, "Currency": newVal.code, "IsPaid": false }) //CASHIER DIVISION
    //             };

    //             this.UPOResults = await this.service.searchAllByPosition(arg)
    //                 .then((result) => {
    //                     let resultData = result.data && result.data.length > 0 ? result.data.filter((datum) => datum.PaymentMethod && datum.PaymentMethod.toLowerCase() != "cash") : [];

    //                     return resultData;
    //                 });
    //         }



    //         if (!this.IDR || this.sameCurrency) {
    //             this.collection = {
    //                 columns: ['__check', 'No. SPB', 'Tanggal SPB', 'Tanggal Jatuh Tempo', 'Nomor Invoice', 'Supplier', 'Category', 'Divisi', 'PPN', 'PPh', 'Total Harga ((DPP + PPN) - PPh)', 'Mata Uang', ''],
    //             };
    //         }
    //         else {
    //             this.collection = {
    //                 columns: ['__check', 'No. SPB', 'Tanggal SPB', 'Tanggal Jatuh Tempo', 'Nomor Invoice', 'Supplier', 'Category', 'Divisi', 'PPN', 'PPh', 'Total Harga ((DPP + PPN) - PPh)', 'Mata Uang', 'Total Harga ((DPP + PPN) - PPh) (IDR)', 'Mata Uang', ''],
    //             };
    //         }


    //         // this.ItemsCollection.bind();
    //         // this.ItemsCollectionRate.bind();
    //     }
    //     else {
    //         this.data.CurrencyCode = null;
    //         this.data.CurrencyId = 0;
    //         this.sameCurrency = false;
    //         this.data.CurrencyRate = 0;
    //     }
    // }

    async rateChanged(e) {
        this.data.CurrencyRate = parseFloat(e.srcElement.value);
        Object.assign(this.collectionOptions, {
            IDR: this.IDR,
            rate: parseFloat(e.srcElement.value),
            SameCurrency: this.sameCurrency
        });
        if (this.selectedBank && this.selectedBank.Currency.Code && this.selectedSupplier) {
            let arg = {
                page: 1,
                size: Number.MAX_SAFE_INTEGER,
                filter: JSON.stringify({ "Position": 7, "SupplierCode": this.selectedSupplier.code, "Currency": this.selectedBank.Currency.Code, "IsPaid": false }) //CASHIER DIVISION
            };

            if (this.selectedSupplier) {
                this.UPOResults = await this.service.searchAllByPosition(arg)
                .then((result) => {
                    let resultData = result.data && result.data.length > 0 ? result.data.filter((datum) => datum.PaymentMethod && datum.PaymentMethod.toLowerCase() != "cash" && datum.IsPosted == true) : [];

                    return this.formatUPOResults(resultData);
                });
                this.sortItems();
            }
        }
        this.calculateGrandTotal();
    }

    formatUPOResults(resultData) {
        if (!resultData || resultData.length === 0) return [];
        for (let datum of resultData) {
            if (datum.Select === undefined) datum.Select = false;
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
            if (datum.SupplierPayment === undefined || datum.SupplierPayment === null || Number(datum.SupplierPayment) <= 0) {
                datum.SupplierPayment = remaining;
            }
            datum.PaymentDifference = totalPaid - (amountPaid + Number(datum.SupplierPayment));
        }
        return resultData;
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

    bankView(bank) {
        return bank.AccountName ? `${bank.AccountName} - A/C : ${bank.AccountNumber}` : '';
    }

    currencyView(currency) {
        return `${currency.code}`;
    }
}
