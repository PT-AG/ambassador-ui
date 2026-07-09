import { inject, Lazy } from "aurelia-framework";
import { Router } from "aurelia-router";
import { Service } from "./service";
import { Base64Helper } from "../../../utils/base-64-coded-helper";

@inject(Router, Service)
export class View {
  hasCancel = true;
  // hasDelete = true;

  constructor(router, service) {
    this.router = router;
    this.service = service;
  }

  async activate(params) {
    const decoded = Base64Helper.decode(params.id);
    var id = decoded;
    this.data = await this.service.getById(id);
  }

  cancel(event) {
    this.router.navigateToRoute("list");
  }

  delete(event) {
    this.service.delete(this.data).then((result) => {
      this.cancel();
    });
  }
}
