import { inject, bindable, BindingEngine, observable, computedFrom } from 'aurelia-framework'
import { Service } from "./service";
var CurrencyLoader = require('../../../loader/garment-currencies-by-date-loader');
var SupplierLoader = require('../../../loader/garment-supplier-loader');
var moment = require('moment');

@inject(BindingEngine, Element, Service)
export class DataForm {
    @bindable readOnly = false;
    @bindable data = {};
    @bindable error = {};
    @bindable title;
    @bindable currency;
    @bindable supplier;
    @bindable options = {};

    constructor(bindingEngine, element, service) {
        this.bindingEngine = bindingEngine;
        this.element = element;
        this.service = service;
        this.previewWidth = 60;
        this.previewHeight = 600;
    }
    invoiceNoteItem = {
        columns: [
            { header: "Nomor Invoice", value: "invoice.invoiceNo"},
            { header: "Tanggal Invoice" },
            { header: "Total Amount" }
        ],
        onAdd: function () {
            this.context.ItemsCollection.bind();
            this.data.items.push({});
        }.bind(this),
    };

    auInputOptions = {
        label: {
            length: 4,
            align: "right"
        },
        control: {
            length: 5
        }
    };

    bind(context) {
        this.context = context;
        this.data = this.context.data;
        this.error = this.context.error;
        this.options = this.options ? this.options : {};
        // console.log(context);

        if(this.data.supplier){
            this.options.supplierId = this.data.supplier.Id;      
        }
        if(this.data.currency){
            this.options.currencyCode = this.data.currency.Code;
        }
        this.data.DocumentsFile = this.data.DocumentsFile || [];
        this.data.DocumentsFileName = this.data.DocumentsFileName || [];
        this.documentsPathTemp = [].concat(this.data.DocumentsPath);
    }

    @computedFrom("data.Id")
    get isEdit() {
        return (this.data.Id || '').toString() != '';
    }

    @computedFrom("data.supplier")
    get supplierIsImport() {
        if (this.data.supplier) {
            if (this.data.supplier.import)
                return true
            else
                return false
        }
        else
            return false
    }
    
    currencyChanged(newValue, oldValue) {
        var selectedCurrency = newValue;

        if (selectedCurrency) {
            this.data.currency = selectedCurrency;
            this.options.currencyCode = this.data.currency.code; 
        }
        else {
            this.currency = null;
            this.data.items = [];
            this.supplier = null;
        }

        if (!this.data.isView){
            this.data.items = [];
            this.context.error.items = [];
        }
        
    }

    supplierChanged(newValue, oldValue) {
        var selectedSupplier = newValue;
        if (selectedSupplier) {
            this.data.supplier = selectedSupplier;
            this.data.supplierId = selectedSupplier.Id;
            this.options.supplierId = selectedSupplier.Id;
            this.options.currencyCode = this.data.currency.code;   
            this.data.supplier.isView = false;
        }
        else {
            this.data.supplier = null;
            this.data.supplierId = null;
            this.data.items = [];
        }

        if (!this.data.isView){
            this.data.items = [];
            this.context.error.items = [];
        }
    }

    resetErrorItems() {
        if (this.error) {
            if (this.error.items) {
                this.error.items = [];
            }
        }
    }

    get currencyLoader() {
        return CurrencyLoader;
    }

    get supplierLoader() {
        return SupplierLoader;
    }

    currencyView = (currency) => {
        var code=currency.code? currency.code : currency.Code;
        return `${code}`
    }

    supplierView = (supplier) => 
    {
        var code=supplier.code? supplier.code : supplier.Code;
        var name=supplier.name? supplier.name : supplier.Name;
        return `${code} - ${name}`
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
        const linkSource = this.data.DocumentsFile[index];
        const downloadLink = document.createElement("a");
        const fileName = this.data.DocumentsFileName[index];

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

    previewDocument(index) {
        const fileUrl = this.data.DocumentsFile[index];
        const fileName = this.data.DocumentsFileName[index];
        const embed = document.getElementById('pdfEmbed');
        const excelDiv = document.getElementById('excelTable');
        const imagePreview = document.getElementById('imagePreview');
        const modalLabel = document.getElementById('previewModalLabel');

        const lowerFileName = fileName.toLowerCase();
        if (lowerFileName.endsWith('.pdf')) {
            modalLabel.innerText = 'Preview PDF';
            embed.src = fileUrl;
            embed.style.display = 'block';
            excelDiv.style.display = 'none';
            imagePreview.style.display = 'none';
            this.updatePreviewSize();
            $('#pdfPreviewModal').modal('show');
            setTimeout(() => this.initResizable(), 100);
        } else if (lowerFileName.endsWith('.xlsx') || lowerFileName.endsWith('.xls')) {
            modalLabel.innerText = 'Preview Excel';
            embed.style.display = 'none';
            excelDiv.style.display = 'block';
            imagePreview.style.display = 'none';
            excelDiv.innerHTML = '<p>Loading Excel...</p>';

            fetch(fileUrl)
                .then(response => response.arrayBuffer())
                .then(data => {
                    const workbook = XLSX.read(data, { type: 'array' });
                    const sheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[sheetName];
                    const html = XLSX.utils.sheet_to_html(worksheet);
                    excelDiv.innerHTML = html;
                })
                .catch(error => {
                    excelDiv.innerHTML = '<p>Error loading Excel file.</p>';
                    console.error('Error fetching or parsing Excel:', error);
                });

            this.updatePreviewSize();
            $('#pdfPreviewModal').modal('show');
            setTimeout(() => this.initResizable(), 100);
        } else if (lowerFileName.endsWith('.jpg') || lowerFileName.endsWith('.jpeg') || lowerFileName.endsWith('.png') || lowerFileName.endsWith('.gif') || lowerFileName.endsWith('.bmp') || lowerFileName.endsWith('.webp')) {
            modalLabel.innerText = 'Preview Image';
            imagePreview.src = fileUrl;
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
