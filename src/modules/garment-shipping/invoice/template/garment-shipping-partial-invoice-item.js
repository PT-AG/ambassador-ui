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

        this.isShowing = false;
        // this.isSave = this.data.isSave;
        // this.isSelected = this.data.isSelected;

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

    setPackingListAndInvoiceNo() {
        if (this.data && this.data.packingListId) {
            this.header.packingListId = this.data.packingListId;
            this.header.packingListType = this.data.packingListType;
            this.header.invoiceDate = this.data.date;

            if (this.data.packingInvoiceNo) {
                this.header.invoiceNo = this.data.packingInvoiceNo.trim().split('-')[0];
            }
        }
    }

    selectedInvoiceChanged(e) {
        this.data.isSave = e.target.checked;
        if (!this.data.isSave && this.header.packingListId === this.data.packingListId) {
            this.header.packingListId = 0;
            this.header.invoiceNo = null;
            this.header.packingListType = null;
            this.header.invoiceDate = new Date();
        }
    }
}