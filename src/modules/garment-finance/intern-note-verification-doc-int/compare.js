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

    save(event) {
        this.service.postCompareInternalNoteDeliveryOrder(garmentInvoiceId, garmentInternNoteId, postData)
            .then(response => {
                this.isScanning = false;
                // Response handling
                if (response && response.statusCode === 200) {
                alert('Pengecekan NI dan SJ berhasil, tidak ada perbedaan');
                if (this.router) this.router.navigateToRoute('list');
                } else if (response && response.statusCode === 201) {
                alert('No Nota Intern dan Surat Jalan Tidak Sesuai');
                if (this.router) this.router.navigateToRoute('list');
                } else {
                const msg = response && response.message ? response.message : 'Terjadi error tidak diketahui';
                alert('Maaf terjadi error karena: ' + msg);
                }
            })
            .catch(err => {
                this.isScanning = false;
                alert('Maaf terjadi error karena: ' + (err && err.message ? err.message : err));
            });
    }
}