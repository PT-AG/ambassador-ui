import { computedFrom } from 'aurelia-framework';

export class Item {

    constructor() {
        this.columns = ['Unit', 'Nama Barang', 'Jumlah', 'Satuan', 'Harga Total'];
        this.isJustFocused = false;
    }

    activate(context) {
        this.context = context;
        this.data = context.data;
        this.isShowing = false;
        this.data.Details = this.data.items;

        if (context.context && context.context.options) {
            this.IDR = context.context.options.IDR;
            this.rate = context.context.options.rate;
            this.sameCurrency = context.context.options.SameCurrency;
            if (this.IDR) {
                this.data.payToSupplierIDR = (Number(this.data.payToSupplier) || 0) * (Number(this.rate) || 1);
                this.data.currencyIDR = "IDR";
            }
        }

        var payToSupplier = Number(this.data.payToSupplier) || 0;
        var amountPaid = Number(this.data.AmountPaid) || 0;
        var remaining = Math.max(0, parseFloat((payToSupplier - amountPaid).toFixed(4)));

        if (this.data.Select === undefined) {
            this.data.Select = true;
        }

        if (this.data.SupplierPayment === undefined || this.data.SupplierPayment === null) {
            this.data.SupplierPayment = remaining;
        }

        var currentPay = Number(this.data.SupplierPayment) || 0;
        this.data.PaymentDifference = Math.max(0, parseFloat((payToSupplier - (amountPaid + currentPay)).toFixed(4)));
        this.data.displaySupplierPayment = this.formatCurrency(currentPay);
        this.data.AmountPaidDisplay = this.data.Select ? currentPay : 0;
    }

    @computedFrom('data.AmountPaidDisplay')
    get amountPaidText() {
        var num = Number(this.data && this.data.AmountPaidDisplay) || 0;
        var parts = num.toFixed(4).split('.');
        return parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',') + '.' + parts[1];
    }

    toggle() {
        this.isShowing = !this.isShowing;
    }

    onRemove() {
        this.bind();
    }

    notifyParent() {
        if (this.context && this.context.context && this.context.context.options && typeof this.context.context.options.onPaymentChange === 'function') {
            this.context.context.options.onPaymentChange();
        }
    }

    onCheckboxChange(e) {
        if (e && e.target) {
            this.data.Select = e.target.checked;
        }
        var payToSupplier = Number(this.data.payToSupplier) || 0;
        var amountPaid = Number(this.data.AmountPaid) || 0;
        var remaining = Math.max(0, parseFloat((payToSupplier - amountPaid).toFixed(4)));

        if (this.data.Select) {
            if ((Number(this.data.SupplierPayment) || 0) === 0) {
                this.data.SupplierPayment = remaining;
                this.data.displaySupplierPayment = this.formatCurrency(remaining);
                this.data.PaymentDifference = 0;
            }
            this.data.AmountPaidDisplay = Number(this.data.SupplierPayment) || 0;
        } else {
            this.data.SupplierPayment = 0;
            this.data.displaySupplierPayment = "0.00";
            this.data.PaymentDifference = remaining;
            this.data.AmountPaidDisplay = 0;
        }
        this.notifyParent();
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

    SupplierPaymentFocus(e) {
        this.isJustFocused = true;
        if (!e || !e.target) return;
        var input = e.target;
        var num = Number(this.data.SupplierPayment) || 0;

        if (num === 0) {
            input.value = "";
            this.data.displaySupplierPayment = "";
        } else {
            var valStr = String(input.value || '');
            if (valStr.endsWith('.00')) {
                input.value = valStr.substring(0, valStr.length - 3);
                this.data.displaySupplierPayment = input.value;
            }
            if (typeof input.select === 'function') {
                input.select();
            }
        }
    }

    SupplierPaymentMouseUp(e) {
        if (this.isJustFocused) {
            this.isJustFocused = false;
            if (e && typeof e.preventDefault === 'function') {
                e.preventDefault();
            }
        }
    }

    SupplierPaymentKeydown(e) {
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
                this.SupplierPaymentInput(e);
                return false;
            }
        }
        return true;
    }

    SupplierPaymentInput(e) {
        if (!e || !e.target) return;
        var input = e.target;
        var rawVal = input.value || '';
        var pos = input.selectionStart || 0;

        if (rawVal.trim() === '') {
            this.data.SupplierPayment = 0;
            this.data.displaySupplierPayment = '';
            this.updateDiff(0);
            this.notifyParent();
            return;
        }

        var res = this.formatNumberWithCursor(rawVal, pos);
        input.value = res.formatted;
        this.data.displaySupplierPayment = res.formatted;
        if (typeof input.setSelectionRange === 'function') {
            input.setSelectionRange(res.newCursor, res.newCursor);
        }

        var num = parseFloat(String(res.formatted).replace(/,/g, ''));
        var val = isNaN(num) ? 0 : num;

        var payToSupplier = Number(this.data.payToSupplier) || 0;
        var amountPaid = Number(this.data.AmountPaid) || 0;
        var maxPayment = Math.max(0, parseFloat((payToSupplier - amountPaid).toFixed(4)));

        if (val > maxPayment) {
            val = maxPayment;
            var cappedFormatted = this.formatNumber(val);
            input.value = cappedFormatted;
            this.data.displaySupplierPayment = cappedFormatted;
        }

        this.data.SupplierPayment = val;
        if (val > 0) {
            this.data.Select = true;
        }
        this.updateDiff(val);
        this.notifyParent();
    }

    SupplierPaymentBlur(e) {
        var rawVal = e && e.target ? e.target.value : (this.data.displaySupplierPayment || '');
        var num = parseFloat(String(rawVal).replace(/,/g, ''));
        var val = isNaN(num) ? 0 : num;

        var payToSupplier = Number(this.data.payToSupplier) || 0;
        var amountPaid = Number(this.data.AmountPaid) || 0;
        var maxPayment = Math.max(0, parseFloat((payToSupplier - amountPaid).toFixed(4)));

        if (val > maxPayment) {
            val = maxPayment;
        }

        this.data.SupplierPayment = val;
        var formatted = this.formatCurrency(val);
        this.data.displaySupplierPayment = formatted;

        if (e && e.target) {
            e.target.value = formatted;
        }

        this.updateDiff(val);
        this.notifyParent();
    }

    updateDiff(val) {
        var payToSupplier = Number(this.data.payToSupplier) || 0;
        var amountPaid = Number(this.data.AmountPaid) || 0;
        var currentPay = Number(val) || 0;
        this.data.AmountPaidDisplay = currentPay;
        this.data.PaymentDifference = Math.max(0, parseFloat((payToSupplier - (amountPaid + currentPay)).toFixed(4)));
    }
}
