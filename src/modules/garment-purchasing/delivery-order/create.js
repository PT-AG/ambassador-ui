import { inject, Lazy } from 'aurelia-framework';
import { Router } from 'aurelia-router';
import { Service } from './service';
import { activationStrategy } from 'aurelia-router';

@inject(Router, Service)
export class Create {
    hasCancel = true;
    hasSave = true;
    hasView = false;
    hasCreate = true;
    hasEdit = false;

    constructor(router, service) {
        this.router = router;
        this.service = service;
    }
    activate(params) {

    }
    bind() {
        this.data = { items: [] };
        this.data.isCustoms=true;
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

    validateHSCodeBeforeSave() {
    if (!this.data || !this.data.items || this.data.items.length === 0)
        return true;

    const allFulfillments = this.data.items.flatMap(item =>
        (item.fulfillments || []).filter(f => f.isSave === true)
    );

    const allProducts = allFulfillments
        .map(f => f.product)
        .filter(p => p);

    const uniqueProducts = allProducts.filter(
        (value, index, self) =>
        index === self.findIndex(t => t.Code === value.Code)
    );

    const hasEmptyHSCode = uniqueProducts.some(
        p => !p.HSCode || p.HSCode.trim() === ""
    );

    if (hasEmptyHSCode && this.data.supplier.import) {
        alert("HS Code belum diisi");
        return false; 
    }

    return true; 
    }

    save(event) {
        if(this.data.items.length>0){
            this.data.paymentType = this.data.items[0].paymentType;
            this.data.paymentMethod = this.data.items[0].paymentMethod;
            this.data.currency = this.data.items[0].currency;
            this.data.useVat = this.data.items[0].useVat;
            this.data.vat = this.data.items[0].vat;
            this.data.useIncomeTax = this.data.items[0].useIncomeTax;
            this.data.isPayVAT = this.data.items[0].isPayVAT;
            this.data.isPayIncomeTax = this.data.items[0].isPayIncomeTax;
            this.data.incomeTax = this.data.items[0].incomeTax;
        }
        console.log(this.data);
         if (!this.validateHSCodeBeforeSave()  ) {
            return;
        }
        this.service.create(this.data)
            .then(result => {
                alert("Data berhasil dibuat");
                this.router.navigateToRoute('create', {}, { replace: true, trigger: true });
            })
            .catch(e => {
                this.error = e; 
            })
    }
}
