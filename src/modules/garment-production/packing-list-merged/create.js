import { inject, Lazy } from 'aurelia-framework';
import { Router } from 'aurelia-router';
import { Service } from './service';
import { activationStrategy } from 'aurelia-router';
import { createSavePayload, validateDetailRowsQuantity } from './helper';

@inject(Router, Service)
export class Create {

    constructor(router, service) {
        this.router = router;
        this.service = service;
    }

    bind() {
        this.data = {
            date: new Date(),
            createdUtc: new Date()
        };
        
        this.error = {};
    }

    determineActivationStrategy() {
        return activationStrategy.replace; //replace the viewmodel with a new instance
        // or activationStrategy.invokeLifecycle to invoke router lifecycle methods on the existing VM
        // or activationStrategy.noChange to explicitly use the default behavior
    }

    cancelCallback(event) {
        if (confirm("Apakah Anda yakin keluar dari halaman ini?")) {
            this.router.navigateToRoute('list');
        }
    }

    saveCallback(event) {
        const invalidItem = (this.data.items || []).find(item => !validateDetailRowsQuantity(item));
        if (invalidItem) {
            alert(invalidItem.detailRowsQuantityError);
            return;
        }

        this.newData = createSavePayload(this.data);

        this.newData.IsFile = true;
        this.newData.mode = 
            this.newData.items && this.newData.items.length > 0 
                ? "UPDATE" 
                : "CREATE";
                
        this.service.create(this.newData)
            .then(result => {
                alert("Data berhasil dibuat, No Packing List: " + result);
                this.router.navigateToRoute('create', {}, { replace: true, trigger: true });
            })
            .catch(error => {
                this.error = error;

                let errorNotif = "";
                if (error.InvoiceType || error.Type || error.Date || error.ItemsCount || error.Items) {
                    errorNotif += "Tab DESCRIPTION ada kesalahan pengisian.\n"
                }
                if (error.GrossWeight || error.NettWeight || error.totalCartons || error.SayUnit || error.MeasurementsCount || error.Measurements) {
                    errorNotif += "Tab DETAIL MEASUREMENT ada kesalahan pengisian.\n"
                }
                if (error.ShippingMark || error.SideMark || error.Remark) {
                    errorNotif += "Tab SHIPPING MARK - SIDE MARK - REMARK ada kesalahan pengisian."
                }

                if (errorNotif) {
                    alert(errorNotif);
                }
            });
    }
}
