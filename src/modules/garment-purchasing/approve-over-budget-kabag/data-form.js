import { inject, bindable, containerless, computedFrom, BindingEngine } from 'aurelia-framework'
import { Service } from "./service";
var SupplierLoader = require('../../../loader/garment-supplier-loader');
var CurrencyLoader = require('../../../loader/garment-currencies-by-latest-date-loader');
var CategoryLoader = require('../../../loader/garment-category-loader');
var VatLoader = require('../../../loader/vat-tax-loader');
var IncomeTaxLoader = require('../../../loader/income-tax-loader');

@containerless()
@inject(Service, BindingEngine)
export class DataForm {
    @bindable readOnly = false;
    @bindable data = {};
    @bindable error = {};
    @bindable title;
    @bindable selectedSupplier;
    @bindable selectedCurrency;
    @bindable selectedIncomeTax;
    @bindable selectedVatTax;
    @bindable options = { isEdit: false, readOnly: true };

    controlOptions = {
        label: {
            length: 4
        },
        control: {
            length: 5
        }
    }

    columns = [
        { title: "Nomor PR - No. Referensi PR - Article", field: "prNo" },
        { title: "Nomor RO", field: "roNo" },
        { title: "Barang", field: "product.Name" },
        { title: "Jumlah Diminta", field: "defaultQuantity" },
        { title: "Satuan Diminta", field: "defaultUom.Unit" },
        { title: "Jumlah Beli", field: "dealQuantity" },
        { title: "Jumlah Kecil", field: "quantityConversion" },
        { title: "Konversi", field: "quantityConversion" },
        { title: "Harga Budget", field: "budgetPrice" },
        { title: "Harga Satuan", field: "pricePerDealUnit" },
        { title: "Keterangan", field: "remark" },
    ]

    tableOptions = {
        search: false,
        showToggle: false,
        showColumns: false,
        pagination: false
    }

    constructor(service, bindingEngine) {
        this.service = service;
        this.bindingEngine = bindingEngine;
    }

    async bind(context) {
        this.context = context;
        this.data = this.context.data;
        this.error = this.context.error;
        
        var item = [];
        if (this.data.Items) {
            for (var data of this.data.Items) {
                if(data.IsOverBudget){
                    item.push({
                        poNo: data.PONo,
                        poId: data.POId,
                        prNo: `${data.PRNo} - ${data.PO_SerialNumber} - ${data.Article}` ,
                        prId: data.PRId,
                        prRefNo: data.PO_SerialNumber,
                        roNo: data.RONo,
                        artikel: data.artikel,
                        productId: data.Product.Id,
                        product: data.Product,
                        defaultQuantity: Number(data.DefaultQuantity).toFixed(2),
                        defaultUom: data.DefaultUom,
                        dealQuantity: Number(data.DealQuantity).toFixed(2),
                        dealUom: data.DealUom,
                        budgetPrice: Number(data.BudgetPrice).toFixed(4),
                        priceBeforeTax: Number(data.BudgetPrice).toFixed(4),
                        pricePerDealUnit: Number(data.PricePerDealUnit).toFixed(4),
                        isOverBudget: data.IsOverBudget,
                        uomConversion: data.SmallUom.Unit,
                        quantityConversion: Number(data.SmallQuantity).toFixed(2),
                        conversion: data.Conversion,
                        remark: data.OverBudgetRemark
                    });
                }
            }
        }
        this.items = item;

        if (this.data.Supplier) {
            this.selectedSupplier = this.data.Supplier;
        }
        if (this.data.Currency) {
            this.selectedCurrency = this.data.Currency;
        }
        if (this.data.IncomeTax) {
            this.selectedIncomeTax = this.data.IncomeTax;
        }
        if (this.data.Vat) {
            this.selectedVatTax = this.data.Vat;
        }
    }

    get supplierLoader() {
        return SupplierLoader;
    }

    get currencyLoader() {
        return CurrencyLoader;
    }

    get incomeTaxLoader() {
        return IncomeTaxLoader;
    }

    get vatTaxLoader() {
        return VatLoader;
    }

    supplierView = (supplier) => {
        return `${supplier.Code} - ${supplier.Name}`;
    }

    currencyView = (currency) => {
        return currency.Code ? currency.Code : currency.code;
    }
    
    incomeTaxView = (incomeTax) => {
        return `${incomeTax.Name} - ${incomeTax.Rate}`;
    }

    vatTaxView = (vatTax) => {
        return `${vatTax.Rate}`;
    }
}
