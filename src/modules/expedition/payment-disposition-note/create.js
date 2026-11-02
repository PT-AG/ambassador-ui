import { inject, bindable, computedFrom } from 'aurelia-framework';
import { Dialog } from '../../../components/dialog/dialog';
import { Router } from 'aurelia-router';
import { AzureService } from './service';
import { activationStrategy } from 'aurelia-router';

import SupplierLoader from '../../../loader/supplier-loader';
import BankLoader from '../../../loader/account-banks-loader';

import CurrencyLoader from '../../../loader/currency-loader';
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

    transactionTypeOptions = ["", "Operasional", "Investasi"];

    formOptions = {
        cancelText: 'Kembali',
        saveText: 'Simpan',
    };

    grandTotal = 0;
    displayOtherExpense = "0.00";
    isOtherExpenseJustFocused = false;

    constructor(router, service, dialog) {
        this.router = router;
        this.service = service;
        this.dialog = dialog;
        this.data = {
            OtherExpense: 0
        };
        this.displayOtherExpense = "0.00";
        this.grandTotal = 0;

        if (!this.IDR || this.sameCurrency) {
            this.collection = {
                columns: ['__check', 'No. Disposisi', 'Tanggal Disposisi', 'Tanggal Jatuh Tempo', 'Nomor Proforma/Invoice', 'Supplier', 'Kategori', 'Divisi', 'PPN', 'Total Pembayaran', 'Mata Uang', 'Total yang sudah dibayar', 'Total yang dibayar ke Supplier', 'Selisih Total yang dibayar', ''],
            };
        } else {
            this.collection = {
                columns: ['__check', 'No. Disposisi', 'Tanggal Disposisi', 'Tanggal Jatuh Tempo', 'Nomor Proforma/Invoice', 'Supplier', 'Kategori', 'Divisi', 'PPN', 'Total Pembayaran', 'Mata Uang', 'Total Pembayaran(IDR)', 'Mata Uang', 'Total yang sudah dibayar', 'Total yang dibayar ke Supplier', 'Selisih Total yang dibayar', ''],
            };
        }

        this.collectionOptions = {
            IDR: this.IDR,
            rate: this.data.CurrencyRate,
            SameCurrency: this.sameCurrency,
            onPaymentChange: () => {
                this.calculateGrandTotal();
            }
        };
    }

    determineActivationStrategy() {
        return activationStrategy.replace;
    }

    cancelCallback(event) {
        this.router.navigateToRoute('list');
    }

    onCheckAll(event) {
        var isChecked = event.detail.target.checked;
        if (this.Items && this.Items.length > 0) {
            for (var item of this.Items) {
                item.Select = isChecked;
                var payToSupplier = Number(item.payToSupplier) || 0;
                var amountPaid = Number(item.AmountPaid) || 0;
                var remaining = Math.max(0, parseFloat((payToSupplier - amountPaid).toFixed(4)));

                if (isChecked) {
                    if ((Number(item.SupplierPayment) || 0) === 0) {
                        item.SupplierPayment = remaining;
                        item.displaySupplierPayment = this.formatCurrency(remaining);
                        item.PaymentDifference = 0;
                    }
                    item.AmountPaidDisplay = Number(item.SupplierPayment) || 0;
                } else {
                    item.SupplierPayment = 0;
                    item.displaySupplierPayment = "0.00";
                    item.PaymentDifference = remaining;
                    item.AmountPaidDisplay = 0;
                }
            }
        }
        this.calculateGrandTotal();
    }

    onTableInput(e) {
        this.calculateGrandTotal();
    }

    onTableChange(e) {
        this.calculateGrandTotal();
    }

    formatCurrency(val) {
        if (val === undefined || val === null || isNaN(val)) return '0.00';
        var num = Number(val);
        var parts = num.toFixed(2).split('.');
        return parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',') + '.' + parts[1];
    }

    formatNumber(val) {
        if (val === undefined || val === null || isNaN(val)) return '0';
        var str = String(val);
        var parts = str.split('.');
        var intPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        return parts.length > 1 ? intPart + '.' + parts[1] : intPart;
    }

    formatNumberWithCursor(inputVal, cursorPos) {
        if (inputVal === undefined || inputVal === null) return { formatted: '', newCursor: 0 };
        var raw = String(inputVal);

        var rawBeforeCursor = raw.substring(0, cursorPos);
        var nonCommasBefore = 0;
        for (var i = 0; i < rawBeforeCursor.length; i++) {
            if (rawBeforeCursor[i] !== ',') {
                nonCommasBefore++;
            }
        }

        var hasDot = raw.indexOf('.') !== -1;
        var dotSplit = raw.split('.');
        var rawInt = dotSplit[0].replace(/\D/g, '');

        if (rawInt.length > 1 && rawInt.startsWith('0')) {
            var stripped = rawInt.replace(/^0+/, '');
            var zerosRemoved = rawInt.length - stripped.length;
            nonCommasBefore = Math.max(1, nonCommasBefore - zerosRemoved);
            rawInt = stripped || '0';
        }

        var formattedInt = rawInt ? rawInt.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '';

        var decPart = '';
        if (hasDot) {
            var decDigits = dotSplit.slice(1).join('').replace(/\D/g, '').substring(0, 4);
            decPart = '.' + decDigits;
            if (formattedInt === '') {
                formattedInt = '0';
                nonCommasBefore = Math.max(2, nonCommasBefore);
            }
        }

        var formatted = formattedInt + decPart;

        var newCursor = 0;
        var count = 0;
        for (var k = 0; k < formatted.length; k++) {
            if (formatted[k] !== ',') {
                count++;
            }
            if (count === nonCommasBefore) {
                newCursor = k + 1;
                break;
            }
        }
        if (nonCommasBefore === 0) newCursor = 0;
        if (newCursor > formatted.length) newCursor = formatted.length;

        return { formatted: formatted, newCursor: newCursor };
    }

    OtherExpenseFocus(e) {
        this.isOtherExpenseJustFocused = true;
        if (!e || !e.target) return;
        var input = e.target;
        var num = Number(this.data.OtherExpense) || 0;

        if (num === 0) {
            input.value = "";
            this.displayOtherExpense = "";
        } else {
            var valStr = String(input.value || '');
            if (valStr.endsWith('.00')) {
                input.value = valStr.substring(0, valStr.length - 3);
                this.displayOtherExpense = input.value;
            }
            if (typeof input.select === 'function') {
                input.select();
            }
        }
    }

    OtherExpenseMouseUp(e) {
        if (this.isOtherExpenseJustFocused) {
            this.isOtherExpenseJustFocused = false;
            if (e && typeof e.preventDefault === 'function') {
                e.preventDefault();
            }
        }
    }

    OtherExpenseKeydown(e) {
        if (!e || !e.target) return true;
        var input = e.target;
        var keyCode = e.keyCode;

        // Comma key (188) is prevented because thousands commas are formatted automatically
        if (keyCode === 188) {
            e.preventDefault();
            return false;
        }

        // Dot keys: 190 (period), 110 (numpad dot)
        if (keyCode === 190 || keyCode === 110) {
            var val = input.value || '';
            var selStart = input.selectionStart;
            var selEnd = input.selectionEnd;
            var dotIdx = val.indexOf('.');
            if (dotIdx !== -1 && (selStart === selEnd || dotIdx < selStart || dotIdx >= selEnd)) {
                e.preventDefault();
                return false;
            }
        }

        // Backspace handling when cursor is immediately after a comma ','
        if (keyCode === 8 && input.selectionStart === input.selectionEnd) {
            var pos = input.selectionStart;
            if (pos > 0 && input.value[pos - 1] === ',') {
                e.preventDefault();
                var b = input.value.substring(0, pos - 2);
                var a = input.value.substring(pos);
                input.value = b + a;
                var newPos = Math.max(0, pos - 2);
                input.setSelectionRange(newPos, newPos);
                this.OtherExpenseInput(e);
                return false;
            }
        }
        return true;
    }

    OtherExpenseInput(e) {
        if (!e || !e.target) return;
        var input = e.target;
        var rawVal = input.value || '';
        var pos = input.selectionStart || 0;

        if (rawVal.trim() === '') {
            this.data.OtherExpense = 0;
            this.displayOtherExpense = '';
            this.calculateGrandTotal();
            return;
        }

        var res = this.formatNumberWithCursor(rawVal, pos);
        input.value = res.formatted;
        this.displayOtherExpense = res.formatted;
        if (typeof input.setSelectionRange === 'function') {
            input.setSelectionRange(res.newCursor, res.newCursor);
        }

        var num = parseFloat(String(res.formatted).replace(/,/g, ''));
        this.data.OtherExpense = isNaN(num) ? 0 : num;
        this.calculateGrandTotal();
    }

    OtherExpenseBlur(e) {
        var rawVal = e && e.target ? e.target.value : (this.displayOtherExpense || '');
        var num = parseFloat(String(rawVal).replace(/,/g, ''));
        var val = isNaN(num) ? 0 : num;

        this.data.OtherExpense = val;
        var formatted = this.formatCurrency(val);
        this.displayOtherExpense = formatted;

        if (e && e.target) {
            e.target.value = formatted;
        }

        this.calculateGrandTotal();
    }

    onRateInput(e) {
        if (!e || !e.target) return;
        var rawVal = e.target.value || '';
        var num = parseFloat(String(rawVal).replace(/,/g, ''));
        var rateVal = isNaN(num) ? 0 : num;
        this.data.CurrencyRate = rateVal;
        this.collectionOptions.rate = rateVal;
        if (this.Items && this.Items.length > 0) {
            for (var item of this.Items) {
                if (this.IDR) {
                    item.payToSupplierIDR = (Number(item.payToSupplier) || 0) * rateVal;
                }
            }
        }
        this.calculateGrandTotal();
    }

    saveCallback(event) {
        this.data.BankAccountCOA = this.data.AccountBank.AccountCOA;
        this.data.Items = this.Items.filter((item) => item.Select);
        for (var itm of this.data.Items) {
            itm.SupplierPayment = Number(itm.SupplierPayment) || 0;
        }
        this.data.OtherExpense = Number(this.data.OtherExpense) || 0;
        this.data.Amount = Number(this.data.Amount) || 0;
        if (this.data.CurrencyRate == "") {
            this.data.CurrencyRate = 0;
        }
        var dataPrep = this.data;

        this.dialog.prompt("Apakah anda yakin akan menyimpan data?", "Simpan Data")
            .then(response => {
                if (response == "ok") {
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
        this.data.Supplier = newVal;
        if (newVal) {
            this.data.Supplier.Id = newVal._id;
            this.data.Supplier.Name = newVal.name;
            this.data.Supplier.Code = newVal.code;
            this.data.Supplier.Import = newVal.import;
            if (this.selectedBank && this.selectedBank.Currency.Code) {
                var currency = this.data.CurrencyCode ? this.data.CurrencyCode : this.selectedBank.Currency.Code;
                let arg = {
                    page: 1,
                    size: 1000,
                    filter: JSON.stringify({ "CurrencyCode": currency, "SupplierCode": newVal.code, "IsPaid": false, "Position": "7" }) //CASHIER DIVISION
                };
                await this.DispositionData(arg);
            }
            this.collectionOptions = {
                IDR: this.IDR,
                rate: this.data.CurrencyRate,
                SameCurrency: this.sameCurrency,
                onPaymentChange: () => {
                    this.calculateGrandTotal();
                }
            };
        }
        this.calculateGrandTotal();
    }

    @computedFrom("selectedBank && selectedSupplier")
    get isExistBankAndSupplier() {
        if (this.selectedBank && this.selectedSupplier)
            return true;
        else
            return false;
    }

    async DispositionData(arg) {
        this.Items = await this.service.searchAllByPosition(arg)
            .then((result) => {
                result.data = result.data && result.data.length > 0 ? result.data.filter((datum) => datum.IsPosted == true) : [];
                var expeditionDatas = [];
                for (var ex of result.data) {
                    ex.purchasingDispositionExpeditionId = ex.Id;
                    delete ex.Id;
                    ex.Select = true;
                    var payToSupplier = Number(ex.payToSupplier) || 0;
                    var amountPaid = Number(ex.AmountPaid) || 0;
                    var remaining = Math.max(0, parseFloat((payToSupplier - amountPaid).toFixed(4)));
                    ex.SupplierPayment = remaining;
                    ex.PaymentDifference = 0;
                    ex.AmountPaidDisplay = remaining;
                    ex.displaySupplierPayment = this.formatCurrency(remaining);
                    for (var exItem of ex.items) {
                        exItem.purchasingDispositionExpeditionItemId = exItem.Id;
                        delete exItem.Id;
                    }
                    expeditionDatas.push(ex);
                }
                return expeditionDatas;
            });
        this.calculateGrandTotal();
        setTimeout(() => {
            var thCheck = document.querySelector('.collection thead input[type="checkbox"]');
            if (thCheck) thCheck.checked = true;
        }, 150);
    }

    Items = [];
    currency = "";
    @bindable selectedBank;
    async selectedBankChanged(newVal) {
        this.data.AccountBank = newVal;
        this.IDR = false;
        if (newVal) {
            if (this.selectedSupplier) {
                let arg = {
                    page: 1,
                    size: 1000,
                    filter: JSON.stringify({ "CurrencyCode": this.selectedBank.Currency.Code, "SupplierCode": this.selectedSupplier.code, "IsPaid": false, "Position": "7" })
                };
                await this.DispositionData(arg);
            }
            this.currency = newVal.Currency.Code;
            if (this.currency == "IDR") {
                this.IDR = true;
            }
            if (!this.IDR || this.sameCurrency) {
                this.collection = {
                    columns: ['__check', 'No. Disposisi', 'Tanggal Disposisi', 'Tanggal Jatuh Tempo', 'Nomor Proforma/Invoice', 'Supplier', 'Kategori', 'Divisi', 'PPN', 'Total Pembayaran', 'Mata Uang', 'Total yang sudah dibayar', 'Total yang dibayar ke Supplier', 'Selisih Total yang dibayar', ''],
                };

                this.data.CurrencyCode = this.currency;
                this.data.CurrencyId = newVal.Currency.Id;
                this.data.CurrencyRate = newVal.Currency.Rate;
            } else {
                this.collection = {
                    columns: ['__check', 'No. Disposisi', 'Tanggal Disposisi', 'Tanggal Jatuh Tempo', 'Nomor Proforma/Invoice', 'Supplier', 'Kategori', 'Divisi', 'PPN', 'Total Pembayaran', 'Mata Uang', 'Total Pembayaran(IDR)', 'Mata Uang', 'Total yang sudah dibayar', 'Total yang dibayar ke Supplier', 'Selisih Total yang dibayar', ''],
                };
            }
            this.collectionOptions = {
                IDR: this.IDR,
                rate: this.data.CurrencyRate,
                SameCurrency: this.sameCurrency,
                onPaymentChange: () => {
                    this.calculateGrandTotal();
                }
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
        this.calculateGrandTotal();
    }

    @bindable selectedCurrency;
    async selectedCurrencyChanged(newVal) {
        this.sameCurrency = false;
        this.data.CurrencyRate = 0;
        if (newVal) {
            this.data.CurrencyCode = newVal.Code;
            this.data.CurrencyId = newVal.Id;
            if (newVal.Code == "IDR") {
                this.sameCurrency = true;
                this.data.CurrencyRate = 1;
            }
            if (this.selectedSupplier) {
                let arg = {
                    page: 1,
                    size: Number.MAX_SAFE_INTEGER,
                    filter: JSON.stringify({ "CurrencyCode": this.data.CurrencyCode, "SupplierCode": this.selectedSupplier.code, "IsPaid": false, "Position": "7" })
                };
                await this.DispositionData(arg);
            }

            if (!this.IDR || this.sameCurrency) {
                this.collection = {
                    columns: ['__check', 'No. Disposisi', 'Tanggal Disposisi', 'Tanggal Jatuh Tempo', 'Nomor Proforma/Invoice', 'Supplier', 'Kategori', 'Divisi', 'PPN', 'Total Pembayaran', 'Mata Uang', 'Total yang sudah dibayar', 'Total yang dibayar ke Supplier', 'Selisih Total yang dibayar', ''],
                };
            } else {
                this.collection = {
                    columns: ['__check', 'No. Disposisi', 'Tanggal Disposisi', 'Tanggal Jatuh Tempo', 'Nomor Proforma/Invoice', 'Supplier', 'Kategori', 'Divisi', 'PPN', 'Total Pembayaran', 'Mata Uang', 'Total Pembayaran(IDR)', 'Mata Uang', 'Total yang sudah dibayar', 'Total yang dibayar ke Supplier', 'Selisih Total yang dibayar', ''],
                };
            }
            this.collectionOptions = {
                IDR: this.IDR,
                rate: this.data.CurrencyRate,
                SameCurrency: this.sameCurrency,
                onPaymentChange: () => {
                    this.calculateGrandTotal();
                }
            };
        } else {
            this.data.CurrencyCode = null;
            this.data.CurrencyId = 0;
            this.sameCurrency = false;
            this.data.CurrencyRate = 0;
        }
        this.calculateGrandTotal();
    }

    async rateChanged(e) {
        var rateVal = parseFloat(e.srcElement.value) || 0;
        this.data.CurrencyRate = rateVal;
        this.collectionOptions.rate = rateVal;
        if (this.Items && this.Items.length > 0) {
            for (var item of this.Items) {
                if (this.IDR) {
                    item.payToSupplierIDR = (Number(item.payToSupplier) || 0) * rateVal;
                }
            }
        }
        this.calculateGrandTotal();
    }

    calculateGrandTotal() {
        let result = 0;
        let viewResult = 0;
        let otherExpense = Number(this.data && this.data.OtherExpense) || 0;
        let rate = (!this.sameCurrency) ? (Number(this.data && this.data.CurrencyRate) || 1) : 1;
        if (this.Items && this.Items.length > 0) {
            for (let detail of this.Items) {
                if (detail.Select) {
                    let pay = Number(detail.SupplierPayment) || 0;
                    result += pay;
                    viewResult += (pay * rate);
                }
            }
        }
        this.data.Amount = result;
        if (this.IDR) {
            this.grandTotal = viewResult + otherExpense;
        } else {
            this.grandTotal = result + otherExpense;
        }
        return this.grandTotal;
    }

    bankView(bank) {
        return bank.AccountName ? `${bank.AccountName} - ${bank.BankName} - ${bank.AccountNumber} - ${bank.Currency.Code}` : '';
    }

    supplierView(supp) {
        return `${supp.code}-${supp.name}`;
    }

    currencyView(currency) {
        return `${currency.Code}`;
    }
}
