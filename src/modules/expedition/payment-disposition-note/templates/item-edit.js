import { Item } from './item';

export class ItemView extends Item {

    activate(context) {
        this.context = context;
        this.data = context.data;
        this.isShowing = false;

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
        var history = Number(this.data.AmountPaid) || 0;
        if (this.data.Select === undefined) {
            this.data.Select = true;
        }

        var currentPay = Number(this.data.SupplierPayment) || 0;
        this.data.PaymentDifference = Math.max(0, parseFloat((payToSupplier - (history + currentPay)).toFixed(4)));
        this.data.displaySupplierPayment = this.formatCurrency(currentPay);
        this.data.AmountPaidDisplay = this.data.Select ? currentPay : 0;
    }
}
