import { inject, Lazy } from "aurelia-framework";
import { Router } from "aurelia-router";
import { Service } from "./service";
import { CoreService } from "./service";
import { Base64Helper } from '../../../utils/base-64-coded-helper';

@inject(Router, Service, CoreService)
export class Update {
  hasCancel = true;
  hasSave = true;
  isEdit = false;
  isUpdated = true;
  isCreate = false;

  constructor(router, service, coreService) {
    this.router = router;
    this.service = service;
    this.coreService = coreService;
  }

  bind() {
    this.error = {};
  }

  async activate(params) {
    const decoded = Base64Helper.decode(params.id);
    var id = decoded;

    this.data = await this.service.getById(id);
    console.log(this.data);
    if (this.data.isUsed == true) {
      this.isUsed = true;
    } else {
      this.isUsed = false;
    }
  }

  cancel(event) {
    const encoded = Base64Helper.encode(this.data.id);
    this.router.navigateToRoute("view", { id: encoded });
    //this.router.navigateToRoute('view', { id: this.data.Id });
  }

  save(event) {
    this.service
      .update(this.data)
      .then((result) => {
        this.cancel();
      })
      .catch((e) => {
        this.error = e;
      });
  }
}
