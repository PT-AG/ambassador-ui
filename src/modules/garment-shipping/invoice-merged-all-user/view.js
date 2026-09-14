import { inject } from "aurelia-framework";
import { Router } from "aurelia-router";
import { Service } from "./service";
import { Base64Helper } from "../../../utils/base-64-coded-helper";

@inject(Router, Service)
export class View {
  constructor(router, service) {
    this.router = router;
    this.service = service;
  }
  isView = true;
  isEdit = false;
  isUpdated = false;

  async activate(params) {
    const decoded = Base64Helper.decode(params.id);
    var id = decoded;

    this.data = await this.service.getById(id);
    this.hasEdit = true;
    this.hasUpdated = true;
    this.hasCancel = true;
    if (this.data.isUsed == true) {
      this.hasDelete = false;
    } else {
      this.hasDelete = true;
    }
  }

  cancel(event) {
    this.router.navigateToRoute("list");
  }
  edit(event) {
    const encoded = Base64Helper.encode(this.data.id);
    this.router.navigateToRoute("edit", { id: encoded });
    this.router.navigateToRoute("edit", { id: encoded });
  }
  delete(event) {
    if (confirm(`Hapus ${this.data.invoiceNo}?`))
      this.service
        .delete(this.data)
        .then((result) => {
          this.cancel();
        })
        .catch((e) => {
          this.error = e;
        });
  }
  update(event) {
    this.router.navigateToRoute("update", { id: this.data.id });
  }
}
