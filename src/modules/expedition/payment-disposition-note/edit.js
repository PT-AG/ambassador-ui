import { inject, Lazy, BindingEngine } from 'aurelia-framework';
import { Router } from 'aurelia-router';
import { Dialog } from '../../../components/dialog/dialog'
import { Base64Helper } from '../../../utils/base-64-coded-helper';
import Service from './service';


@inject(Router, Service, Dialog, BindingEngine)
export class Edit {

    grandTotal = 0;
    displayOtherExpense = "0.00";
    isOtherExpenseJustFocused = false;

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
        saveText: 'Simpan',
    };

    constructor(router, service, dialog, bindingEngine) {
        this.bindingEngine = bindingEngine;
        this.router = router;
        this.service = service;
        this.dialog = dialog;

        this.collection = {
            columns: ['__check', 'No. Disposisi', 'Tanggal Disposisi', 'Tanggal Jatuh Tempo', 'Nomor Proforma/Invoice', 'Supplier', 'Kategori', 'Divisi', 'PPN', 'Total Pembayaran', 'Mata Uang', 'Total yang sudah dibayar', 'Total yang dibayar ke Supplier', 'Selisih Total yang dibayar', ''],
        };
    }

    bind() {
        this.error = {};
    }

    Items = [];
    async activate(params) {
        const decoded = Base64Helper.decode(params.id);
        var id = decoded;
        this.data = await this.service.getById(id);

        this.Items = this.data.Items.map((item) => {
            item.Select = true;
            return item;
        });
        for(var a of this.data.Items){
            a.SupplierName=this.data.Supplier.Name;
            a.Currency=this.data.AccountBank.Currency.Code;
            a.PaymentDifference = a.payToSupplier - (a.AmountPaid + a.SupplierPayment);
        }

        this.IDR=false;
        this.sameCurrency=false;

        if(this.data.AccountBank.Currency.Code=="IDR"){
            this.IDR=true;
            if(this.data.CurrencyCode=="IDR"){
                this.sameCurrency=true;
            }
        }

        if(!this.IDR || this.sameCurrency){
            this.collection = {
                columns: ['__check', 'No. Disposisi', 'Tanggal Disposisi', 'Tanggal Jatuh Tempo', 'Nomor Proforma/Invoice', 'Supplier', 'Kategori', 'Divisi', 'PPN', 'Total Pembayaran', 'Mata Uang', 'Total yang sudah dibayar', 'Total yang dibayar ke Supplier', 'Selisih Total yang dibayar', ''],
            };
        }
        else{
            this.collection = {
                columns: ['__check', 'No. Disposisi', 'Tanggal Disposisi', 'Tanggal Jatuh Tempo', 'Nomor Proforma/Invoice', 'Supplier', 'Kategori', 'Divisi', 'PPN', 'Total Pembayaran', 'Mata Uang', 'Total Pembayaran(IDR)', 'Mata Uang', 'Total yang sudah dibayar', 'Total yang dibayar ke Supplier', 'Selisih Total yang dibayar', ''],
            };
        }
        this.collectionOptions={
            IDR:this.IDR,
            rate:this.data.CurrencyRate,
            SameCurrency:this.sameCurrency,
            onPaymentChange: () => {
                this.calculateGrandTotal();
            }
        };

        this.displayOtherExpense = this.formatCurrency(Number(this.data.OtherExpense) || 0);
        this.calculateGrandTotal();
        if (this.otherExpenseSubscription) {
            this.otherExpenseSubscription.dispose();
        }
        this.otherExpenseSubscription = this.bindingEngine
            .propertyObserver(this.data, 'OtherExpense')
            .subscribe(() => this.calculateGrandTotal());

        // let arg = {
        //     page: 1,
        //     size: Number.MAX_SAFE_INTEGER,
        //     filter: this.data.Supplier && this.data.Supplier.code ? JSON.stringify({ "Position": 7, "Currency": this.data.Bank.currency.code, "SupplierCode": this.data.Supplier.code, "IsPaid": false }) : JSON.stringify({ "Position": 7, "Currency": this.data.Bank.currency.code, "IsPaid": false }) //CASHIER DIVISION
        // };

        // let newData = await this.service.searchAllByPosition(arg)
        //     .then((result) => {
        //         let resultData = result.data && result.data.length > 0 ? result.data.filter((datum) => datum.PaymentMethod && datum.PaymentMethod.toLowerCase() != "cash") : [];

        //         return resultData;
        //     });

        // if (newData.length > 0) {
        //     this.UPOResults = this.UPOResults.concat(newData);
        // }
    }

    cancelCallback(event) {
            const encoded = Base64Helper.encode(this.data.Id);
            this.router.navigateToRoute('view', { id: encoded });
            //this.router.navigateToRoute('view', { id: this.data.Id });
    }

    saveCallback(event) {
        this.data.Items = this.Items.filter((item) => item.Select);
        for (var itm of this.data.Items) {
            itm.SupplierPayment = Number(itm.SupplierPayment) || 0;
        }
        this.data.OtherExpense = Number(this.data.OtherExpense) || 0;
        this.calculateGrandTotal();
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
        this.grandTotal = this.IDR ? viewResult + otherExpense : result + otherExpense;
        return this.grandTotal;
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

    deactivate() {
        if (this.otherExpenseSubscription) {
            this.otherExpenseSubscription.dispose();
        }
    }

    onCheckAll(event) {
        var isChecked = event.detail.target.checked;
        for (var item of this.Items) {
            item.Select = isChecked;
            var payToSupplier = Number(item.payToSupplier) || 0;
            var history = Number(item.AmountPaid) || 0;
            var remaining = Math.max(0, parseFloat((payToSupplier - history).toFixed(4)));
            if (isChecked) {
                if ((Number(item.SupplierPayment) || 0) === 0) {
                    item.SupplierPayment = remaining;
                    item.displaySupplierPayment = Number(remaining).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
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
        this.calculateGrandTotal();
    }
}
