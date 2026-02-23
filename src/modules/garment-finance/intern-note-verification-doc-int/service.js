import { inject } from 'aurelia-framework';
import { HttpClient } from 'aurelia-fetch-client';
import { RestService } from '../../../utils/rest-service';

// Service endpoint untuk data verification NI dan SJ

const serviceUri = 'garment-in-do-revision';
const serviceInternNotesUri = 'garment-intern-notes';
const uploadScanUri = 'garment-in-do-revision/scan-delivery-order';
const compareInvoiceUri = 'garment-in-do-revision/compare-invoice';

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

    getDataById(id) {
        const endpoint = `${serviceUri}/${id}`;
        return super.getById(endpoint);
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
    /**
     * Compare Invoice D365 dengan hasil scan/file
     * @param {Object} invoiceObj - Data invoice D365 (akan di-JSON.stringify)
     * @param {Object} options - { scanResult: string, file: File }
     */
    postCompareInvoice(invoiceObj, options = {}) {
        const { scanResult = null, file = null } = options;

        if (!invoiceObj) {
            alert('InternalNote data is required');
            return Promise.reject(new Error('InternalNote data is required'));
        }

        const formData = new FormData();
        formData.append('InternalNote', JSON.stringify(invoiceObj));

        if (scanResult) {
            formData.append('ScanResult', scanResult);
        } else if (file) {
            formData.append('File', file);
        } else {
            alert('Either scanResult or file is required');
            return Promise.reject(new Error('Either scanResult or file is required'));
        }

        return this.endpoint.client.fetch(compareInvoiceUri, {
            method: 'POST',
            body: formData
        }).then(response => {
            if (!response.ok) {
                alert(`Request failed: ${response.status} ${response.statusText}`);
                throw new Error(`Request failed: ${response.status} ${response.statusText}`);
            }
            return response.json();
        }).catch(error => {
            alert(`Error: ${error.message}`);
            throw error;
        });
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
