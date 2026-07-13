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
    this.error = {};
  }

  cancelCallback(event) {
    const encoded = Base64Helper.encode(this.data.id);
    this.router.navigateToRoute("view", { id: encoded });
    //this.router.navigateToRoute('view', { id: this.data.Id });
  }

  saveCallback(event) {
    this.service
      .update(this.data)
      .then((result) => {
        const encoded = Base64Helper.encode(this.data.id);
        this.router.navigateToRoute("view", { id: encoded });
        //this.router.navigateToRoute('view', { id: this.data.id });
      })
      .catch((e) => {
        this.error = e;
      });
  }
}
