import { inject } from "aurelia-framework";
import { Router } from "aurelia-router";
import { Service } from "./service";

@inject(Router, Service)
export class View {

    constructor(router, service) {
        this.router = router;
        this.service = service;
    }

    activate(params) {
        this.id = params.id;

        return this.service.getById(this.id)
            .then(po => {
                this.data = po;
            });
    }

    approve() {
        if (!confirm("Yakin ingin menyetujui PO External ini?")) return;

        this.service.approveKabag(this.id)
            .then(() => {
                alert("PO berhasil di-approve Kabag.");
                this.router.navigateToRoute("list");
            })
            .catch(err => {
                console.error(err);
                alert("Terjadi kesalahan saat approve.");
            });
    }

    back() {
        this.router.navigateToRoute("list");
    }
}
