import { inject, bindable, containerless, BindingEngine, computedFrom } from 'aurelia-framework'

@containerless()
@inject(BindingEngine)

export class GarmentShippingPartialInvoiceDetail {
    @bindable data = {};

    constructor(bindingEngine) {
        this.bindingEngine = bindingEngine;
    }

    activate(context) {
        this.context = context;
        this.data = context.data;
        this.error = context.error;
        this.options = this.context.context.options;
        this.readOnly = this.options.isView;
        this.readOnlyDesc1 = this.options.isAdd;
        this.isEdit = this.options.isEdit;
        this.isUpdated = this.options.isUpdated;
        
        this.errorCount = 0;
        if (this.error) {
            this.errorCount += 1;
        }
    }

    get Amount() {
        var am = 0;
        if (this.data.price && this.data.quantity) {
            am = this.data.quantity * this.data.price;
            this.data.amount = am;
        }

        return am;
    }

    get cmtAmount() {
        var amount = 0;
        if (this.data.cmtPrice && this.data.quantity) {
            amount = this.data.cmtPrice * this.data.quantity
        }

        return amount;
    }
}