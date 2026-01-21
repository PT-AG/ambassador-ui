import {inject, Lazy} from 'aurelia-framework';
import {Router} from 'aurelia-router';
import {Service} from './service';
import {activationStrategy} from 'aurelia-router';
import moment from 'moment';

@inject(Router, Service)
export class Create {
    hasCancel = true;
    hasSave = true;
    hasCreate = true;2

    showLateReasonDialog = false;

    constructor(router, service) {
        this.router = router;
        this.service = service;
    }

    activate(params) {

    }
    
    bind() {
        this.data = { items: [] };
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

    save() {
        var date = moment(this.data.date);
        var dueDate = moment(this.data.dueDate);

        if (this.data.date && this.data.dueDate && dueDate.isBefore(date, 'day')) {
            this.showLateReasonDialog = true; 
        } else {
            this.saveData();
        }

        // this.service.create(this.data)
        //     .then(result => {
        //         alert("Data berhasil dibuat");
        //         this.router.navigateToRoute('create',{}, { replace: true, trigger: true });
        //     })
        //     .catch(e => {
        //         if (e.statusCode == 500) {
        //             alert("Terjadi Kesalahan Pada Sistem!\nHarap Simpan Kembali!");
        //         } else {
        //             this.error = e;
        //         }
        //     })
    }

    cancelLateReason() {
            this.showLateReasonDialog = false;
            this.data.reasonLate = "";
        }

    submitLateReason() {
        if (!this.data.reasonLate || this.data.reasonLate.trim() === "") {
            alert("Alasan keterlambatan wajib diisi!");
            return;
        }

        this.showLateReasonDialog = false;
        this.saveData();
    }

    saveData() {
        this.service.create(this.data)
            .then(result => {
                alert("Data berhasil dibuat");
                this.router.navigateToRoute('create',{}, { replace: true, trigger: true });
            })
            .catch(e => {
                if (e.statusCode == 500) {
                    alert("Terjadi Kesalahan Pada Sistem!\nHarap Simpan Kembali!");
                } else {
                    this.error = e;
                }
            })
    }
}
