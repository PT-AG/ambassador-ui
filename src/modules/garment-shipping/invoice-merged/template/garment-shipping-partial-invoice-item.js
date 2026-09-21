import { inject, bindable, containerless, BindingEngine, computedFrom } from 'aurelia-framework'

@containerless()
@inject(BindingEngine)
export class GarmentShippingPartialInvoiceItem {
    @bindable data = {};
    @bindable error = {};

    itemsColumns = [
        { header: "RoNo" },
        { header: "SCNo" },
        { header: "Buyer Brand" },
        { header: "Komoditi" },
        { header: "PO Buyer" },
        { header: "Article" },
        { header: "Color" },
        { header: "Keterangan" },
        { header: "Qty" },
        { header: "Satuan" },
        { header: "Price RO" },
        { header: "Price" },
        { header: "Currency" },
        { header: "Amount" },
        { header: "Unit" },
        { header: "CMT Price" },
        { header: "Amount CMT" },
    ]

    constructor(bindingEngine) {
        this.bindingEngine = bindingEngine;
    }

    activate(context) {
        this.context = context;
        this.data = context.data;
        this.error = context.error;
        this.options = this.context.context.options;
        this.header = this.options.header;

        if (this.data.id || this.data.Id) 
            this.data.isSave = true;

        this.isShowing = false;
        this.readOnly = this.options.isView;
        this.readOnlyDesc1 = this.options.isAdd;
        this.isEdit = this.options.isEdit;
        this.isUpdated = this.options.isUpdated;

        this.errorCount = 0;
        if (this.error) {
            this.errorCount += 1;
        }
    }

    toggle() {
        this.isShowing = !this.isShowing;
    }

    selectedInvoiceChanged(e) {
        this.data.isSave = e.target.checked;
    }
}