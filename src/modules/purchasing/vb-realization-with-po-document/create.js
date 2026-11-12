import { inject, Lazy } from "aurelia-framework";
import { Router } from "aurelia-router";
import { Service } from "./service";
import { activationStrategy } from "aurelia-router";

@inject(Router, Service)
export class Create {
  constructor(router, service) {
    this.router = router;
    this.service = service;
    this.data = {};
    this.data.Date = new Date();
  }

  isCreate = true;

  activate(params) {}

  list() {
    this.router.navigateToRoute("list");
  }

  determineActivationStrategy() {
    return activationStrategy.replace;
  }

  cancelCallback(event) {
    this.list();
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

    this.service
      .create(this.data)
      .then((result) => {
        alert("Data berhasil dibuat");
        this.router.navigateToRoute(
          "create",
          {},
          { replace: true, trigger: true }
        );
      })
      .catch((e) => {
        this.error = e;
        this.handleError(e);
      });
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
