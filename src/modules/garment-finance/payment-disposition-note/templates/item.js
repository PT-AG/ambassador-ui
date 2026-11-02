export class Item {

    constructor() {
        this.columns = ['Unit', 'Nama Barang', 'Jumlah', 'Satuan', 'Harga Total'];
        this.isJustFocused = false;
    }

    activate(context) {
        this.context = context;
        this.data = context.data;
        this.isShowing = false;
        var totalPaid = Number(this.data.TotalPaid) || 0;
        var totalPaidPayment = Number(this.data.TotalPaidPayment) || 0;
        var totalPaidPaymentBefore = Number(this.data.TotalPaidPaymentBefore) || 0;
        this.data.TotalPaidPaymentAccumulated = parseFloat((totalPaidPaymentBefore + totalPaidPayment).toFixed(4));
        this.data.DiffTotalPaidPayment = Math.max(0, parseFloat((totalPaid - this.data.TotalPaidPaymentAccumulated).toFixed(4)));
        this.data.displayTotalPaidPayment = this.formatCurrency(totalPaidPayment);
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
        var totalPaid = Number(this.data.TotalPaid) || 0;
        var totalPaidPaymentBefore = Number(this.data.TotalPaidPaymentBefore) || 0;
        var remaining = Math.max(0, parseFloat((totalPaid - totalPaidPaymentBefore).toFixed(4)));

        if (this.data.Select) {
            if ((Number(this.data.TotalPaidPayment) || 0) === 0) {
                this.data.TotalPaidPayment = remaining;
                this.data.displayTotalPaidPayment = this.formatCurrency(remaining);
                this.data.TotalPaidPaymentAccumulated = parseFloat((totalPaidPaymentBefore + remaining).toFixed(4));
                this.data.DiffTotalPaidPayment = 0;
            }
        } else {
            this.data.TotalPaidPayment = 0;
            this.data.displayTotalPaidPayment = "0.00";
            this.data.TotalPaidPaymentAccumulated = totalPaidPaymentBefore;
            this.data.DiffTotalPaidPayment = remaining;
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

    TotalPaidPaymentFocus(e) {
        this.isJustFocused = true;
        if (!e || !e.target) return;
        var input = e.target;
        var num = Number(this.data.TotalPaidPayment) || 0;

        if (num === 0) {
            input.value = "";
            this.data.displayTotalPaidPayment = "";
        } else {
            var valStr = String(input.value || '');
            if (valStr.endsWith('.00')) {
                input.value = valStr.substring(0, valStr.length - 3);
                this.data.displayTotalPaidPayment = input.value;
            }
            if (typeof input.select === 'function') {
                input.select();
            }
        }
    }

    TotalPaidPaymentMouseUp(e) {
        if (this.isJustFocused) {
            this.isJustFocused = false;
            if (e && typeof e.preventDefault === 'function') {
                e.preventDefault();
            }
        }
    }

    TotalPaidPaymentKeydown(e) {
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
                this.TotalPaidPaymentInput(e);
                return false;
            }
        }
        return true;
    }

    TotalPaidPaymentInput(e) {
        if (!e || !e.target) return;
        var input = e.target;
        var rawVal = input.value || '';
        var pos = input.selectionStart || 0;

        if (rawVal.trim() === '') {
            this.data.TotalPaidPayment = 0;
            this.data.displayTotalPaidPayment = '';
            this.updateAccumulatedAndDiff(0);
            this.notifyParent();
            return;
        }

        var res = this.formatNumberWithCursor(rawVal, pos);
        input.value = res.formatted;
        this.data.displayTotalPaidPayment = res.formatted;
        if (typeof input.setSelectionRange === 'function') {
            input.setSelectionRange(res.newCursor, res.newCursor);
        }

        var num = parseFloat(String(res.formatted).replace(/,/g, ''));
        var val = isNaN(num) ? 0 : num;

        var totalPaid = Number(this.data.TotalPaid) || 0;
        var before = Number(this.data.TotalPaidPaymentBefore) || 0;
        var maxPayment = Math.max(0, parseFloat((totalPaid - before).toFixed(4)));

        if (val > maxPayment) {
            val = maxPayment;
            var cappedFormatted = this.formatNumber(val);
            input.value = cappedFormatted;
            this.data.displayTotalPaidPayment = cappedFormatted;
        }

        this.data.TotalPaidPayment = val;
        if (val > 0) {
            this.data.Select = true;
        }
        this.updateAccumulatedAndDiff(val);
        this.notifyParent();
    }

    TotalPaidPaymentBlur(e) {
        var rawVal = e && e.target ? e.target.value : (this.data.displayTotalPaidPayment || '');
        var num = parseFloat(String(rawVal).replace(/,/g, ''));
        var val = isNaN(num) ? 0 : num;

        var totalPaid = Number(this.data.TotalPaid) || 0;
        var before = Number(this.data.TotalPaidPaymentBefore) || 0;
        var maxPayment = Math.max(0, parseFloat((totalPaid - before).toFixed(4)));

        if (val > maxPayment) {
            val = maxPayment;
        }

        this.data.TotalPaidPayment = val;
        var formatted = this.formatCurrency(val);
        this.data.displayTotalPaidPayment = formatted;

        if (e && e.target) {
            e.target.value = formatted;
        }

        this.updateAccumulatedAndDiff(val);
        this.notifyParent();
    }

    TotalPaidPaymentChanged(e) {
        this.TotalPaidPaymentBlur(e);
    }

    updateAccumulatedAndDiff(val) {
        var totalPaid = Number(this.data.TotalPaid) || 0;
        var before = Number(this.data.TotalPaidPaymentBefore) || 0;
        var pay = Number(val) || 0;
        this.data.TotalPaidPaymentAccumulated = parseFloat((before + pay).toFixed(4));
        this.data.DiffTotalPaidPayment = Math.max(0, parseFloat((totalPaid - this.data.TotalPaidPaymentAccumulated).toFixed(4)));
    }
}
