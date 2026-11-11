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
    bind() {
        this.data = { Items: [] };
        this.error = {};
    }

    cancel(event) {
        this.router.navigateToRoute('list');
    }

    determineActivationStrategy() {
        return activationStrategy.replace; //replace the viewmodel with a new instance
        // or activationStrategy.invokeLifecycle to invoke router lifecycle methods on the existing VM
        // or activationStrategy.noChange to explicitly use the default behavior
        // return activationStrategy.invokeLifecycle;
    }

    save(event) {
        let dataToBeSaved = Object.assign({}, this.data);
        // dataToBeSaved.Items = this.data.Items.filter(item => item.IsSave);
        this.service.create(dataToBeSaved)
            .then(result => {
                alert("Data berhasil dibuat");
                this.router.navigateToRoute('create', {}, { replace: true, trigger: true });
            })
            .catch(e => {
                if (e.statusCode === 500) {
                    alert("Gagal menyimpan, silakan coba lagi!");
                } else {
                    this.error = e;
                    this.alertItemsWithoutRackingDetails(e);
                }
            })
    }

    alertItemsWithoutRackingDetails(error) {
        const itemErrors = (error && error.Items) || [];
        const missingItems = [];

        this.data.Items.forEach((item, index) => {
            const err = itemErrors[index];
            if (!err) return;

            const missingFields = [];
            if (err.Lot) missingFields.push("Lot");
            if (err.Width) missingFields.push("Lebar");

            if (missingFields.length > 0) {
                const packageInfo = item.PackageNo ? ` (No Package: ${item.PackageNo})` : "";
                missingItems.push(`- ${item.ProductCode} - ${item.ProductName}${packageInfo} : ${missingFields.join(" & ")} belum diisi`);
            }
        });

        if (missingItems.length === 0) {
            return;
        }

        alert(`Data tidak dapat disimpan karena data Racking belum lengkap:\n${missingItems.join("\n")}\n\nSilakan lengkapi Lot / Lebar melalui menu Racking terlebih dahulu.`);
    }
}