import { inject, bindable, computedFrom, BindingEngine } from 'aurelia-framework';
import { Service, VBRequestDocumentService } from './service';
import moment from 'moment';

const VBRequestDocumentLoader = require('../../../loader/vb-request-document-loader');
const UnitLoader = require('../../../loader/unit-loader');
var CurrencyLoader = require('../../../loader/currency-loader');

@inject(Service, VBRequestDocumentService, BindingEngine)
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
        this.calculateTotalRealization();
    }

    @computedFrom("selectedType")
    get isWithVB() {
        return this.selectedType == "Dengan Nomor VB";
    }

    @computedFrom("selectedType")
    get hasType() {
        return Boolean(this.selectedType && this.selectedType !== "");
    }

    @computedFrom("selectedCurrency", "vbRequestDocument")
    get currencyCode() {
        if (this.selectedCurrency && this.selectedCurrency.Code) {
            return this.selectedCurrency.Code;
        }
        if (this.data && this.data.Currency && this.data.Currency.Code) {
            return this.data.Currency.Code;
        }
        if (this.vbRequestDocument && this.vbRequestDocument.CurrencyCode) {
            return this.vbRequestDocument.CurrencyCode;
        }
        return "";
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
        this.calculateTotalRealization();
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
        this.calculateTotalRealization();
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

    constructor(service, vbRequestService, bindingEngine) {
        this.service = service;
        this.vbRequestService = vbRequestService;
        this.bindingEngine = bindingEngine;
        this.isDelay = false;
        this.itemPropertySubscriptions = [];
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

        this.itemsOptions.dataForm = this;
        this.itemsOptions.onItemChanged = () => this.calculateTotalRealization();

        if (this.data.VBRequestDocument && this.data.VBRequestDocument.Id) {
            let vbRequestDocument = await this.vbRequestService.getById(this.data.VBRequestDocument.Id);

            this.itemsOptions.epoIds = vbRequestDocument.Items.map((item) => {
                return item.PurchaseOrderExternal.Id;
            });
            this.itemsOptions.division = this.vbRequestDocument.SuppliantUnitName;
            this.itemsOptions.currencyCode = vbRequestDocument.Currency.Code;
            this.itemsOptions.typePurchasing = vbRequestDocument.TypePurchasing;
        }

        this.setupItemsObserver();
        this.calculateTotalRealization();
    }

    unbind() {
        if (this.itemsSubscription) {
            this.itemsSubscription.dispose();
        }
        if (this.itemPropertySubscriptions) {
            this.itemPropertySubscriptions.forEach(sub => sub.dispose());
        }
    }

    setupItemsObserver() {
        if (this.itemsSubscription) {
            this.itemsSubscription.dispose();
        }
        if (this.data && this.data.Items) {
            this.itemsSubscription = this.bindingEngine
                .collectionObserver(this.data.Items)
                .subscribe(splices => {
                    this.calculateTotalRealization();
                    this.observeItemElements();
                });
            this.observeItemElements();
        }
    }

    observeItemElements() {
        if (this.itemPropertySubscriptions) {
            this.itemPropertySubscriptions.forEach(sub => sub.dispose());
        }
        this.itemPropertySubscriptions = [];

        if (this.data && this.data.Items) {
            this.data.Items.forEach(item => {
                if (item) {
                    let sub = this.bindingEngine
                        .propertyObserver(item, 'UnitPaymentOrder')
                        .subscribe(() => {
                            this.calculateTotalRealization();
                        });
                    this.itemPropertySubscriptions.push(sub);
                }
            });
        }
    }

    get addItems() {
        return (event) => {
            this.data.Items.push({});
            this.calculateTotalRealization();
        };
    }

    get onremove() {
        return (event) => {
            this.calculateTotalRealization();
        };
    }

    onTableChange(event) {
        this.calculateTotalRealization();
    }

    totalRealization = 0;

    calculateTotalRealization() {
        let total = 0;
        if (this.data && this.data.Items && this.data.Items.length > 0) {
            total = this.data.Items.reduce((acc, item) => {
                if (item && item.UnitPaymentOrder) {
                    let amount = item.UnitPaymentOrder.Amount || 0;
                    let isPayVat = item.UnitPaymentOrder.IsPayVat || item.UnitPaymentOrder.UseVat;
                    let isPayTax = item.UnitPaymentOrder.IsPayTax || item.UnitPaymentOrder.UseIncomeTax;
                    let vatRate = (item.UnitPaymentOrder.VatTax && item.UnitPaymentOrder.VatTax.Rate) ? item.UnitPaymentOrder.VatTax.Rate : 0;
                    let incomeTaxRate = (item.UnitPaymentOrder.IncomeTax && item.UnitPaymentOrder.IncomeTax.Rate) ? item.UnitPaymentOrder.IncomeTax.Rate : 0;

                    let vat = isPayVat ? amount * (vatRate / 100) : 0;
                    let incomeTax = (isPayTax && item.UnitPaymentOrder.IncomeTaxBy && item.UnitPaymentOrder.IncomeTaxBy.toUpperCase() == "SUPPLIER")
                        ? amount * (incomeTaxRate / 100)
                        : 0;

                    return acc + amount + vat - incomeTax;
                }
                return acc;
            }, 0);
        } else if (this.isEdit && this.data && this.data.Amount) {
            total = this.data.Amount;
        }
        this.totalRealization = total;
        this.data.Amount = total;
        return total;
    }

    @computedFrom("error.Items")
    get itemErrorList() {
        let list = [];
        if (this.error && this.error.Items && Array.isArray(this.error.Items)) {
            this.error.Items.forEach((item, index) => {
                if (item) {
                    if (typeof item === "string") {
                        list.push(`Baris ${index + 1}: ${item}`);
                    } else {
                        for (let prop in item) {
                            if (item[prop]) {
                                list.push(`Baris ${index + 1}: ${item[prop]}`);
                            }
                        }
                    }
                }
            });
        }
        return list;
    }

    @computedFrom("itemErrorList")
    get hasItemError() {
        return this.itemErrorList.length > 0;
    }
}

function dateDiffInDays(date1, date2) {
    const dt1 = new Date(date1);
    const dt2 = new Date(date2);

    const diffTime = dt2 - dt1; // Selisih dalam milidetik
    const diffDays = diffTime / (1000 * 60 * 60 * 24); // Konversi ke hari

    return diffDays;
}