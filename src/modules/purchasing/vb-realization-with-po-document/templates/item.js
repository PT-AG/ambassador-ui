import { inject, BindingEngine } from 'aurelia-framework';

var SPBLoader = require('../../../../loader/vb-realization-spb-loader');

@inject(BindingEngine)
export class Item {
    constructor(bindingEngine) {
        this.bindingEngine = bindingEngine;
    }

    activate(context) {
        this.context = context;
        this.data = context.data;
        this.error = context.error;
        this.options = context.context.options;
        this.readOnly = context.options.readOnly;
        this.dataForm = this.options && this.options.dataForm ? this.options.dataForm : null;

        this.filter.epoIds = this.options.epoIds;
        this.filter.division = this.options.division;
        this.filter.currencyCode = this.options.currencyCode;
        this.filter.typePurchasing = this.options.typePurchasing;
        this.filter.IsCreatedVB = false;

        if (this.data) {
            this.unitPaymentOrderSubscription = this.bindingEngine
                .propertyObserver(this.data, 'UnitPaymentOrder')
                .subscribe((newVal, oldVal) => {
                    this.notifyChange(newVal);
                });
        }
    }

    onUnitPaymentOrderChanged(event) {
        this.notifyChange(this.data ? this.data.UnitPaymentOrder : null);
    }

    notifyChange(newVal) {
        if (this.options && typeof this.options.onItemChanged === 'function') {
            this.options.onItemChanged();
        }
        if (this.dataForm && typeof this.dataForm.calculateTotalRealization === 'function') {
            this.dataForm.calculateTotalRealization();
        }
        if (newVal && newVal.No && this.dataForm && this.dataForm.data && this.dataForm.data.Items) {
            let duplicates = this.dataForm.data.Items.filter(i => i && i.UnitPaymentOrder && i.UnitPaymentOrder.No === newVal.No);
            if (duplicates.length > 1) {
                alert(`No SPB ${newVal.No} duplikat!`);
            }
        }
    }

    unbind() {
        if (this.unitPaymentOrderSubscription) {
            this.unitPaymentOrderSubscription.dispose();
        }
    }

    filter = {

    }

    columns = [
        { header: "Tanggal", value: "Date" },
        { header: "Keterangan", value: "Remark" },
        {
            header: "Kena PPN", value: "UseVat"
        },
        { header: "Kena PPh", value: "UseIncomeTax" },
        { header: "Total", value: "Amount" }
    ]

    get spbLoader() {
        return SPBLoader;
    }

    get total() {
        if (this.data.UnitPaymentOrder) {
            let result = this.data.UnitPaymentOrder.Amount || 0;
            let isPayVat = this.data.UnitPaymentOrder.IsPayVat || this.data.UnitPaymentOrder.UseVat;
            let isPayTax = this.data.UnitPaymentOrder.IsPayTax || this.data.UnitPaymentOrder.UseIncomeTax;
            let vatRate = (this.data.UnitPaymentOrder.VatTax && this.data.UnitPaymentOrder.VatTax.Rate) ? this.data.UnitPaymentOrder.VatTax.Rate : 0;
            let incomeTaxRate = (this.data.UnitPaymentOrder.IncomeTax && this.data.UnitPaymentOrder.IncomeTax.Rate) ? this.data.UnitPaymentOrder.IncomeTax.Rate : 0;

            if (isPayVat)
                result += (this.data.UnitPaymentOrder.Amount || 0) * (vatRate / 100);

            if (isPayTax && this.data.UnitPaymentOrder.IncomeTaxBy && this.data.UnitPaymentOrder.IncomeTaxBy.toUpperCase() == "SUPPLIER")
                result -= (this.data.UnitPaymentOrder.Amount || 0) * (incomeTaxRate / 100);

            return result;
        }
        return 0;
    }
}
