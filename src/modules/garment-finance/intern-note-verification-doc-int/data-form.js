import { bindable, computedFrom, inject } from 'aurelia-framework'
import { PLATFORM } from 'aurelia-pal';
import { Service } from './service';

var NILoader = require('../../../loader/garment-intern-note-loader');

@inject(Service)
export class DataForm {
    @bindable readOnly = true;
    @bindable data = {};
    @bindable error = {};
    @bindable title;
    @bindable options = { readOnly: true };
    @bindable internalNote;
    // Toggle to show raw JSON panel; default hidden per request
    showScanJson = false;

    controlOptions = {
        label: {
            length: 4
        },
        control: {
            length: 5
        }
    }

    constructor(service) {
        this.service = service;
    // compose VM for sections
    this.uploadVm = PLATFORM.moduleName('./upload/upload');
    this.scanResultVm = PLATFORM.moduleName('./upload/scan-result');
    this.scanResultDataVm = PLATFORM.moduleName('./upload/scan-result-data');
    this.scanResultDataKey = 0; // untuk force refresh compose
    }

    itemsInfoReadOnly = {
        columnsReadOnly: [
            { header: "Nomor Purchase Order" }
        ]
    }

    bind(context) {
        this.context = context;
        this.data = this.context.data;
        this.error = this.context.error;
        this.options.readOnly = this.readOnly;
        this.scanResult = null; // hasil upload
        this.showScanResultData = true; // kontrol untuk destroy/recreate komponen
    }

    get internalNoteLoader() {
        return NILoader;
    }
    @computedFrom("internalNote")
    get selectedInternalNote() {
        return this.internalNote && [this.internalNote];
    }

    itemsInfo = {
        columns: [
            { header: "No. Nota Intern" },
            { header: "Tgl. Nota Intern" },
            { header: "Mata Uang" },
            { header: "Supplier" },
            { header: "Nomor Invoice" },
            { header: "Tanggal Invoice" },
            { header: "Total Amount" },
            { header: "Keterangan" },
            { header: "Admin Pembelian" }
        ]
    };

    internalNoteChanged(newValue, oldValue) {
        if (newValue) {
            this.data.internalNote = newValue;
            this.error.internalNote = null;
        } else {
            this.data.internalNote = null;
        }
    }

    // Upload handlers are implemented in upload/upload.js
    handleUploadResult = (result) => {
        // Completely destroy the component first
        this.showScanResultData = false;
        this.scanResult = null;
        this.scanResultDataKey++;
        
        // Wait for DOM to update, then recreate with new data
        setTimeout(() => {
            this.scanResult = result;
            this.scanResultDataKey++;
            this.showScanResultData = true; // Recreate component
        }, 150);
        
        try {
            if (!result) {
                // Best-effort: collapse items in child view to avoid stale DOM
                if (this.scanResultDataVm && this.scanResultDataVm.viewModel) {
                    const vm = this.scanResultDataVm.viewModel;
                    vm.showItems = false;
                    vm.header = null;
                    vm.items = [];
                    vm.headerData = [];
                }
            }
        } catch(_) {}
    }

    handleFileSelected = (file) => {
        this.selectedFile = file;
    }
}