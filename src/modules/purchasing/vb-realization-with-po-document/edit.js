import { inject, Lazy } from 'aurelia-framework';
import { Router } from 'aurelia-router';
import { Service } from './service';
import { Base64Helper } from '../../../utils/base-64-coded-helper';

@inject(Router, Service)
export class Edit {
    isEdit = true;
    constructor(router, service) {
        this.router = router;
        this.service = service;
    }

    async activate(params) {
        const decoded = Base64Helper.decode(params.id);
        let id = decoded;
        this.data = await this.service.getById(id);
    }

    cancelCallback(event) {
           const encoded = Base64Helper.encode(this.data.Id);
            this.router.navigateToRoute('view', { id: encoded });
            //this.router.navigateToRoute('view', { id: this.data.Id });
    }

    saveCallback(event) {
        if (this.data && this.data.Items && this.data.Items.length > 1) {
            let spbNos = [];
            for (let i = 0; i < this.data.Items.length; i++) {
                let item = this.data.Items[i];
                if (item && item.UnitPaymentOrder && item.UnitPaymentOrder.No) {
                    if (spbNos.includes(item.UnitPaymentOrder.No)) {
                        alert(`No SPB duplikat: ${item.UnitPaymentOrder.No} pada baris ${i + 1}`);
                        return;
                    }
                    spbNos.push(item.UnitPaymentOrder.No);
                }
            }
        }

        this.service.update(this.data)
            .then(result => {
                    alert("Data berhasil diubah");
                    const encoded = Base64Helper.encode(this.data.Id);
                    this.router.navigateToRoute('view', { id: encoded });
                    //this.router.navigateToRoute('view', { id: this.data.Id });
            })
            .catch(e => {
                this.error = e;
                this.handleError(e);
            })
    }

    handleError(e) {
        let message = "";
        if (typeof e === "string") {
            message = e;
        } else if (e && e.Items && Array.isArray(e.Items)) {
            let itemErrors = [];
            e.Items.forEach((item, index) => {
                if (item) {
                    if (typeof item === "string") {
                        itemErrors.push(`Baris ${index + 1}: ${item}`);
                    } else {
                        for (let prop in item) {
                            if (item[prop]) {
                                itemErrors.push(`Baris ${index + 1}: ${item[prop]}`);
                            }
                        }
                    }
                }
            });
            if (itemErrors.length > 0) {
                message = itemErrors.join("\n");
            }
        } else if (e && typeof e === "object") {
            let errors = [];
            for (let key in e) {
                if (typeof e[key] === "string") {
                    errors.push(e[key]);
                }
            }
            if (errors.length > 0) {
                message = errors.join("\n");
            }
        }

        if (!message) {
            message = "Data tidak valid atau gagal disimpan";
        }

        alert(message);
    }
}
