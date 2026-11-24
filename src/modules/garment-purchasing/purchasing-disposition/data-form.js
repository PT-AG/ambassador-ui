import { inject, bindable, containerless, computedFrom, BindingEngine } from 'aurelia-framework'
import { Service } from "./service";
import XLSX from 'xlsx';
import { moment } from "moment";
var SupplierLoader = require('../../../loader/garment-supplier-loader');
// var CurrencyLoader = require('../../../loader/garment-currency-loader');
var CurrencyLoader = require('../../../loader/garment-currencies-by-latest-date-loader');
// var CurrencyLoader = require('../../../loader/garment-currencies-bi-by-latest-date-loader');
var CategoryLoader = require('../../../loader/garment-category-loader');
var PurchasingSectionLoader= require('../../../loader/purchasing-section-loader');

//var IncomeTaxLoader = require('../../../loader/income-tax-loader');

@containerless()
@inject(Service, BindingEngine)
export class DataForm {
    @bindable readOnly = false;
    @bindable data = {};
    @bindable error = {};
    @bindable title;
    @bindable selectedSupplier;
    @bindable selectedCurrency;
    @bindable selectedCategory;
    @bindable incomeTaxValue;
    @bindable incomeTaxValueView;
    @bindable vatValue;
    @bindable vatValueView;
    @bindable ApprovedStaffBy;


    controlOptions = {
        label: {
            length: 4
        },
        control: {
            length: 5
        }
    }

    itemPaymentType = ["T/T AFTER", "FREE", "T/T BEFORE",'DP (DOWN PAYMENT) + BP (BALANCE PAYMENT)'];
    itemCategory = ["FABRIC", "ACCESSORIES"];
    itemsColumnsNI = [{ header: "Nomor External PO" },{ header: "Nomor NI" },
    { header: "Kena PPN" },
    { header: "Nominal PPN" },
    { header: "Kena PPH" },
    { header: "PPH" },
    { header: "Nominal PPH" },
    { header: "Disposisi yang sudah dibuat" },
    // { header: "Disposisi yang sudah dibayar"},
    { header: "" }];
    itemsColumns = [{ header: "Nomor External PO" },
    { header: "Kena PPN" },
    { header: "Nominal PPN" },
    { header: "Kena PPH" },
    { header: "PPH" },
    { header: "Nominal PPH" },
    { header: "Disposisi yang sudah dibuat" },
    // { header: "Disposisi yang sudah dibayar"},
    { header: "" }];

    constructor(service, bindingEngine) {
        this.service = service;
        this.bindingEngine = bindingEngine;
        this.previewWidth = 60;
        this.previewHeight = 600;
        this._itemSubscriptions = new Map();
    }

    bind(context) {
        this.context = context;
        this.data = this.context.data;
        this.error = this.context.error;
        
        this.data.DocumentsFile = this.data.DocumentsFile || [];
        this.data.DocumentsFileName = this.data.DocumentsFileName || [];
        this.documentsPathTemp = [].concat(this.data.DocumentsPath);

        if (this.data.supplier) {
            this.selectedSupplier = this.data.supplier;
        }
        if(this.data.ApprovedStaffBy){
            this.ApprovedStaffBy = {
                Name: this.data.ApprovedStaffBy
            };
        }
    }

    @computedFrom("data.Id")
    get isEdit() {
        return (this.data.Id || '').toString() != '';
    }

    @computedFrom("data.Supplier && data.Currency && data.Category")
    get filter() {
        var filter = {};
        if (this.data.Supplier && this.data.Currency && this.data.Category && this.data.Division) {
            filter = {
                supplierId: this.data.Supplier.Id || this.data.Supplier._id,
                currencyId: this.data.Currency.Id || this.data.Currency._id,
                categoryId: this.data.Category.Id || this.data.Category._id,
                currencyCode: this.data.Currency.Code
            }
        }
        return filter;
    }

    selectedCategoryChanged(newValue) {
        this.data.Category = {};
        if (this.data.Items)
            this.data.Items.splice(0);
        var _selectedCategory = newValue;
        if (_selectedCategory.Id || _selectedCategory._id) {
            this.data.Category = _selectedCategory;
            this.data.categoryId = _selectedCategory.Id || _selectedCategory._id;
            this.data.Category.Name = _selectedCategory.name;
            this.data.Category.Id = _selectedCategory._id;
            this.data.Category.Code = _selectedCategory.code;
        }
        else {
            this.data.Category = {};
            this.data.Items.splice(0);
        }
    }

    selectedSupplierChanged(newValue) {
        this.data.Supplier = {};
        if (this.data.Items)
            this.data.Items.splice(0);
        var _selectedSupplier = newValue;
        if (_selectedSupplier.Id || _selectedSupplier._id) {
            this.data.Supplier = _selectedSupplier;
            this.data.SupplierId = _selectedSupplier.Id || _selectedSupplier._id;
            this.data.SupplierName = _selectedSupplier.name;
            this.data.SupplierCode = _selectedSupplier.code;
            this.data.SupplierIsImport = _selectedSupplier.import
            // this.data.Supplier._id=_selectedSupplier.Id;
            // this.data.Supplier.code=_selectedSupplier.Code;
            // this.data.Supplier.name=_selectedSupplier.Name;
        }
        else {
            this.data.Supplier = {};
            this.data.Items.splice(0);
        }
    }

    selectedCurrencyChanged(newValue) {
        console.log("selectedCurrency", newValue);
        this.data.Currency = {};
        if (this.data.Items)
            this.data.Items.splice(0);
        if (newValue.Id) {
            this.data.Currency = newValue;
            this.data.Currency._id = newValue.Id;
            this.data.Currency.code = newValue.code;
            this.data.Currency.name = newValue.code;
            this.data.CurrencyId = newValue.Id;
            this.data.CurrencyCode = newValue.code;
            this.data.CurrencyName = newValue.code;
            this.data.CurrencyRate = newValue.rate;
            this.data.CurrencyDate = newValue.date;
        }
        else {
            this.data.Currency = {};
            this.data.Items.splice(0);
        }
    }

    get supplierLoader() {
        return SupplierLoader;
    }

    get currencyLoader() {
        return CurrencyLoader;
    }

    get addItems() {
        return (event) => {
            this.data.Items.push(
                {
                    SupplierId: this.data.SupplierId,
                    CurrencyId: this.data.CurrencyId,
                    CurrencyCode: this.data.CurrencyCode,
                    Category: this.data.Category,
                    PaymentType: this.data.PaymentType,
                    Id: 0
                })
        };
    }

    currencyView = (currency) => {
        // return currency.code+ " - " + currency.date.substring(0,10);
        return currency.Code? currency.Code:currency.code;

    }

    supplierView = (supplier) => {
        var code = supplier.code || supplier.Code;
        var name = supplier.name || supplier.Name;
        return `${code} - ${name}`
    }

    ApprovedStaffByChanged(newValue, oldValue) {
        var selectedStaff = newValue;
        if (selectedStaff) {
            this.data.ApprovedStaffBy = selectedStaff.Name;
        }
        else {
            this.data.ApprovedStaffBy = null;
        }
    }

    itemsChanged(e) {
        // console.log("BeforeitemChanged",this.data);
        
        if (this.data.Items) {
            this.data.Amount = 0;
            this.data.IncomeTaxValue = 0;
            this.data.IncomeTaxValueView = 0;            
            this.data.DPP = 0;
            this.data.VatValue = 0;
            this.data.VatValueView = 0;
            for (var item of this.data.Items) {
                // if(item.Details){
                //     for(var detail of item.Details){
                // console.log("itemchange list item ",item);
                var pph = 0;
                var pphView = 0;
                var ppn = 0;
                var ppnView = 0;
                var dpp = item.DPPValue != undefined || item.DPPValue != null ? item.DPPValue : 0;
                if (item.IsIncomeTax) {
                  // var rate= item.IncomeTax ? item.IncomeTax.Rate : 0;
                  // pph=parseFloat(detail.PriceTotal)*parseFloat(rate)*0.01;
                  pphView = item.IncomeTaxValueView;
                }
                if (item.IsPayIncomeTax) {
                    // var rate= item.IncomeTax ? item.IncomeTax.Rate : 0;
                    // pph=parseFloat(detail.PriceTotal)*parseFloat(rate)*0.01;
                    pph = item.IncomeTaxValue;
                }
                if (item.IsPayVAT) {
                    // ppn=detail.PriceTotal*0.1;
                    ppn = item.VatValue;
                }
                if (item.IsUseVat) {
                    // ppn=detail.PriceTotal*0.1;
                    ppnView = item.VatValueView;
                }
                this.data.IncomeTaxValue += pph;
                this.data.IncomeTaxValueView += pphView;
                this.data.VatValue += ppn;
                this.data.DPP += dpp;
                this.data.VatValueView +=ppnView;
                // this.data.Amount+=dpp+ppn+pph+this.data.MiscAmount;
                this.data.Amount += Number(parseFloat((dpp + ppn + this.data.MiscAmount) - pph).toFixed(3));

                //     }
                // }
            }
        }
        // console.log("itemChanged",this.data);
    }

    get removeItems() {
        return (event) => //console.log(event.detail);
        {

            if (this.data.Items) {
                this.data.Amount = 0;
                this.data.IncomeTaxValue = 0;
                this.data.IncomeTaxValueView = 0;
                this.data.DPP = 0;
                this.data.VatValue = 0;
                this.data.VatValueView = 0;
                for (var item of this.data.Items) {
                    // if(item.Details){
                    //     for(var detail of item.Details){
                    var pph = 0;
                    var pphView = 0;
                    var ppn = 0;
                    var ppnView = 0;
                    // var dpp = item.DPPValue? item.DPPValue:0;
                    var dpp = item.DPPValue != undefined || item.DPPValue != null ? item.DPPValue : 0;

                    if (item.IsIncomeTax) {
                      // var rate= item.IncomeTax ? item.IncomeTax.Rate : 0;
                      // pph=parseFloat(detail.PriceTotal)*parseFloat(rate)*0.01;
                      pphView = item.IncomeTaxValueView;
                    }
                    if (item.IsPayIncomeTax) {
                        // var rate= item.IncomeTax ? item.IncomeTax.Rate : 0;
                        // pph=parseFloat(detail.PriceTotal)*parseFloat(rate)*0.01;
                        pph = item.IncomeTaxValue;
                    }
                    if (item.IsPayVAT) {
                        // ppn=detail.PriceTotal*0.1;
                        ppn = item.VatValue;
                    }
                    if (item.IsUseVat) {
                        // ppn=detail.PriceTotal*0.1;
                        ppnView = item.VatValueView;
                    }
                    this.data.IncomeTaxValue += pph;
                    this.data.IncomeTaxValueView += pphView;                    
                    this.data.VatValue += ppn;
                    this.data.VatValueView += ppnView;
                    this.data.DPP += dpp;
                    // this.data.Amount+=dpp+ppn+pph+this.data.MiscAmount;
                    this.data.Amount += Number(parseFloat((dpp + ppn + this.data.MiscAmount) - pph).toFixed(3));


                    //     }
                    // }
                }
            }
        }
    }

    divisionView = (division) => {
        return division.name || division.Name;
    }

    categoryView = (category) => {
        var code = category.code || category.Code;
        var name = category.name || category.Name;
        return `${code} - ${name}`;
    }

    get categoryLoader() {
        return CategoryLoader;
    }

    // @computedFrom("!isView")
    set dppVal(v) { };
    get dppVal() {
        if (!this.readOnly) {
            if (this.data.Items) {
                this.data.Amount = 0;
                this.data.IncomeTaxValue = 0;
                this.data.IncomeTaxValueView = 0;                
                this.data.DPP = 0;
                this.data.VatValue = 0;
                this.data.VatValueView = 0;
                for (var item of this.data.Items) {
                    // if(item.Details){
                    //     for(var detail of item.Details){
                    var pph = 0;
                    var pphView = 0;
                    var ppn = 0;
                    var ppnView = 0;
                    // var dpp = item.DPPValue? item.DPPValue:0;
                    var dpp = item.DPPValue != undefined || item.DPPValue != null ? item.DPPValue : 0;

                    if (item.IsIncomeTax) {
                      // var rate= item.IncomeTax ? item.IncomeTax.Rate : 0;
                      // pph=parseFloat(detail.PriceTotal)*parseFloat(rate)*0.01;
                      pphView = item.IncomeTaxValueView;
                    }
                    if (item.IsPayIncomeTax) {
                        // var rate= item.IncomeTax ? item.IncomeTax.Rate : 0;
                        // pph=parseFloat(detail.PriceTotal)*parseFloat(rate)*0.01;
                        pph = item.IncomeTaxValue;
                    }
                    if (item.IsPayVAT) {
                        // ppn=detail.PriceTotal*0.1;
                        ppn = item.VatValue;
                    }
                    if (item.IsUseVat) {
                        // ppn=detail.PriceTotal*0.1;
                        ppnView = item.VatValueView;
                    }
                    this.data.IncomeTaxValue += pph;
                    this.data.IncomeTaxValueView += pphView;                    
                    this.data.VatValue += ppn;
                    this.data.VatValueView += ppnView;                    
                    this.data.DPP += dpp;
                    // this.data.Amount+=dpp+ppn+pph+this.data.MiscAmount;
                    this.data.Amount += Number(parseFloat((dpp + ppn + this.data.MiscAmount) - pph).toFixed(3));


                    //     }
                    // }
                }
                return this.data.DPP;
            }
            else return 0;
        }

    }
    set vatVal(v) { };
    get vatVal() {
        if (!this.readOnly) {
            if (this.data.Items) {
                this.data.Amount = 0;
                this.data.IncomeTaxValue = 0;
                this.data.IncomeTaxValueView = 0;
                this.data.DPP = 0;
                this.data.VatValue = 0;
                this.data.VatValueView = 0;
                for (var item of this.data.Items) {
                    // if(item.Details){
                    //     for(var detail of item.Details){
                    var pph = 0;
                    var pphView = 0;
                    var ppn = 0;
                    var ppnView = 0;
                    // var dpp = item.DPPValue? item.DPPValue:0;
                    var dpp = item.DPPValue != undefined || item.DPPValue != null ? item.DPPValue : 0;

                    if (item.IsIncomeTax) {
                      // var rate= item.IncomeTax ? item.IncomeTax.Rate : 0;
                      // pph=parseFloat(detail.PriceTotal)*parseFloat(rate)*0.01;
                      pphView = item.IncomeTaxValueView;
                    }
                    if (item.IsPayIncomeTax) {
                        // var rate= item.IncomeTax ? item.IncomeTax.Rate : 0;
                        // pph=parseFloat(detail.PriceTotal)*parseFloat(rate)*0.01;
                        pph = item.IncomeTaxValue;
                    }
                    if (item.IsPayVAT) {
                        // ppn=detail.PriceTotal*0.1;
                        ppn = item.VatValue;
                    }
                    if (item.IsUseVat) {
                        // ppn=detail.PriceTotal*0.1;
                        ppnView = item.VatValueView;
                    }
                    this.data.IncomeTaxValue += pph;
                    this.data.IncomeTaxValueView += pphView;                    
                    this.data.VatValue += ppn;
                    this.data.VatValueView += ppnView;                    
                    this.data.DPP += dpp;
                    // this.data.Amount+=dpp+ppn+pph+this.data.MiscAmount;
                    this.data.Amount += Number(parseFloat((dpp + ppn + this.data.MiscAmount) - pph).toFixed(3));


                    //     }
                    // }
                }
                return this.data.VatValue;
            }
            else return 0;
        }
    }

    set vatValView(v) { };
    get vatValView() {
        if (!this.readOnly) {
            if (this.data.Items) {
                this.data.Amount = 0;
                this.data.IncomeTaxValue = 0;
                this.data.IncomeTaxValueView = 0;                
                this.data.DPP = 0;
                this.data.VatValue = 0;
                this.data.VatValueView = 0;
                for (var item of this.data.Items) {
                    // if(item.Details){
                    //     for(var detail of item.Details){
                    var pph = 0;
                    var pphView =0;
                    var ppn = 0;
                    var ppnView = 0;
                    // var dpp = item.DPPValue? item.DPPValue:0;
                    var dpp = item.DPPValue != undefined || item.DPPValue != null ? item.DPPValue : 0;

                    if (item.IsIncomeTax) {
                      // var rate= item.IncomeTax ? item.IncomeTax.Rate : 0;
                      // pph=parseFloat(detail.PriceTotal)*parseFloat(rate)*0.01;
                      pphView = item.IncomeTaxValueView;
                    }
                    if (item.IsPayIncomeTax) {
                        // var rate= item.IncomeTax ? item.IncomeTax.Rate : 0;
                        // pph=parseFloat(detail.PriceTotal)*parseFloat(rate)*0.01;
                        pph = item.IncomeTaxValue;
                    }
                    if (item.IsPayVAT) {
                        // ppn=detail.PriceTotal*0.1;
                        ppn = item.VatValue;
                    }
                    if (item.IsUseVat) {
                        // ppn=detail.PriceTotal*0.1;
                        ppnView = item.VatValueView;
                    }
                    this.data.IncomeTaxValue += pph;
                    this.data.IncomeTaxValueView += pph;
                    
                    this.data.VatValue += ppn;
                    this.data.VatValueView += ppnView;                    
                    this.data.DPP += dpp;
                    // this.data.Amount+=dpp+ppn+pph+this.data.MiscAmount;
                    this.data.Amount += Number(parseFloat((dpp + ppn + this.data.MiscAmount) - pph).toFixed(3));


                    //     }
                    // }
                }
                return this.data.VatValueView;
            }
            else return 0;
        }
    }
    set incomeTaxVal(v) { };
    get incomeTaxVal() {
        if (!this.readOnly) {
            if (this.data.Items) {
                this.data.Amount = 0;
                this.data.IncomeTaxValue = 0;
                this.data.IncomeTaxValueView = 0;                
                this.data.DPP = 0;
                this.data.VatValue = 0;
                this.data.VatValueView =0;
                for (var item of this.data.Items) {
                    // if(item.Details){
                    //     for(var detail of item.Details){
                    var pph = 0;
                    var pphView = 0;
                    var ppn = 0;
                    var ppnView = 0;
                    // var dpp = item.DPPValue? item.DPPValue:0;
                    var dpp = item.DPPValue != undefined || item.DPPValue != null ? item.DPPValue : 0;

                    if (item.IsIncomeTax) {
                      // var rate= item.IncomeTax ? item.IncomeTax.Rate : 0;
                      // pph=parseFloat(detail.PriceTotal)*parseFloat(rate)*0.01;
                      pphView = item.IncomeTaxValueView;
                    }
                    if (item.IsPayIncomeTax) {
                        // var rate= item.IncomeTax ? item.IncomeTax.Rate : 0;
                        // pph=parseFloat(detail.PriceTotal)*parseFloat(rate)*0.01;
                        pph = item.IncomeTaxValue;
                    }
                    if (item.IsPayVAT) {
                        // ppn=detail.PriceTotal*0.1;
                        ppn = item.VatValue;
                    }
                    if (item.IsUseVat) {
                        // ppn=detail.PriceTotal*0.1;
                        ppnView = item.VatValueView;
                    }
                    this.data.IncomeTaxValue += pph;
                    this.data.IncomeTaxValueView += pphView;                    
                    this.data.VatValue += ppn;
                    this.data.VatValueView += ppnView;                    
                    this.data.DPP += dpp;
                    this.data.Amount += Number(parseFloat((dpp + ppn + this.data.MiscAmount) - pph).toFixed(3));

                    //     }
                    // }
                }
                return this.data.IncomeTaxValue;
            }
            else return 0;

        }
    }

    set incomeTaxValView(v) { };
    get incomeTaxValView() {
        if (!this.readOnly) {
            if (this.data.Items) {
                this.data.Amount = 0;
                this.data.IncomeTaxValue = 0;
                this.data.IncomeTaxValueView = 0;                
                this.data.DPP = 0;
                this.data.VatValue = 0;
                this.data.VatValueView =0;
                for (var item of this.data.Items) {
                    // if(item.Details){
                    //     for(var detail of item.Details){
                    var pph = 0;
                    var pphView = 0;
                    var ppn = 0;
                    var ppnView = 0;
                    // var dpp = item.DPPValue? item.DPPValue:0;
                    var dpp = item.DPPValue != undefined || item.DPPValue != null ? item.DPPValue : 0;

                    if (item.IsIncomeTax) {
                      // var rate= item.IncomeTax ? item.IncomeTax.Rate : 0;
                      // pph=parseFloat(detail.PriceTotal)*parseFloat(rate)*0.01;
                      pphView = item.IncomeTaxValueView;
                    }
                    if (item.IsPayIncomeTax) {
                        // var rate= item.IncomeTax ? item.IncomeTax.Rate : 0;
                        // pph=parseFloat(detail.PriceTotal)*parseFloat(rate)*0.01;
                        pph = item.IncomeTaxValue;
                    }
                    if (item.IsPayVAT) {
                        // ppn=detail.PriceTotal*0.1;
                        ppn = item.VatValue;
                    }
                    if (item.IsUseVat) {
                        // ppn=detail.PriceTotal*0.1;
                        ppnView = item.VatValueView;
                    }
                    this.data.IncomeTaxValue += pph;
                    this.data.IncomeTaxValueView += pphView;                    
                    this.data.VatValue += ppn;
                    this.data.VatValueView += ppnView;                    
                    this.data.DPP += dpp;
                    this.data.Amount += Number(parseFloat((dpp + ppn + this.data.MiscAmount) - pph).toFixed(3));

                    //     }
                    // }
                }
                return this.data.IncomeTaxValueView;
            }
            else return 0;

        }
    }

    onAddDocument() {
        this.data.DocumentsFile.push("");
        this.data.DocumentsFileName.push("");
        this.documentsPathTemp.push("");
        
        if (!this.error.DocumentsFile) {
            this.error.DocumentsFile = [];
        }
        this.error.DocumentsFile.push("");
    }

    onRemoveDocument(index) {
        this.data.DocumentsFile.splice(index, 1);
        this.data.DocumentsFileName.splice(index, 1);
        this.documentsPathTemp.splice(index, 1);
        
        
        if (this.error.DocumentsFile && this.error.DocumentsFile.length > index) {
            this.error.DocumentsFile.splice(index, 1);
        }
    }

    downloadDocument(index) {
        const linkSource = this.data.DocumentsFile && this.data.DocumentsFile[index];
        const fileName = (this.data.DocumentsFileName && this.data.DocumentsFileName[index]) || 'document';
        if (!linkSource || (typeof linkSource === 'string' && linkSource.trim() === '')) {
            alert('File dokumen tidak tersedia.');
            return;
        }
        const downloadLink = document.createElement("a");
        downloadLink.href = linkSource;
        downloadLink.download = fileName;
        downloadLink.click();
    }

    documentInputChanged(index) {
        let documentInput = document.getElementById('documentInput' + index);

        if (documentInput.files[0]) {
            let reader = new FileReader();
            reader.onload = event => {
                let base64Document = event.target.result;
                const base64Content = base64Document.substring(base64Document.indexOf(',') + 1);
                if (base64Content.length * 6 / 8 > 52428800) {
                    documentInput.value = "";
                    this.data.DocumentsFile[index] = "";
                    this.data.DocumentsFileName[index] = "";
                    alert("Maximum Document Size is 50 MB")
                } else {
                    this.data.DocumentsFile[index] = base64Document;
                    this.data.DocumentsFileName[index] = documentInput.value.replace(/^.*[\\\/]/, '');
                    
                    if (this.error.DocumentsFile && this.error.DocumentsFile[index]) {
                        this.error.DocumentsFile[index] = "";
                    }
                }
            }
            reader.readAsDataURL(documentInput.files[0]);
        }
    }

    validateDocuments() {
        let isValid = true;
        
        
        if (!this.error.DocumentsFile) {
            this.error.DocumentsFile = [];
        }
        
        if (this.data.DocumentsFileName && this.data.DocumentsFileName.length > 0) {
            for (let i = 0; i < this.data.DocumentsFileName.length; i++) {
            
                if (!this.data.DocumentsFile[i] || this.data.DocumentsFile[i] === "") {
            
                    if (!this.documentsPathTemp[i] || this.documentsPathTemp[i] === "") {
                        this.error.DocumentsFile[i] = "File harus di-upload";
                        isValid = false;
                    }
                } else {
                    
                    this.error.DocumentsFile[i] = "";
                }
            }
        }
        
        return isValid;
    }

    //atur review dan ukuran pop up
    updatePreviewSize() {
            const modalDialog = document.querySelector('#pdfPreviewModal .modal-dialog');
            const embed = document.getElementById('pdfEmbed');
            const excelDiv = document.getElementById('excelTable');
            const imagePreview = document.getElementById('imagePreview');
            
            if (modalDialog) {
                modalDialog.style.width = `${this.previewWidth}%`;
                modalDialog.style.maxWidth = `${this.previewWidth}%`;
            }
            if (embed) {
                embed.style.height = `${this.previewHeight}px`;
            }
            if (excelDiv) {
                excelDiv.style.maxHeight = `${this.previewHeight}px`;
            }
            if (imagePreview) {
                imagePreview.style.maxHeight = `${this.previewHeight}px`;
            }
        }
    
    initResizable() {
        const modal = document.getElementById('pdfPreviewModal');
        if (!modal) return;
        const handles = modal.querySelectorAll('.resize-handle');         
        handles.forEach(handle => {
            handle.addEventListener('mousedown', (e) => {
                e.preventDefault();
                this.isResizing = true;
                this.resizeDirection = handle.dataset.direction;
                this.startX = e.clientX;
                this.startY = e.clientY;
                
                const modalDialog = modal.querySelector('.modal-dialog');
                const rect = modalDialog.getBoundingClientRect();
                this.startWidth = rect.width;
                this.startHeight = this.previewHeight;
                
                document.addEventListener('mousemove', this.handleResize);
                document.addEventListener('mouseup', this.stopResize);
                
                modalDialog.style.transition = 'none';
            });
        });
    }

    handleResize = (e) => {
        if (!this.isResizing) return;
        
        const deltaX = e.clientX - this.startX;
        const deltaY = e.clientY - this.startY;
        const modalDialog = document.querySelector('#pdfPreviewModal .modal-dialog');
        
        if (this.resizeDirection.includes('e')) {
            const newWidth = this.startWidth + deltaX;
            const windowWidth = window.innerWidth;
            const widthPercent = Math.max(30, Math.min(100, (newWidth / windowWidth) * 100));
            this.previewWidth = Math.round(widthPercent);
        }
        
        if (this.resizeDirection.includes('w')) {
            const newWidth = this.startWidth - deltaX;
            const windowWidth = window.innerWidth;
            const widthPercent = Math.max(30, Math.min(100, (newWidth / windowWidth) * 100));
            this.previewWidth = Math.round(widthPercent);
        }
        
        if (this.resizeDirection.includes('s')) {
            const newHeight = this.startHeight + deltaY;
            this.previewHeight = Math.max(300, Math.min(1000, Math.round(newHeight)));
        }
        
        if (this.resizeDirection.includes('n')) {
            const newHeight = this.startHeight - deltaY;
            this.previewHeight = Math.max(300, Math.min(1000, Math.round(newHeight)));
        }
        
        this.updatePreviewSize();
    }

    stopResize = () => {
        if (this.isResizing) {
            this.isResizing = false;
            this.resizeDirection = null;
            
            const modalDialog = document.querySelector('#pdfPreviewModal .modal-dialog');
            if (modalDialog) {
                modalDialog.style.transition = '';
            }
            
            document.removeEventListener('mousemove', this.handleResize);
            document.removeEventListener('mouseup', this.stopResize);
        }
    }

    revokePreviewBlobUrl() {
        if (this._previewBlobUrl) {
            URL.revokeObjectURL(this._previewBlobUrl);
            this._previewBlobUrl = null;
        }
    }

    decodeDataUrl(fileUrl) {
        if (typeof fileUrl !== 'string') {
            return null;
        }
        const trimmed = fileUrl.trim();
        if (!trimmed) {
            return null;
        }
        if (trimmed.startsWith('data:')) {
            const commaIndex = trimmed.indexOf(',');
            if (commaIndex === -1) {
                return null;
            }
            const header = trimmed.substring(5, commaIndex);
            if (!header.toLowerCase().includes(';base64')) {
                return null;
            }
            const mimeType = header.split(';')[0] || 'application/octet-stream';
            return this.decodeBase64Payload(trimmed.substring(commaIndex + 1), mimeType);
        }
        if (!/^(https?:|blob:|\/)/i.test(trimmed)) {
            return this.decodeBase64Payload(trimmed, 'application/octet-stream');
        }
        return null;
    }

    decodeBase64Payload(base64Data, mimeType) {
        try {
            const binary = atob(base64Data.replace(/\s+/g, ''));
            const bytes = new Uint8Array(binary.length);
            for (let i = 0; i < binary.length; i++) {
                bytes[i] = binary.charCodeAt(i);
            }
            return { mimeType, bytes };
        } catch (error) {
            console.error('Error decoding base64 document:', error);
            return null;
        }
    }

    buildPreviewUrl(fileUrl, overrideMimeType) {
        if (!fileUrl) {
            return null;
        }
        const decoded = this.decodeDataUrl(fileUrl);
        if (decoded) {
            this.revokePreviewBlobUrl();
            const blobType = overrideMimeType || decoded.mimeType || 'application/octet-stream';
            this._previewBlobUrl = URL.createObjectURL(new Blob([decoded.bytes], { type: blobType }));
            return this._previewBlobUrl;
        }
        if (typeof fileUrl === 'string' && fileUrl.trim().startsWith('data:')) {
            return null;
        }
        return fileUrl;
    }

    renderExcelFromBuffer(buffer, excelDiv) {
        const workbook = XLSX.read(buffer, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        if (!sheetName) {
            excelDiv.innerHTML = '<p>Sheet Excel kosong.</p>';
            return;
        }
        const worksheet = workbook.Sheets[sheetName];
        const html = XLSX.utils.sheet_to_html(worksheet);
        excelDiv.innerHTML = html.replace('<table', '<table class="table table-bordered table-striped table-condensed"');
    }

    openPreviewModal(elements, title, activeMode) {
        const { embed, excelDiv, imagePreview, modalLabel } = elements;
        modalLabel.innerText = title;
        embed.style.display = activeMode === 'pdf' ? 'block' : 'none';
        excelDiv.style.display = activeMode === 'excel' ? 'block' : 'none';
        imagePreview.style.display = activeMode === 'image' ? 'block' : 'none';

        this.updatePreviewSize();
        $('#pdfPreviewModal')
            .off('hidden.bs.modal.docPreview')
            .on('hidden.bs.modal.docPreview', () => {
                embed.removeAttribute('src');
                imagePreview.removeAttribute('src');
                this.revokePreviewBlobUrl();
            })
            .modal('show');
        setTimeout(() => this.initResizable(), 100);
    }

    previewDocument(index) {
        const rawFileUrl = this.data.DocumentsFile && this.data.DocumentsFile[index];
        const fileName = (this.data.DocumentsFileName && this.data.DocumentsFileName[index]) || '';
        const embed = document.getElementById('pdfEmbed');
        const excelDiv = document.getElementById('excelTable');
        const imagePreview = document.getElementById('imagePreview');
        const modalLabel = document.getElementById('previewModalLabel');

        if (!embed || !excelDiv || !imagePreview || !modalLabel) {
            return;
        }

        if (!rawFileUrl || (typeof rawFileUrl === 'string' && rawFileUrl.trim() === '')) {
            embed.removeAttribute('src');
            imagePreview.removeAttribute('src');
            this.revokePreviewBlobUrl();
            alert('File dokumen tidak tersedia untuk preview.');
            return;
        }

        const elements = { embed, excelDiv, imagePreview, modalLabel };
        const lowerFileName = fileName.toLowerCase();

        if (lowerFileName.endsWith('.pdf')) {
            const previewUrl = this.buildPreviewUrl(rawFileUrl, 'application/pdf');
            if (!previewUrl) {
                alert('Format file PDF tidak valid.');
                return;
            }
            imagePreview.removeAttribute('src');
            embed.src = previewUrl;
            this.openPreviewModal(elements, 'Preview PDF', 'pdf');
            return;
        }

        if (lowerFileName.endsWith('.xlsx') || lowerFileName.endsWith('.xls')) {
            embed.removeAttribute('src');
            imagePreview.removeAttribute('src');
            this.revokePreviewBlobUrl();
            excelDiv.innerHTML = '<p>Loading Excel...</p>';
            this.openPreviewModal(elements, 'Preview Excel', 'excel');

            const decoded = this.decodeDataUrl(rawFileUrl);
            if (decoded) {
                try {
                    this.renderExcelFromBuffer(decoded.bytes, excelDiv);
                } catch (error) {
                    excelDiv.innerHTML = '<p>Error loading Excel file.</p>';
                    console.error('Error parsing Excel:', error);
                }
                return;
            }

            fetch(rawFileUrl)
                .then(response => response.arrayBuffer())
                .then(data => this.renderExcelFromBuffer(data, excelDiv))
                .catch(error => {
                    excelDiv.innerHTML = '<p>Error loading Excel file.</p>';
                    console.error('Error fetching or parsing Excel:', error);
                });
            return;
        }

        const imageMimeByExt = {
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.gif': 'image/gif',
            '.bmp': 'image/bmp',
            '.webp': 'image/webp'
        };
        const matchedExt = Object.keys(imageMimeByExt).find(ext => lowerFileName.endsWith(ext));
        if (matchedExt) {
            const previewUrl = this.buildPreviewUrl(rawFileUrl, imageMimeByExt[matchedExt]);
            if (!previewUrl) {
                alert('Format file gambar tidak valid.');
                return;
            }
            embed.removeAttribute('src');
            imagePreview.src = previewUrl;
            this.openPreviewModal(elements, 'Preview Image', 'image');
            return;
        }

        alert('Preview not supported for this file type.');
    }

    paymentTypeChanged(e) {
        if (this.data.Items) {
            this.data.Items.splice(0);
            this.data.Amount = 0;
        }
    }

     get purchasingSectionLoader() {
        return PurchasingSectionLoader;
    }
}
