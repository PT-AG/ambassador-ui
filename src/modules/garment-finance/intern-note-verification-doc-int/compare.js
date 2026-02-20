import {inject, Lazy} from 'aurelia-framework';
import {Router} from 'aurelia-router';
import {Service} from './service';
import {activationStrategy} from 'aurelia-router';

@inject(Router, Service)
export class Create {
    hasCancel = true;
    hasSave = true;

    constructor(router, service) {
        this.router = router;
        this.service = service;
    }
    activate(params) {

    }
    bind() {
        this.data = {};
        this.error = {};
    }

    cancel(event) {
        this.router.navigateToRoute('list');
    }

    determineActivationStrategy() {
        return activationStrategy.replace; //replace the viewmodel with a new instance
        // or activationStrategy.invokeLifecycle to invoke router lifecycle methods on the existing VM
        // or activationStrategy.noChange to explicitly use the default behavior
    }

    async save(event) {
        const vm = this.dataFormRef;
        console.log(vm)
        let selected = vm && vm.internalNote ? vm.internalNote : null;
        // Remove 'purchaseOrders' property if exists
        if (selected && selected.purchaseOrders) {
            delete selected.purchaseOrders;
        }
        if (!selected || !(selected.Id || selected.inNo)) {
            alert('Anda harus memilih Nomor NI terlebih dahulu.');
            return;
        }
        const scanResult = vm && vm.scanResult;
        const file = vm && vm.selectedFile;
        if (!scanResult && !file) {
            alert('Pastikan anda mengupload File Invoice');
            return;
        }
        // Aktifkan loader
        this.isScanning = true;
        try {
            console.log('[Cek Invoice] JSON yang akan dikirim:');
            console.log(JSON.stringify(selected, null, 2));
            let scanResultToSend = null;
            if (scanResult) {
                // Mapping ke template JSON yang benar
                let raw = scanResult;
                if (typeof scanResult === 'object' && scanResult.result) {
                    raw = scanResult.result;
                }
                const root = raw.data || raw.Data || raw;
                // Invoice
                let invoice = {};
                if (root.Invoice) {
                    invoice = {
                        Header: root.Invoice.Header || root.Invoice.header || {},
                        Items: root.Invoice.Items || root.Invoice.items || []
                    };
                } else {
                    invoice = {
                        Header: root.header || {},
                        Items: root.items || []
                    };
                }
                console.log(root)
                // PurchaseOrder
                let purchaseOrder = { PurchaseOrder: [] };
                if (root.PurchaseOrder && Array.isArray(root.PurchaseOrder.PurchaseOrders)) {
                    purchaseOrder.PurchaseOrders = root.PurchaseOrder.PurchaseOrders;
                }
                // DeliveryOrder
                let deliveryOrder = { DeliveryOrder: [] };
                if (root.DeliveryOrder && Array.isArray(root.DeliveryOrder.Document)) {
                    deliveryOrder.Document = root.DeliveryOrder.Document;
                }
                // TaxInvoice
                let taxInvoice = { InvoiceTax: {} };
                if (root.InvoiceTax && root.InvoiceTax.TaxInvoice) {
                    taxInvoice.InvoiceTax.TaxInvoice = root.InvoiceTax;
                }
                // Build payload sesuai template
                scanResultToSend = {
                    Invoice: invoice,
                    PurchaseOrder: purchaseOrder,
                    DeliveryOrder: deliveryOrder,
                    InvoiceTax: taxInvoice
                };
                console.log('[Cek Invoice] ScanResult (template) yang akan dikirim:', JSON.stringify(scanResultToSend, null, 2));
            } else if (file) {
                console.log('[Cek Invoice] File PDF yang dipilih:', file.name);
            }
            // Kirim ke backend, biarkan service.js yang handle FormData
            const service = this.service || (vm && vm.service);
            const response = await service.postCompareInvoice(selected, {
                scanResult: scanResultToSend ? JSON.stringify(scanResultToSend) : null,
                file: file
            });
            // Sukses
            this.isScanning = false;
            // Perbaiki pengecekan status response
            let status = response && (response.status || response.statusCode);
            if (typeof status === 'string') status = parseInt(status);
            if (status === 200) {
                if (window.confirm('Selamat Hasil Pengecekan Dokumen Invoice Sama!')) {
                    this.router.navigateToRoute('list');
                }
            } else if (status === 201) {
                if (window.confirm('Hasil Pengecekan Data Selesai, Terdapat Data yang berbeda.')) {
                    this.router.navigateToRoute('list');
                }
            } else {
                if (window.confirm('Hasil pengecekan selesai.')) {
                    this.router.navigateToRoute('list');
                }
            }
        } catch (e) {
            this.isScanning = false;
            const msg = e && e.message ? e.message : 'Terjadi masalah, jangan panik coba lagi';
            window.alert(msg);
        }
    }
}