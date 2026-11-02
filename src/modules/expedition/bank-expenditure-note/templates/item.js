import { bindable, inject, BindingEngine } from 'aurelia-framework';
const UnitPaymentOrderLoader = require('../../../../loader/unit-payment-order-loader');

@inject(BindingEngine)
export class Item {
    determineActivationStrategy() {
        return 'replace';
    }

    constructor(bindingEngine) {
        this.bindingEngine = bindingEngine;
        this.queryUPO = { position: 1 };

        this.columns = ['Unit', 'Nama Barang', 'Jumlah', 'Satuan', 'Harga Total'];
    }

    activate(context) {
        this.context = context;
        this.data = context.data;
        this.isShowing = false;
        this.data.TotalPaidIDR = 0;
        console.log("expenditure item", this.data);

        this.readOnly = context.options ? context.options.readOnly : false;

        if (this.bindingEngine && this.data) {
            this.selectSubscription = this.bindingEngine
                .propertyObserver(this.data, "Select")
                .subscribe(() => {
                    const onCheck = (this.options && this.options.onCheck)
                        || (this.context && this.context.context && this.context.context.options && this.context.context.options.onCheck);
                    if (typeof onCheck === 'function') {
                        onCheck();
                    }
                });
        }

        if (!this.data._incomeTaxDeducted && this.data.IncomeTaxBy && this.data.IncomeTaxBy.toUpperCase() == "SUPPLIER") {
            this.data.TotalPaid = (Number(this.data.TotalPaid) || 0) - (Number(this.data.IncomeTax) || 0);
            this.data._incomeTaxDeducted = true;
        }

        if (context.context && context.context.options) {
            this.IDR = context.context.options.IDR;
            this.rate = context.context.options.rate;
            this.sameCurrency = context.context.options.SameCurrency;
            if (this.IDR) {
                this.data.TotalPaidIDR = this.data.TotalPaid * this.rate;
                this.data.CurrencyIDR = "IDR";
            }

            let listURNNo = [];
            if (this.data.Items && Array.isArray(this.data.Items)) {
                for (let item of this.data.Items) {
                    if (item.URNNo != null)
                        listURNNo.push(item.URNNo);
                }
            }

            this.listURNNo = listURNNo.length != 0 ? listURNNo.join('\n') : listURNNo;
        }

        let totalPaid = Number(this.data.TotalPaid) || 0;
        let amountPaid = Number(this.data.AmountPaid) || 0;

        if (this.data.PaymentDifference !== undefined && this.data.PaymentDifference !== null && this.data.SupplierPayment !== undefined && this.data.SupplierPayment !== null && Number(this.data.SupplierPayment) > 0) {
            this.SupplierPayment = Number(this.data.SupplierPayment);
            this.data.AmountPaid = totalPaid - (this.SupplierPayment + (Number(this.data.PaymentDifference) || 0));
        } else if (this.data.SupplierPayment !== undefined && this.data.SupplierPayment !== null && Number(this.data.SupplierPayment) > 0) {
            this.SupplierPayment = Number(this.data.SupplierPayment);
            this.data.PaymentDifference = totalPaid - (amountPaid + this.SupplierPayment);
        } else {
            let remaining = totalPaid - amountPaid;
            if (remaining <= 0 && totalPaid > 0) {
                this.data.AmountPaid = 0;
                amountPaid = 0;
                remaining = totalPaid;
            }
            this.SupplierPayment = remaining;
            this.data.SupplierPayment = this.SupplierPayment;
            this.data.PaymentDifference = totalPaid - (amountPaid + this.SupplierPayment);
        }
        
        console.log(context);
    }

    get options() {
        return (this.context && this.context.context && this.context.context.options)
            || (this.context && this.context.options)
            || this._options
            || {};
    }
    set options(val) {
        this._options = val;
    }

    // activate(context) {
    //     this.data = context.data
    //     this.isShowing = false;
    //     this.data.TotalPaidIDR = 0;
    //     if (context.context.options) {
    //         this.IDR = context.context.options.IDR;
    //         this.rate = context.context.options.rate;
    //         this.sameCurrency = context.context.options.SameCurrency;
    //         if (this.IDR) {
    //             this.data.TotalPaidIDR = this.data.TotalPaid * this.rate;
    //             this.data.CurrencyIDR = "IDR";
    //         }
    //     }

    //     console.log(context);
    // }

    toggle() {
        this.isShowing = !this.isShowing;
    }

    onRemove() {
        this.bind();
    }

    get unitPaymentOrderLoader() {
        return UnitPaymentOrderLoader;
    }

    detached() {
        if (this.selectSubscription) {
            this.selectSubscription.dispose();
            this.selectSubscription = null;
        }
    }

    parseNumericInput(val) {
        if (val === null || val === undefined) return 0;
        if (typeof val === "number") return isNaN(val) ? 0 : val;
        if (typeof val !== "string") return 0;
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

    notifyCheck() {
        const onCheck = (this.options && this.options.onCheck)
            || (this.context && this.context.context && this.context.context.options && this.context.context.options.onCheck);
        if (typeof onCheck === 'function') {
            onCheck();
        }
    }

    notifyPaymentChange() {
        const onPaymentChange = (this.options && this.options.onPaymentChange)
            || (this.context && this.context.context && this.context.context.options && this.context.context.options.onPaymentChange);
        if (typeof onPaymentChange === 'function') {
            onPaymentChange();
        }
    }

    onCheckboxClick(event) {
        if (event && event.target) {
            this.data.Select = event.target.checked;
        }
        this.notifyCheck();
        return true;
    }

    onCheckboxChange(event) {
        if (event && event.target) {
            this.data.Select = event.target.checked;
        }
        this.notifyCheck();
        if (event && event.target) {
            const customEvent = new CustomEvent('item-checkbox-changed', {
                bubbles: true,
                detail: { select: this.data.Select, data: this.data }
            });
            event.target.dispatchEvent(customEvent);
        }
    }

    onSupplierPaymentFocus(event) {
        if (event && event.target && typeof event.target.select === "function") {
            event.target.select();
        }
    }

    onSupplierPaymentInput(event) {
        if (event && event.target) {
            let val = this.parseNumericInput(event.target.value);
            this.data.SupplierPayment = val;
            this.data.PaymentDifference = (Number(this.data.TotalPaid) || 0) - ((Number(this.data.AmountPaid) || 0) + val);
            if (val > 0 && !this.data.Select) {
                this.data.Select = true;
            }
            this.notifyPaymentChange();
        }
    }

    onSupplierPaymentBlur(event) {
        if (event && event.target) {
            let val = this.parseNumericInput(event.target.value);
            this.SupplierPayment = val;
            this.data.SupplierPayment = val;
            this.data.PaymentDifference = (Number(this.data.TotalPaid) || 0) - ((Number(this.data.AmountPaid) || 0) + val);
            this.notifyPaymentChange();
        }
    }

    @bindable SupplierPayment
    SupplierPaymentChanged(newValue) {
        let val = this.parseNumericInput(newValue);
        this.data.SupplierPayment = val;
        this.data.PaymentDifference = (Number(this.data.TotalPaid) || 0) - ((Number(this.data.AmountPaid) || 0) + val);
        this.notifyPaymentChange();
    }
}
