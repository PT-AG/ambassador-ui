import {inject, Lazy} from 'aurelia-framework';
import {Router} from 'aurelia-router';
import {Service} from './service';
import {activationStrategy} from 'aurelia-router';

@inject(Router, Service)
export class Create {
    constructor(router, service) {
        this.router = router;
        this.service = service;
        this.data = {};
        this.error = {};
    }

    activate(params) {

    }

    list() {
        this.router.navigateToRoute('list');
    }

    cancelCallback(event) {
      this.list();
    }

    determineActivationStrategy() {
        return activationStrategy.replace; //replace the viewmodel with a new instance
        // or activationStrategy.invokeLifecycle to invoke router lifecycle methods on the existing VM
        // or activationStrategy.noChange to explicitly use the default behavior
    }

    saveCallback(event) {
        this.error = {};
        var hasError = false;

        if (!this.data.Name || this.data.Name.trim() === "") {
            this.error.Name = "Nama harus diisi";
            hasError = true;
        }

        if (this.data.Rate === undefined || this.data.Rate === null || this.data.Rate === "" || isNaN(this.data.Rate)) {
            this.error.Rate = "Rate harus diisi";
            hasError = true;
        } else if (Number(this.data.Rate) < 0) {
            this.error.Rate = "Rate tidak boleh lebih kecil dari 0";
            hasError = true;
        }

        if (!this.data.COACodeCredit || this.data.COACodeCredit.trim() === "") {
            this.error.COACodeCredit = "COA harus diisi";
            hasError = true;
        } else {
            var coaPattern = /^\d{4}\.\d{2}$/;
            if (!coaPattern.test(this.data.COACodeCredit.trim())) {
                this.error.COACodeCredit = "Format COA salah. Contoh: 1111.11 (4 digit.2 digit)";
                hasError = true;
            }
        }

        if (!this.data.Date) {
            this.error.Date = "Tanggal Berlaku harus diisi";
            hasError = true;
        }

        if (hasError) {
            return;
        }

        this.service.create(this.data)
            .then(result => {
                alert("Data berhasil dibuat");
                this.router.navigateToRoute('create',{}, { replace: true, trigger: true });
            })
            .catch(e => {
                this.error = e;
            })
    }
}
