import { inject } from 'aurelia-framework';
import { Router } from 'aurelia-router';
import { Service,PurchasingService } from './service';

@inject(Router, Service,PurchasingService)
export class View {
    isView = true;
    constructor(router, service,purchasingService) {
        this.router = router;
        this.service = service;
        this.purchasingService = purchasingService;
    }

    async activate(params) {
        let id = params.id;
        this.data = await this.service.read(id);
        if (this.data.IsPosted) {
            this.deleteCallback = null;
            this.editCallback = null;
            this.hasUnpost = true;
        }
        if (this.data.IsReceived) {
            this.unpostCallback = null;
            this.hasUnpost = false;
        }

        if (this.data.SampleProducts) {
            this.data.SampleProducts.sort(function (a, b) {
                return a.Index - b.Index;
            });
        }
        if (this.data.SampleSpecifications) {
            this.data.SampleSpecifications.sort(function (a, b) {
                return a.Index - b.Index;
            });
        }

        if (this.data.IsRejected) {
            this.alertDanger = "<strong>Alasan Reject </strong> " + this.data.RejectedReason;
        }

        if (this.data.IsRevised) {
            this.alertInfo = "<strong>Alasan Revisi </strong> " + this.data.RevisedReason;
        }

        //validate data with UnitDeliveryOrder
        this.purchasingService.searchUnitDeliveryOrder({ size: 1, filter: JSON.stringify({ RONo: this.data.RONoSample }) })
        .then((res) => {
            if (res.data.length > 0) {
                this.deleteCallback = null;
            }
        });

    }

    cancelCallback(event) {
        this.router.navigateToRoute('list');
    }

    editCallback(event) {
        this.router.navigateToRoute('edit', { id: this.data.Id });
    }

    deleteCallback(event) {
        if (confirm(`Hapus ${this.data.SampleRequestNo}?`))
            this.service.delete(this.data)
                .then(result => {
                    this.cancelCallback();
                })
                .catch(e => {
                    this.error = e;
                    if (typeof (this.error) == "string") {
                        alert(this.error);
                    } else {
                        alert("Missing Some Data");
                    }
                })
    }

    unpostCallback(event) {
        if (confirm(`Unpost ${this.data.SampleRequestNo}?`)) {
            var ids = [];
            ids.push(this.data.Id)
            var dataToBeUnPosted = {
                id: ids,
                Posted: false
            }
            this.service.postSample(dataToBeUnPosted)
                .then(result => {
                    this.cancelCallback();
                })
                .catch(e => {
                    this.error = e;
                    if (typeof (this.error) == "string") {
                        alert(this.error);
                    } else {
                        alert("Missing Some Data");
                    }
                })
        }

    }
}