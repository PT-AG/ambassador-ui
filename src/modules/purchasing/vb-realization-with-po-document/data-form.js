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

    @computedFrom("data.Type")
    get isWithVB() {
        return this.data.Type == "Dengan Nomor VB";
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
            this.itemsOptions.division = newVal.Division.Name;
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
            this.itemsOptions.division = vbRequestDocument.SuppliantUnit.Division.Name;
            this.itemsOptions.currencyCode = vbRequestDocument.Currency.Code;
            this.itemsOptions.typePurchasing = typePurchasing;

            this.ItemCollection.bind();
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

        this.vbRequestDocument = this.data.VBRequestDocument;

        this.selectedCurrency = this.data.Currency;
        this.selectedSuppliantUnit = this.data.SuppliantUnit;

        if (this.data.VBRequestDocument && this.data.VBRequestDocument.Id) {
            let vbRequestDocument = await this.vbRequestService.getById(this.data.VBRequestDocument.Id);

            this.itemsOptions.epoIds = vbRequestDocument.Items.map((item) => {
                return item.PurchaseOrderExternal.Id;
            });
            this.itemsOptions.division = vbRequestDocument.SuppliantUnit.Division.Name;
            this.itemsOptions.currencyCode = vbRequestDocument.Currency.Code;
            this.itemsOptions.typePurchasing = vbRequestDocument.TypePurchasing;
        }
    }

    get addItems() {
        return (event) => {
            this.data.Items.push({})
        };
    }
}