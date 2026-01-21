import { inject, Lazy } from 'aurelia-framework';
import { Router } from 'aurelia-router';
import { Service } from './service';
import { activationStrategy } from 'aurelia-router';

@inject(Router, Service)
export class Create {
    hasCancel = true;
    hasSave = true;
    constructor(router, service) {
        this.router = router;
        this.service = service;
        this.data = {};
    }

    activate(params) {

    }

    cancel(event) {
        this.router.navigateToRoute('list');
    }

    determineActivationStrategy() {
        return activationStrategy.replace;
    }

    bind() {
        this.error = {};
        this.data.isView = false;
        this.data.lateReason = null;
    }

    checkIsLate() {
        if (!this.data.items || this.data.items.length === 0) {
            return false;
        }

        var today = moment().startOf('day'); 

        for (var item of this.data.items) {
            if (item.garmentInvoice && item.garmentInvoice.invoiceDate && item.garmentInvoice.items) {
                
                var invoiceDate = moment(item.garmentInvoice.invoiceDate).startOf('day');

                for (var invoiceItem of item.garmentInvoice.items) {
                    for (var detail of invoiceItem.details) {
                        
                        var dueDays = detail.paymentDueDays || 0;

                        var dueDate = invoiceDate.clone().add(dueDays, 'days');

                        if (today.isAfter(dueDate)) {
                            return true;
                        }
                    }
                }
            }
        }
        return false;
    }

    save() 
    {
        if (this.checkIsLate()) {
            this.showLateReasonDialog = true; 
        } 
        else {
            this.saveData();
        }
    }

    cancelLateReason() {
        this.showLateReasonDialog = false;
        this.data.lateReason = null;
    }

    submitLateReason() {
        if (!this.data.lateReason || this.data.lateReason.trim() === "") {
            alert("Alasan keterlambatan wajib diisi!");
            return;
        }

        this.showLateReasonDialog = false;
        this.saveData();
    }

    //Enhance Jason Sept 2021
    validateDouble(valid)
    {
        var arrNo = [];
        var errCounter = 0;
        for(var data of valid.items)
        {
            arrNo.push(data.garmentInvoice.invoiceNo);
        }

        arrNo.forEach((v,i,a) => 
        {
            if(a.indexOf(v) != i)
            {
                errCounter++;
                alert("Terdapat Duplikasi Nomor Invoice " + a[i] + ". Mohon Menghapus Salah Satu Data Duplikat");
            }
        })
        return errCounter;
    }

    saveData() {
        for(var item of this.data.items)
        {
            for(var detail of item.details)
            {
                for(var doItem of detail.deliveryOrder.items)
                {
                    doItem.fulfillments=[];
                }
            }
        }

        //Enhance Jason Sept 2021
        //var validateDouble = this.validateDouble(this.data);
        var validateDouble = 0; //Use Backend Validation
        if(validateDouble == 0)
        {
            this.service.create(this.data)
            .then(result => 
                {
                alert("Data berhasil dibuat");
                this.router.navigateToRoute('create', {}, { replace: true, trigger: true });
            })
            .catch(e =>
                 {
                if (e.statusCode === 500) 
                {
                    alert("Gagal menyimpan, silakan coba lagi!");
                } else 
                {
                    this.error = e;
                }
            })
        }
    }
}
