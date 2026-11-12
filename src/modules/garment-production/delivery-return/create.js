import { inject } from 'aurelia-framework';
import { Router } from 'aurelia-router';
import { Service } from './service';
import { activationStrategy } from 'aurelia-router';
import moment from 'moment';

@inject(Router, Service)
export class Create {
    isCreate = true;

    constructor(router, service) {
        this.router = router;
        this.service = service;
    }

    activate(params) {

    }

    bind() {
        this.data = { Items: [] };
        this.error = {};
    }

    determineActivationStrategy() {
        return activationStrategy.replace; //replace the viewmodel with a new instance
        // or activationStrategy.invokeLifecycle to invoke router lifecycle methods on the existing VM
        // or activationStrategy.noChange to explicitly use the default behavior
        // return activationStrategy.invokeLifecycle;
    }

    cancelCallback(event) {
        this.router.navigateToRoute('list');
    }

    saveCallback(event) {
        if (this.isSaving) {
            return;
        }
        this.data.ReturnDate = this.data.ReturnDate ? moment(moment(this.data.ReturnDate).format("DD MMM YYYY")).toDate() : null;
        // let objData = {};
        // let data = Object.assign(objData, this.data);
        // data.Items = data.Items.filter(x => x.IsSave==true);
        this.isSaving = true;
        this.service.create(this.data)
            .then(result => {
                alert("Data berhasil dibuat");
                this.router.navigateToRoute('create', {}, { replace: true, trigger: true });
            })
            .catch(e => {
                this.isSaving = false;
                if (e && e.statusCode === 500 && e.message) {
                    alert(e.message);
                    return;
                }
                this.error = e;
                // this.error.Items[1]=this.error.Items[0];
                if (typeof (this.error) == "string") {
                    alert(this.error);
                } else {
                    alert("Missing Some Data");
                }
            })
    }
}