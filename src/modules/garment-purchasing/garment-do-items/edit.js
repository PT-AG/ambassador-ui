import { inject, Lazy } from 'aurelia-framework';
import { Router } from 'aurelia-router';
import { Service } from './service';


@inject(Router, Service)
export class Edit {
    hasCancel = true;
    hasSave = true;
    hasView = false;
    isEdit = true;
    hasCreate = false;

    constructor(router, service) {
        this.router = router;
        this.service = service;
    }

    bind() {
        this.error = {};
        this.checkedAll = true;
    }

    async activate(params) {
        var id = params.id;
        this.data = await this.service.getById(id);
        this.data.isEdit = true;
        this.savedFilters = params.filter;

    }

    cancel(event) {
        this.router.navigateToRoute('list', { filter: this.savedFilters });
    }

    save(event) {
        if (this.data && (this.data.IsSplitted || this.data.isSplitted)) {
            if (this.data.Items && this.data.Items.length > 1) {
                alert("Item yang sudah di-split tidak dapat di-split lagi.");
                return;
            }
            if (this.data.Items && this.data.Items.length === 1 && parseFloat(this.data.Items[0].Quantity) !== parseFloat(this.data.RemainingQuantity)) {
                alert("Item yang sudah di-split tidak dapat diubah quantity-nya.");
                return;
            }
        }

        var itemQtySUm = 0;

        this.data.Items.forEach(x => {
            itemQtySUm += x.Quantity;
            if (x.Lot === null || x.Lot === undefined || x.Lot.toString().trim() === "" || x.Lot.toString().trim() === "-" || x.Lot.toString().trim() === "0") {
                x.Lot = "-";
            } else {
                const num = parseInt(x.Lot, 10);
                x.Lot = isNaN(num) ? "-" : num.toString();
            }
        });

        if (parseFloat(this.data.RemainingQuantity) != parseFloat(itemQtySUm).toFixed(2)) {
            alert("Jumlah Quantity Item harus sama dengan Quantity Sebelumnya");
            return;
        }

        const isFabric = this.data && this.data.ProductName && this.data.ProductName.trim().toUpperCase() === "FABRIC";
        if (isFabric) {
            let hasInvalidWidth = false;
            this.error = { Items: [] };
            this.data.Items.forEach((x) => {
                const itemError = {};
                const widthVal = parseFloat(x.Width);
                if (x.Width === null || x.Width === undefined || x.Width === "" || isNaN(widthVal) || widthVal <= 0) {
                    itemError.Width = "Lebar harus diisi dan tidak boleh 0";
                    hasInvalidWidth = true;
                } else {
                    x.Width = Math.round(widthVal).toString();
                }
                this.error.Items.push(itemError);
            });

            if (hasInvalidWidth) {
                alert("Lebar harus diisi dan tidak boleh 0");
                return;
            }
        }

        this.service.update(this.data).then(result => {
            alert("Data berhasil diubah");
            this.router.navigateToRoute('list', { filter: this.savedFilters });
        }).catch(e => {
            this.error = e;
            if (e && e.message) {
                alert(e.message);
            } else if (typeof e === "string") {
                alert(e);
            }
        });
    }
}