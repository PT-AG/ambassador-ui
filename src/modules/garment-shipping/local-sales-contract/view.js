import { inject, Lazy } from "aurelia-framework";
import { Router } from "aurelia-router";
import { Service } from "./service";
import { Base64Helper } from "../../../utils/base-64-coded-helper";

@inject(Router, Service)
export class View {
  constructor(router, service) {
    this.router = router;
    this.service = service;
  }

  async activate(params) {
      const decoded = Base64Helper.decode(params.id);
      var id = decoded;

      this.data = await this.service.getById(id);

    if (this.data) {
      for (var item of this.data.items) {
        if (item.remainingQuantity != item.quantity) {
          this.deleteCallback = null;
          this.editCallback = null;
          break;
        }
      }
    }
    this.selectedTransactionType = this.data.transactionType;
  }

  cancelCallback(event) {
    this.router.navigateToRoute("list");
  }

  editCallback(event) {
    const encoded = Base64Helper.encode(this.data.id);
    this.router.navigateToRoute("edit", { id: encoded });
  }

  deleteCallback(event) {
    if (confirm("Hapus?")) {
      this.service.delete(this.data).then((result) => {
        this.cancelCallback();
      });
    }
  }
}
