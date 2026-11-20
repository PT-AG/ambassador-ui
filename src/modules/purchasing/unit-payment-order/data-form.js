import { inject, bindable, containerless, computedFrom, BindingEngine } from 'aurelia-framework'
import { Service } from "./service";
import XLSX from 'xlsx';
var SupplierLoader = require('../../../loader/supplier-loader');
var CurrencyLoader = require('../../../loader/currency-in-garment-currency-loader');
var IncomeTaxLoader = require('../../../loader/income-tax-loader');
var CategoryLoader = require('../../../loader/category-loader');
var VatTaxLoader = require('../../../loader/vat-tax-loader');
var PurchasingSectionLoader= require('../../../loader/purchasing-section-loader');

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
    @bindable selectedCategory;
    @bindable isImport = false;

    IncomeTaxByOptions = ["", "Supplier", "AG"];
    termPaymentOptions = ['CASH', 'KREDIT', 'DP (DOWN PAYMENT) + BP (BALANCE PAYMENT)', 'DP (DOWN PAYMENT) + TERMIN 1 + BP (BALANCE PAYMENT)', 'RETENSI'];
    importInfo = ['', 'CIF', 'FOB', 'CNF', 'DDU', 'DDP', 'EX WORK', 'OTHERS'];
    controlOptions = {
        label: {
            length: 4
        },
        control: {
            length: 5
        }
    }

    // itemsColumns = [{ header: "Nomor Bon Unit- Nomor Surat Jalan", value: "unitReceiptNote.no" }];

    itemsInfo = {
        columns: [{ header: "Nomor Bon Unit- Nomor Surat Jalan", value: "unitReceiptNote.no" }],
        onAdd: function() {
            this.context.ItemsCollection.bind();
            this.data.items.push({ unitReceiptNote: { no: "" } });
        }.bind(this)
    };

    constructor(service, bindingEngine) {
        this.service = service;
        this.bindingEngine = bindingEngine;
        this.previewWidth = 60;
        this.previewHeight = 600;

    }

    bind(context) {
        this.context = context;
        this.data = this.context.data;
        this.error = this.context.error;
        this.hasCreate = true;
        if (this.data) {
            this.hasCreate = false;
            this.isImport = this.data.import;
        }
        
        this.data.DocumentsFile = this.data.DocumentsFile || [];
        this.data.DocumentsFileName = this.data.DocumentsFileName || [];
        this.documentsPathTemp = [].concat(this.data.DocumentsPath || []);
        //console.log(this.context);
    }

    @computedFrom("data._id")
    get isEdit() {
        return (this.data._id || '').toString() != '';
    }

    @computedFrom("data.supplier", "data.category", "data.paymentMethod", "data.currency", "data.useIncomeTax", "data.incomeTax", "data.useVat", "data.incomeTaxBy")
    get filter() {
        var filter = {
            SupplierId: this.data.supplier ? this.data.supplier._id : this.data.supplier,
            CategoryId: this.data.category ? this.data.category._id : this.data.category,
            PaymentMethod: this.data.paymentMethod,
            CurrencyCode: (this.data.currency || {}).code || (this.data.currency || {}).Code || "",
            UseIncomeTax: this.data.useIncomeTax,
            IncomeTaxId: this.data.incomeTax ? this.data.incomeTax._id : null,
            UseVat: this.data.useVat ? true : false,
            incomeTaxBy: this.data.incomeTaxBy ? this.data.incomeTaxBy : "",
            CategoryCode: this.data.category ? this.data.category.code : this.data.category,
        }
        return filter;
    }

    selectedSupplierChanged(newValue) {
        var _selectedSupplier = newValue;
        if (_selectedSupplier._id) {
            this.data.supplier = _selectedSupplier;
            this.data.supplierId = _selectedSupplier._id ? _selectedSupplier._id : "";
            this.isImport = _selectedSupplier.import;
        }
        this.resetErrorItems();
    }

    selectedCategoryChanged(newValue) {
        var _selectedCategory = newValue;
        if (_selectedCategory._id) {
            this.data.category = _selectedCategory;
            this.data.categoryId = _selectedCategory._id ? _selectedCategory._id : "";
        }
        this.resetErrorItems();
    }

    paymentMethodChanged(e) {
        var selectedPayment = e.srcElement.value;
        if (selectedPayment) {
            this.data.paymentMethod = selectedPayment ? selectedPayment : "";
        }
        this.resetErrorItems();
    }

    selectedCurrencyChanged(newValue) {
        var _selectedCurrency = newValue;
        if (_selectedCurrency.Id) {
            this.data.currency = _selectedCurrency;
            this.data.currency._id = _selectedCurrency.Id;
        }
        this.resetErrorItems();
    }

    incomeTaxByChanged(e) {
        this.data.items = [];
    }

    selectedIncomeTaxChanged(newValue) {
        var _selectedIncomeTax = newValue || {};
        if (_selectedIncomeTax.Id) {
            this.data.incomeTax = _selectedIncomeTax;
            this.data.incomeTax._id = _selectedIncomeTax.Id;
            this.data.incomeTaxRate = _selectedIncomeTax.rate ? _selectedIncomeTax.rate : 0;
        } else {
            this.data.incomeTax = {};
        }
        this.resetErrorItems();
    }

    resetLuxuryIfNeeded() {
        const rate = this.data.vatTax && this.data.vatTax.rate;
        if (!this.data.useVat || rate != '12') {
            this.data.IsLuxury = false;
        }
    }

    selectedVatTaxChanged(newValue) {
        var _selectedVatTax = newValue;
        console.log(_selectedVatTax);
        if (!_selectedVatTax) {
          this.data.vatTax = {};
        } else if (_selectedVatTax._id || _selectedVatTax.Id) {
          const rate = _selectedVatTax.Rate != null ? _selectedVatTax.Rate : (_selectedVatTax.rate != null ? _selectedVatTax.rate : 0);
          this.data.vatTaxRate = rate;
          this.data.useVatTax = true;

          this.data.vatTax = {
            _id: _selectedVatTax.Id || _selectedVatTax._id,
            rate: rate
          };
        }
        this.resetLuxuryIfNeeded();
      }

    useIncomeTaxChanged(e) {
        this.data.items = [];
        this.selectedIncomeTax = null;
        this.data.incomeTax = {};
        this.data.incomeTaxRate = 0;
        this.data.incomeTaxNo = "";
        this.data.incomeTaxDate = null;
        this.data.incomeTaxBy = "";
    }

    async useVatChanged(e) {
        this.data.items = [];
        this.data.vatNo = "";
        this.data.vatDate = null;
        this.data.IsLuxury = false;
        var selectedUseVat = e.srcElement.checked || false;
        this.data.useVat = selectedUseVat;
    
        if(this.data.useVat){
    
            let info = {
                keyword:'',
                order: '{ "Rate" : "desc" }',
                size: 1,
            };
  
            var defaultVat = await this.service.getDefaultVat(info);
            console.log(defaultVat);
  
            if(defaultVat.length > 0){
                if(defaultVat[0]){
                    if(defaultVat[0].Id){
                       // this.data.vatTax = defaultVat[0];
                        
                        
                        this.selectedVatTax = defaultVat[0];
                        console.log(this.selectedVatTax);
                        //this.data.vatTax = this.selectedVatTax;
                        this.data.vatTax= {
                          _id : this.selectedVatTax.Id || this.selectedVatTax._id,
                          rate : this.selectedVatTax.Rate || this.selectedVatTax.rate
                        } 
  
                        console.log(this.data.vatTax);
                        //this.data.vatTax.rate = this.selectedVatTax.Rate || this.selectedVatTax.rate;
                    }
                }
            }
       } else {
        this.selectedVatTax = null;
        this.data.vatTax = {};
       }
       this.resetLuxuryIfNeeded();
    }

    resetErrorItems() {
        this.data.items = [];
        if (this.error) {
            if (this.error.items) {
                this.error.items = [];
            }
        }
    }

    supplierView = (supplier) => {
        return `${supplier.code} - ${supplier.name}`
    }

    categoryView = (category) => {
        return `${category.code} - ${category.name}`
    }

    currencyView = (currency) => {
        return currency.code || currency.Code
    }

    incomeTaxView = (incomeTax) => {
        return `${incomeTax.name} - ${incomeTax.rate}`
    }

    vatTaxView = (vatTax) => {
        return vatTax.rate ? `${vatTax.rate}` : `${vatTax.Rate}`;
      }

    get supplierLoader() {
        return SupplierLoader;
    }

    get categoryLoader() {
        return CategoryLoader;
    }

    get currencyLoader() {
        return CurrencyLoader;
    }

    get incomeTaxLoader() {
        return IncomeTaxLoader;
    }

    get vatTaxLoader() {
        return VatTaxLoader;
    }

    addItems = (e) => {
        this.data.items.push({ unitReceiptNote: { no: "" } })
    };

    get purchasingSectionLoader() {
        return PurchasingSectionLoader;
    }

    // Document handling
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
        if (!linkSource) {
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
        if (typeof fileUrl !== 'string' || !fileUrl.startsWith('data:')) {
            return null;
        }
        const commaIndex = fileUrl.indexOf(',');
        if (commaIndex === -1) {
            return null;
        }
        const header = fileUrl.substring(5, commaIndex);
        const mimeType = header.split(';')[0] || 'application/octet-stream';
        const base64Data = fileUrl.substring(commaIndex + 1);
        const binary = atob(base64Data);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
        }
        return { mimeType, bytes };
    }

    buildPreviewUrl(fileUrl) {
        if (!fileUrl) {
            return null;
        }
        const decoded = this.decodeDataUrl(fileUrl);
        if (decoded) {
            this.revokePreviewBlobUrl();
            this._previewBlobUrl = URL.createObjectURL(new Blob([decoded.bytes], { type: decoded.mimeType }));
            return this._previewBlobUrl;
        }
        return fileUrl;
    }

    renderExcelFromBuffer(buffer, excelDiv) {
        const workbook = XLSX.read(buffer, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const html = XLSX.utils.sheet_to_html(worksheet);
        excelDiv.innerHTML = html.replace('<table', '<table class="table table-bordered table-striped table-condensed"');
    }

    previewDocument(index) {
        const rawFileUrl = this.data.DocumentsFile && this.data.DocumentsFile[index];
        const fileName = (this.data.DocumentsFileName && this.data.DocumentsFileName[index]) || '';
        const embed = document.getElementById('pdfEmbed');
        const excelDiv = document.getElementById('excelTable');
        const imagePreview = document.getElementById('imagePreview');
        const modalLabel = document.getElementById('previewModalLabel');

        if (!rawFileUrl || (typeof rawFileUrl === 'string' && rawFileUrl.trim() === '')) {
            embed.removeAttribute('src');
            imagePreview.removeAttribute('src');
            alert('File dokumen tidak tersedia untuk preview.');
            return;
        }

        const lowerFileName = fileName.toLowerCase();
        if (lowerFileName.endsWith('.pdf')) {
            const previewUrl = this.buildPreviewUrl(rawFileUrl);
            if (!previewUrl) {
                alert('Format file PDF tidak valid.');
                return;
            }
            modalLabel.innerText = 'Preview PDF';
            imagePreview.removeAttribute('src');
            embed.src = previewUrl;
            embed.style.display = 'block';
            excelDiv.style.display = 'none';
            imagePreview.style.display = 'none';
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
        } else if (lowerFileName.endsWith('.xlsx') || lowerFileName.endsWith('.xls')) {
            modalLabel.innerText = 'Preview Excel';
            embed.removeAttribute('src');
            imagePreview.removeAttribute('src');
            embed.style.display = 'none';
            excelDiv.style.display = 'block';
            imagePreview.style.display = 'none';
            excelDiv.innerHTML = '<p>Loading Excel...</p>';

            const decoded = this.decodeDataUrl(rawFileUrl);
            if (decoded) {
                try {
                    this.renderExcelFromBuffer(decoded.bytes, excelDiv);
                } catch (error) {
                    excelDiv.innerHTML = '<p>Error loading Excel file.</p>';
                    console.error('Error parsing Excel:', error);
                }
            } else {
                fetch(rawFileUrl)
                    .then(response => response.arrayBuffer())
                    .then(data => this.renderExcelFromBuffer(data, excelDiv))
                    .catch(error => {
                        excelDiv.innerHTML = '<p>Error loading Excel file.</p>';
                        console.error('Error fetching or parsing Excel:', error);
                    });
            }

            this.updatePreviewSize();
            $('#pdfPreviewModal').modal('show');
            setTimeout(() => this.initResizable(), 100);
        } else if (lowerFileName.endsWith('.jpg') || lowerFileName.endsWith('.jpeg') || lowerFileName.endsWith('.png') || lowerFileName.endsWith('.gif') || lowerFileName.endsWith('.bmp') || lowerFileName.endsWith('.webp')) {
            modalLabel.innerText = 'Preview Image';
            embed.removeAttribute('src');
            imagePreview.src = rawFileUrl;
            embed.style.display = 'none';
            excelDiv.style.display = 'none';
            imagePreview.style.display = 'block';
            this.updatePreviewSize();
            $('#pdfPreviewModal').modal('show');
            setTimeout(() => this.initResizable(), 100);
        } else {
            alert('Preview not supported for this file type.');
        }
    }
}