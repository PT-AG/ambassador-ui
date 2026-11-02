import { inject, bindable, computedFrom } from 'aurelia-framework';
import { Dialog } from '../../../components/dialog/dialog';
import { Router } from 'aurelia-router';
import { AzureService } from './service';
import { activationStrategy } from 'aurelia-router';

import SupplierLoader from '../../../loader/garment-supplier-loader';
import BankLoader from '../../../loader/account-banks-loader';

import CurrencyLoader from '../../../loader/garment-currencies-bi-by-latest-date-loader';
import Service from './service';

@inject(Router, Service, Dialog)
export class Create {
    controlOptions = {
        label: {
            length: 4,
        },
        control: {
            length: 4,
        },
    };

    transactionTypeOptions = ["", "Operasional", "Investasi"]

    formOptions = {
        cancelText: 'Kembali',
        saveText: 'Simpan',
    };

    @bindable totalPaymentTrigger = 0;
    typingOtherExpense = null;

    constructor(router, service, dialog) {
        this.router = router;
        this.service = service;
        this.dialog = dialog;
        this.data = {};
        this.collection = {
            columns: ['__check', 'No. Disposisi', 'Tanggal Disposisi', 'Tanggal Jatuh Tempo', 'Nomor Proforma/Invoice', 'Supplier', 'Kategori', 'PPN', 'Total Pembayaran', 'Total Yang sudah dibayar', 'Total Yang dibayar', 'Selisih Total Yang Dibayar', 'Mata Uang'],
        };
        

        this.collectionOptions = {
            IDR: this.IDR,
            rate: this.data.CurrencyRate,
            SameCurrency: this.sameCurrency,
            onPaymentChange: () => {
                this.totalPaymentTrigger++;
            }
        };

        this.sameCurrencyValue = true;
        this.bankCurrency = null;
        this.currencyCodeValue = null;
    }

    determineActivationStrategy() {
        return activationStrategy.replace;
    }

    cancelCallback(event) {
        this.router.navigateToRoute('list');
    }

    onCheckAll(event) {
        var isChecked = event.detail.target.checked;
        for (var item of this.Items) {
            item.Select = isChecked;
            var totalPaid = Number(item.TotalPaid) || 0;
            var before = Number(item.TotalPaidPaymentBefore) || 0;
            var remaining = Math.max(0, parseFloat((totalPaid - before).toFixed(4)));

            if (isChecked) {
                if ((Number(item.TotalPaidPayment) || 0) === 0) {
                    item.TotalPaidPayment = remaining;
                    var parts = remaining.toFixed(2).split('.');
                    item.displayTotalPaidPayment = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',') + '.' + parts[1];
                    item.TotalPaidPaymentAccumulated = parseFloat((before + remaining).toFixed(4));
                    item.DiffTotalPaidPayment = 0;
                }
            } else {
                item.TotalPaidPayment = 0;
                item.displayTotalPaidPayment = "0.00";
                item.TotalPaidPaymentAccumulated = before;
                item.DiffTotalPaidPayment = remaining;
            }
        }
        this.totalPaymentTrigger++;
    }

    onOtherExpenseInput(e) {
        let val = e && e.target ? e.target.value : '';
        let num = parseFloat(String(val).replace(/,/g, ''));
        this.typingOtherExpense = isNaN(num) ? 0 : num;
        this.totalPaymentTrigger++;
    }

    onOtherExpenseBlur(e) {
        if (this.typingOtherExpense !== null && this.typingOtherExpense !== undefined) {
            this.data.OtherExpense = this.typingOtherExpense;
        }
        this.typingOtherExpense = null;
        this.totalPaymentTrigger++;
    }

    onTableInput(e) {
        this.totalPaymentTrigger++;
    }

    onTableChange(e) {
        this.totalPaymentTrigger++;
    }

    saveCallback(event) {
        if (this.typingOtherExpense !== null && this.typingOtherExpense !== undefined) {
            this.data.OtherExpense = this.typingOtherExpense;
        }
        for (let item of this.Items) {
            if (item.typingPayment !== undefined && item.typingPayment !== null) {
                item.TotalPaidPayment = item.typingPayment;
                item.typingPayment = null;
            }
        }
        console.log(this.data);
        this.data.Items = this.Items.filter((item) => item.Select);
        if (this.data.Items.length === 0) {
            alert("Pilih minimal 1 data disposisi untuk dibayar");
            return;
        }
        var hasOverpaid = this.data.Items.some(item => (Number(item.TotalPaidPaymentAccumulated) || 0) > (Number(item.TotalPaid) || 0));
        if (hasOverpaid) {
            alert("Total yang dibayar tidak boleh melebihi Total Pembayaran");
            return;
        }
        if (this.data.CurrencyRate == "") {
            this.data.CurrencyRate = 0;
        }
        var dataPrep = this.data;

        this.dialog.prompt("Apakah anda yakin akan menyimpan data?", "Simpan Data")
            .then(response => {
                if (response == "ok") {
                    console.log("Datasaved",dataPrep);
                    
                    this.service.create(dataPrep)
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

    @bindable selectedSupplier;
    async selectedSupplierChanged(newVal, oldVal) {
        console.log("selected supplier",newVal);
        this.data.Supplier = newVal;
        if (newVal) {
            this.data.Supplier.Id = newVal.Id;
            this.data.Supplier.Name = newVal.name;
            this.data.Supplier.Code = newVal.code;
            this.data.Supplier.Import = newVal.import;
            if (this.selectedBank && this.selectedBank.Currency.Code) {
                var currency = this.data.CurrencyCode ? this.data.CurrencyCode : this.selectedBank.Currency.Code;
                let arg = {
                    page: 1,
                    size: 1000,
                    filter: JSON.stringify({ "CurrencyCode": currency, "SupplierId": newVal.Id, "IsPaid": false, "Position": "5" }),
                    CurrencyCode: currency,
                    SupplierId: newVal.Id,
                    Position: 5
                };
                await this.DispositionData(arg);
            }
            // this.collectionOptions = {
            //     IDR: this.IDR,
            //     rate: this.data.CurrencyRate,
            //     SameCurrency: this.sameCurrency
            // };
        }
    }

    @computedFrom("selectedBank && selectedSupplier")
    get isExistBankAndSupplier() {
        if (this.selectedBank && this.selectedSupplier)
            return true;
        else
            return false;
    }

    async DispositionData(arg) {
        // console.log("parameter search",arg)
        this.Items = await this.service.searchDispoEx(arg)
            .then((result) => {
                var expeditionDatas = [];
                console.log("dispoResult",result);
                for (var ex of result.data) {
                    ex.purchasingDispositionExpeditionId = ex.Id;
                    ex.Id = 0;
                    let totalPaid = Number(ex.TotalPaid) || 0;
                    let totalPaidPayment = Number(ex.TotalPaidPayment) || 0;
                    let totalPaidPaymentBefore = Number(ex.TotalPaidPaymentBefore) || 0;
                    let remaining = parseFloat((totalPaid - totalPaidPaymentBefore).toFixed(4));
                    // Hanya masukkan disposisi yang masih memiliki sisa tagihan yang belum lunas
                    if (remaining > 0) {
                        ex.TotalPaidPayment = totalPaidPayment;
                        ex.TotalPaidPaymentAccumulated = parseFloat((totalPaidPaymentBefore + totalPaidPayment).toFixed(4));
                        ex.DiffTotalPaidPayment = Math.max(0, parseFloat((totalPaid - ex.TotalPaidPaymentAccumulated).toFixed(4)));
                        let parts = totalPaidPayment.toFixed(2).split('.');
                        ex.displayTotalPaidPayment = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',') + '.' + parts[1];
                        expeditionDatas.push(ex);
                    }
                }
                console.log("expeditionDatas", expeditionDatas);
                return expeditionDatas;
            });
    }


    // isExistBankAndSupplier = false;
    Items = [];
    currency = "";
    @bindable selectedBank;
    async selectedBankChanged(newVal) {
        this.data.AccountBank = newVal;
     //   this.IDR = false;
        if (newVal) {
            if (this.selectedSupplier) {
                let arg = {
                    page: 1,
                    size: 1000,
                    filter: JSON.stringify({ "CurrencyCode": this.selectedBank.Currency.Code, "SupplierId": this.selectedSupplier.Id, "IsPaid": false, "Position": "5" }),
                    CurrencyCode: this.selectedCurrency.code,
                    SupplierId: this.selectedSupplier.Id,
                    Position: 5
                };
                await this.DispositionData(arg);
            }
            this.bankCurrency = newVal.Currency.Code;
            if (this.bankCurrency == "IDR" && this.currencyCodeValue != "IDR" && this.currencyCodeValue != null){
                this.sameCurrencyValue = false;
            }
            else{
                this.sameCurrencyValue = true;
            }
            //this.isExistBankAndSupplier = true;
            // this.currency = newVal.Currency.Code;
            // if (this.currency == "IDR") {
            //     this.IDR = true;
            // }
            // if (!this.IDR || this.sameCurrency) {
            //     this.collection = {
            //         columns: ['__check', 'No. Disposisi', 'Tanggal Disposisi', 'Tanggal Jatuh Tempo', 'Nomor Proforma/Invoice', 'Supplier', 'Kategori', 'Divisi', 'PPN', 'Jumlah dibayar ke Supplier', 'Mata Uang', ''],
            //     };

            //     this.data.CurrencyCode = this.currency;
            //     this.data.CurrencyId = newVal.Currency.Id;
            //     this.data.CurrencyRate = newVal.Currency.Rate;
            // } else {
            //     this.collection = {
            //         columns: ['__check', 'No. Disposisi', 'Tanggal Disposisi', 'Tanggal Jatuh Tempo', 'Nomor Proforma/Invoice', 'Supplier', 'Kategori', 'Divisi', 'PPN', 'Jumlah dibayar ke Supplier', 'Mata Uang', 'Jumlah dibayar ke Supplier(IDR)', 'Mata Uang', ''],
            //     };
            // }
            this.collectionOptions = {
                IDR: this.IDR,
                rate: this.data.CurrencyRate,
                SameCurrency: this.sameCurrency
            };
        } else {
            this.currency = "";
            this.Items = [];
            this.data.CurrencyCode = "";
            this.data.CurrencyId = 0;
            this.data.CurrencyRate = 0;
            this.data.Supplier = null;
            this.selectedCurrency = null;
            this.selectedSupplier = null;
        }
    }

    @bindable selectedCurrency;
    async selectedCurrencyChanged(newVal) {
        this.data.CurrencyRate = 0;
        if (newVal) {
            this.data.CurrencyCode = newVal.code;
            this.data.CurrencyId = newVal.Id;
            this.data.CurrencyRate = newVal.rate;
            this.currencyCodeValue = this.data.CurrencyCode;
            // if (newVal.Code == "IDR") {
            //     this.sameCurrency = true;
            //     this.data.CurrencyRate = 1;
            // }
            if (this.selectedSupplier) {
                let arg = {
                    page: 1,
                    size: Number.MAX_SAFE_INTEGER,
                    filter: JSON.stringify({ "CurrencyCode": this.data.CurrencyCode, "SupplierId": this.selectedSupplier.Id, "IsPaid": false, "Position": "5" }),
                    CurrencyCode: this.data.CurrencyCode,
                    SupplierId: this.selectedSupplier.Id,
                    Position: 5
                };
                await this.DispositionData(arg);
            }
            if (this.bankCurrency == "IDR" && this.currencyCodeValue != "IDR" && this.currencyCodeValue != null){
                this.sameCurrencyValue = false;
            }
            else{
                this.sameCurrencyValue = true;
            }
            // if (!this.IDR || this.sameCurrency) {
            //     this.collection = {
            //         columns: ['__check', 'No. Disposisi', 'Tanggal Disposisi', 'Tanggal Jatuh Tempo', 'Nomor Proforma/Invoice', 'Supplier', 'Kategori', 'Divisi', 'PPN', 'Jumlah dibayar ke Supplier', 'Mata Uang', ''],
            //     };
            // } else {
            //     this.collection = {
            //         columns: ['__check', 'No. Disposisi', 'Tanggal Disposisi', 'Tanggal Jatuh Tempo', 'Nomor Proforma/Invoice', 'Supplier', 'Kategori', 'Divisi', 'PPN', 'Jumlah dibayar ke Supplier', 'Mata Uang', 'Jumlah dibayar ke Supplier(IDR)', 'Mata Uang', ''],
            //     };
            // }
            // this.collectionOptions = {
            //     IDR: this.IDR,
            //     rate: this.data.CurrencyRate,
            //     SameCurrency: this.sameCurrency
            // };
        } else {
            this.data.CurrencyCode = null;
            this.data.CurrencyId = 0;
            this.sameCurrency = false;
            this.data.CurrencyRate = 0;
        }
    }

    // async rateChanged(e) {
    //     this.collectionOptions = {
    //         IDR: this.IDR,
    //         rate: parseFloat(e.srcElement.value),
    //         SameCurrency: this.sameCurrency
    //     };
    //     this.data.CurrencyRate = parseFloat(e.srcElement.value);
    //     if (this.selectedBank && this.selectedBank.Currency.Code && this.selectedSupplier) {
    //         var currency = this.data.CurrencyCode ? this.data.CurrencyCode : this.selectedBank.Currency.Code;
    //         let arg = {
    //             page: 1,
    //             size: Number.MAX_SAFE_INTEGER,
    //             filter: JSON.stringify({ "CurrencyCode": currency, "SupplierCode": this.selectedSupplier.code, "IsPaid": false, "Position": "7" }) //CASHIER DIVISION
    //         };
    //         await this.DispositionData(arg);
    //     }
    // }

    get isIDR() {
        return (this.data && this.data.AccountBank && this.data.AccountBank.Currency && this.data.AccountBank.Currency.Code === "IDR") || this.data.CurrencyCode === "IDR";
    }

    @computedFrom('totalPaymentTrigger', 'data.OtherExpense', 'typingOtherExpense', 'data.CurrencyRate', 'data.CurrencyCode', 'data.AccountBank')
    get grandTotal() {
        const _ = this.totalPaymentTrigger;
        let result = 0;
        let viewResult = 0;
        let rate = (this.data && (this.data.CurrencyCode === "IDR" || !this.data.CurrencyRate)) ? 1 : (this.data && Number(this.data.CurrencyRate) || 1);
        if (this.Items && this.Items.length > 0) {
            for (let detail of this.Items) {
                if (detail.Select) {
                    let payment = detail.typingPayment !== undefined && detail.typingPayment !== null
                        ? detail.typingPayment
                        : (Number(detail.TotalPaidPayment) || 0);
                    result += payment;
                    viewResult += (payment * rate);
                }
            }
        }
        let otherExpense = this.typingOtherExpense !== null && this.typingOtherExpense !== undefined ? this.typingOtherExpense : (this.data ? (Number(this.data.OtherExpense) || 0) : 0);
        result += otherExpense;
        viewResult += (otherExpense * rate);
        if (this.isIDR)
            return viewResult;
        else
            return result;
    }

    bankView(bank) {
        return bank.AccountName ? `${bank.AccountName} - ${bank.BankName} - ${bank.AccountNumber} - ${bank.Currency.Code}` : '';
    }

    supplierView(supp) {
        return `${supp.code}-${supp.name}`;
    }

    currencyView(currency) {
        return `${currency.code}`;
    }
}
