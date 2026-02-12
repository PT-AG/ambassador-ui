import { inject } from 'aurelia-framework';
import { HttpClient } from 'aurelia-fetch-client';
import { RestService } from '../../../utils/rest-service';

// Service endpoint untuk data verification NI dan SJ

const serviceUri = 'garment-in-do-revision';
const serviceInternNotesUri = 'garment-intern-notes';
const uploadScanUri = 'garment-in-do-revision/scan-delivery-order';
const compareInternalNoteDeliveryOrderUri = 'garment-purchasing-expeditions/compare-internal-note-delivery-order';

export class Service extends RestService {
    constructor(http, aggregator, config) {
        super(http, aggregator, config, "finance");
        this.httpClient = http;
        this.purchasingService = new RestService(http, aggregator, config, "purchasing-azure");
    }
    // Method untuk mengambil data list verification NI dan SJ
    // Search berdasarkan keyword: "INNo", "SupplierName", "InvoiceNo"
    search(info) {
        const endpoint = `${serviceUri}`;
        return super.list(endpoint, info);
    }
    
    getById(id) {
        const endpoint = `${serviceInternNotesUri}/${id}`;
        return this.purchasingService.get(endpoint);
    }

    create(data) {
        // Placeholder
        return Promise.resolve({});
    }

    update(data) {
        // Placeholder
        return Promise.resolve({});
    }

    // Method baru untuk mengambil data dari endpoint garment-intern-notes (purchasing)
    searchInternNotes(info) {
        const endpoint = serviceInternNotesUri;
        return this.purchasingService.list(endpoint, info);
    }

    delete(Id) {
        const endpoint = `${serviceUri}/${Id}`;
        return super.delete(endpoint);
    }
    // POST ke endpoint compare-internal-note-delivery-order
    // Bisa kirim ScanResult (string) atau File (object), salah satu wajib
    postCompareInternalNoteDeliveryOrder(garmentInvoiceId, garmentInternNoteId, { scanResult = null, file = null } = {}) {
        const endpoint = `${compareInternalNoteDeliveryOrderUri}?garmentInvoiceId=${garmentInvoiceId}&garmentInternNoteId=${garmentInternNoteId}`;
        const formData = new FormData();
        if (scanResult) {
            formData.append('ScanResult', scanResult);
        }
        if (file) {
            formData.append('File', file);
        }
        return this.endpoint.client.fetch(endpoint, {
            method: 'POST',
            body: formData
        }).then(response => response.json());
    }

    uploadFile(file) {
        if (!file) {
            return Promise.reject(new Error('File is required'));
        }
        const formData = new FormData();
        formData.append('file', file);
        return this.endpoint.client.fetch(uploadScanUri, {
            method: 'POST',
            body: formData
        }).then(response => {
            if (!response.ok) {
                throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
            }
            return response.json();
        });
    }

}
