import { inject, BindingEngine } from 'aurelia-framework';

var SPBLoader = require('../../../../loader/vb-realization-spb-loader');

@inject(BindingEngine)
export class Item {
    constructor(bindingEngine) {
        this.bindingEngine = bindingEngine;
    }

    activate(context) {
        this.data = context.data;
        this.error = context.error;
        this.options = context.context.options;
        this.readOnly = context.options.readOnly;

        this.filter.epoIds = this.options.epoIds;
        this.filter.division = this.options.division;
        this.filter.currencyCode = this.options.currencyCode;
        this.filter.typePurchasing = this.options.typePurchasing;
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
