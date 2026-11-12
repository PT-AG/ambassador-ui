import { inject, Lazy } from 'aurelia-framework';
import { Router } from 'aurelia-router';
import { Service } from './service';


@inject(Router, Service)
export class Edit {
    hasCancel = true;
    hasSave = true;

    constructor(router, service) {
        this.router = router;
        this.service = service;
    }

    bind() {
        this.error = {};
    }

    async activate(params) {
        var id = params.id;
        this.data = await this.service.getById(id);

        if (this.data) {
            if (this.data.UnitRequest) {
                this.unitRequest = this.data.UnitRequest;
            }

            if (this.data.UnitSender) {
                this.unitSender = this.data.UnitSender;
            }

            if (this.data.Storage) {
                this.storage = this.data.Storage;
            }

            if (this.data.StorageRequest) {
                this.storageRequest = this.data.StorageRequest;
            }

            if (this.data.RONo) {
                this.RONoSample = this.data.RONo
            }

            if (this.data.Items) {
                for (let item of this.data.Items) {
                    item.IsSave = true;
                    item.IsDisabled = false;
                }
            }

            if(this.data.UnitDOType)
            {
                this.unitDOType = this.data.UnitDOType;
            }
        }
    }

    cancel(event) {
        this.router.navigateToRoute('view', { id: this.data.Id });
    }

    save(event) {
        this.service.update(this.data).then(result => {
            this.cancel();
        }).catch(e => {
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

