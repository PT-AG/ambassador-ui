import { inject, bindable, computedFrom } from 'aurelia-framework';
import { Service, VBRequestDocumentService } from './service';
import moment from 'moment';

const VBRequestDocumentLoader = require('../../../loader/vb-request-document-loader');
const UnitLoader = require('../../../loader/unit-loader');
var CurrencyLoader = require('../../../loader/currency-loader');

@inject(Service, VBRequestDocumentService)
export class DataForm {
    @bindable title;
    @bindable readOnly;

    formOptions = {
        cancelText: "Kembali",
        saveText: "Simpan",
        deleteText: "Hapus",
        editText: "Ubah",
    };

    filter = {
        "ApprovalStatus": 2,
        "IsRealized": false,
        "Type": 1
    };

    columns = [
        "Nomor SPB",
        "Tanggal",
        "Jumlah",
        "Kena PPN",
        "Kena PPh",
        "Total"
    ]

    typeOptions = [
        "",
        "Dengan Nomor VB",
        "Tanpa Nomor VB"
    ]

    @bindable selectedType;
    selectedTypeChanged(newVal, oldVal) {
        this.data.Type = newVal;
        if (oldVal && !this.isEdit) {
            this.vbRequestDocument = null;
            this.selectedSuppliantUnit = null;
            this.selectedCurrency = null;
            if (this.data.Items) {
                this.data.Items.splice(0, this.data.Items.length);
            }
        }
    }

    @computedFrom("selectedType")
    get isWithVB() {
        return this.selectedType == "Dengan Nomor VB";
    }

    @computedFrom("selectedType")
    get hasType() {
        return Boolean(this.selectedType && this.selectedType !== "");
    }

    controlOptions = {
        label: {
            length: 4,
        },
        control: {
            length: 4,
        },
    };

    get vbRequestDocumentLoader() {
        return VBRequestDocumentLoader;
    }

    itemsOptions = {
        epoIds: []
    }

    @bindable selectedSuppliantUnit;
    selectedSuppliantUnitChanged(newVal, oldVal) {
        if (oldVal || this.isCreate && this.data.Items && this.data.Items.length > 0)
            this.data.Items.splice(0, this.data.Items.length);

        if (newVal) {
            this.data.SuppliantUnit = newVal;
            this.itemsOptions.division = newVal.Name;
        } else {
            delete this.data.SuppliantUnit;
            delete this.itemsOptions.division;
        }
    }

    @bindable selectedCurrency;
    selectedCurrencyChanged(newVal, oldVal) {

        if (oldVal || this.isCreate && this.data.Items && this.data.Items.length > 0)
            this.data.Items.splice(0, this.data.Items.length);

        if (newVal) {
            this.data.Currency = newVal;
            this.itemsOptions.currencyCode = newVal.Code;
        } else {
            delete this.data.Currency;
            delete this.itemsOptions.currencyCode;
        }
    }

    @bindable vbRequestDocument;
    async vbRequestDocumentChanged(newVal, oldVal) {
        this.data.VBRequestDocument = newVal;

        if (newVal) {
            let vbRequestDocument = await this.vbRequestService.getById(newVal.Id);
            var typePurchasing= vbRequestDocument.SuppliantUnit.Code=="P2" ? "UMUM" : vbRequestDocument.TypePurchasing;
            this.itemsOptions.epoIds = vbRequestDocument.Items.map((item) => {
                return item.PurchaseOrderExternal.Id;
            });
            console.log(this.vbRequestDocument.SuppliantUnitName)
            this.itemsOptions.division = this.vbRequestDocument.SuppliantUnitName;
            this.itemsOptions.currencyCode = vbRequestDocument.Currency.Code;
            this.itemsOptions.typePurchasing = typePurchasing;

            this.ItemCollection.bind();
            var realizationDate = moment(this.data.Date).format("YYYY-MM-DD");  
            var estimationDate = moment(vbRequestDocument.RealizationEstimationDate).format("YYYY-MM-DD");

            var diff = dateDiffInDays( estimationDate, realizationDate);
            

            if (diff > 2 && this.data.Type == "Dengan Nomor VB") {
                this.isDelay = true;
                this.data.IsDelay = true;
            }
            console.log("tanggal realisasi", realizationDate);
            console.log("vbRequestDocument", vbRequestDocument);
            console.log("diff", diff);
            console.log("isReason", this.isReason);
        }

        
    }

    unitView = (unit) => {
        return `${unit.Code} - ${unit.Name}`
    }

    get unitLoader() {
        return UnitLoader;
    }

    get currencyLoader() {
        return CurrencyLoader;
    }

    constructor(service, vbRequestService) {
        this.service = service;
        this.vbRequestService = vbRequestService;
        this.isDelay = false;
    }

    unitfilter= {
        'Name.Contains("PEMBELIAN")':true
    }

    async bind(context) {
        this.context = context;
        this.data = this.context.data;
        this.error = this.context.error;
        this.ItemCollection = this.context.ItemCollection;

        this.cancelCallback = this.context.cancelCallback;
        this.deleteCallback = this.context.deleteCallback;
        this.editCallback = this.context.editCallback;
        this.saveCallback = this.context.saveCallback;
        this.hasPosting = this.context.hasPosting;
        this.isCreate = this.context.isCreate;
        this.isEdit = this.context.isEdit || Boolean(this.data && this.data.Id);

        this.selectedType = this.data.Type;
        this.vbRequestDocument = this.data.VBRequestDocument;

        this.selectedCurrency = this.data.Currency;
        this.selectedSuppliantUnit = this.data.SuppliantUnit;

        if (this.data.VBRequestDocument && this.data.VBRequestDocument.Id) {
            let vbRequestDocument = await this.vbRequestService.getById(this.data.VBRequestDocument.Id);

            this.itemsOptions.epoIds = vbRequestDocument.Items.map((item) => {
                return item.PurchaseOrderExternal.Id;
            });
            this.itemsOptions.division = this.vbRequestDocument.SuppliantUnitName;
            this.itemsOptions.currencyCode = vbRequestDocument.Currency.Code;
            this.itemsOptions.typePurchasing = vbRequestDocument.TypePurchasing;
        }
    }

    get addItems() {
        return (event) => {
            this.data.Items.push({})
        };
    }

    get totalRealization() {
        if (this.data && this.data.Items && this.data.Items.length > 0) {
            return this.data.Items.reduce((total, item) => {
                if (item.UnitPaymentOrder) {
                    let amount = item.UnitPaymentOrder.Amount || 0;
                    let isPayVat = item.UnitPaymentOrder.IsPayVat || item.UnitPaymentOrder.UseVat;
                    let isPayTax = item.UnitPaymentOrder.IsPayTax || item.UnitPaymentOrder.UseIncomeTax;
                    let vatRate = (item.UnitPaymentOrder.VatTax && item.UnitPaymentOrder.VatTax.Rate) ? item.UnitPaymentOrder.VatTax.Rate : 0;
                    let incomeTaxRate = (item.UnitPaymentOrder.IncomeTax && item.UnitPaymentOrder.IncomeTax.Rate) ? item.UnitPaymentOrder.IncomeTax.Rate : 0;

                    let vat = isPayVat ? amount * (vatRate / 100) : 0;
                    let incomeTax = (isPayTax && item.UnitPaymentOrder.IncomeTaxBy && item.UnitPaymentOrder.IncomeTaxBy.toUpperCase() == "SUPPLIER")
                        ? amount * (incomeTaxRate / 100)
                        : 0;

                    return total + amount + vat - incomeTax;
                }
                return total;
            }, 0);
        }
        return (this.data && this.data.Amount) ? this.data.Amount : 0;
    }
}

function dateDiffInDays(date1, date2) {
    const dt1 = new Date(date1);
    const dt2 = new Date(date2);

    const diffTime = dt2 - dt1; // Selisih dalam milidetik
    const diffDays = diffTime / (1000 * 60 * 60 * 24); // Konversi ke hari

    return diffDays;
}