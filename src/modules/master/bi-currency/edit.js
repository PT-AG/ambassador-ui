import { inject, Lazy } from "aurelia-framework";
import { Router } from "aurelia-router";
import { Service } from "./service";
import { Base64Helper } from "../../../utils/base-64-coded-helper";

@inject(Router, Service)
export class Edit {
  constructor(router, service) {
    this.router = router;
    this.service = service;
  }

  async activate(params) {
    const decoded = Base64Helper.decode(params.id);
    var id = decoded;

    this.data = await this.service.getById(id);
  }

  bind(context) {
    this.context = context;
    this.data = this.context.data;

    this.cancelCallback = this.context.cancelCallback;
    this.deleteCallback = this.context.deleteCallback;
    this.editCallback = this.context.editCallback;
    this.saveCallback = this.context.saveCallback;
  }

  list() {
    this.router.navigateToRoute("list");
  }

  cancelCallback(event) {
    const encoded = Base64Helper.encode(this.data.Id);
    this.router.navigateToRoute("view", { id: encoded });
    //this.router.navigateToRoute('view', { id: this.data.Id });
  }

  saveCallback(event) {
    // this.data.deliverySchedule = moment(this.data.deliverySchedule).format("YYYY-MM-DD");

    this.data.Rate = Number(this.data.Rate).toFixed(4);
    this.service
      .update(this.data)
      .then((result) => {
        const encoded = Base64Helper.encode(this.data.Id);
        this.router.navigateToRoute("view", { id: encoded });
      })
      .catch((e) => {
        this.error = e;
      });
  }
}
