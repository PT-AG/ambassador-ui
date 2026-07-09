import { inject, Lazy } from "aurelia-framework";
import { Router } from "aurelia-router";
import { Service } from "./service";
import { Base64Helper } from "../../../utils/base-64-coded-helper";
import moment from "moment";

@inject(Router, Service)
export class View {
  hasCancel = true;
  hasEdit = true;
  hasDelete = true;
  hascancelConfirm = false;
  hasConfirm = false;
  hasMasterPlan = false;
  expireBooking = false;

  constructor(router, service) {
    this.router = router;
    this.service = service;
  }

  async activate(params) {
    const decoded = Base64Helper.decode(params.id);
    var id = decoded;
    this.data = await this.service.getById(id);

    if (
      this.data.CanceledQuantity > 0 ||
      this.data.ExpiredBookingQuantity > 0
    ) {
      this.beginingOrderQuantity =
        this.data.OrderQuantity +
        this.data.ExpiredBookingQuantity +
        this.data.CanceledQuantity;
    }
    this.selectedSection = {
      Code: this.data.SectionCode,
      Name: this.data.SectionName,
    };
    this.selectedBuyer = {
      Code: this.data.BuyerCode,
      Name: this.data.BuyerName,
    };

    var today = new Date();
    today.setDate(today.getDate() + 40);
    var deliveryDates = new Date(Date.parse(this.data.DeliveryDate));
    if (
      this.data.ConfirmedQuantity === 0 &&
      deliveryDates > today &&
      this.data.HadConfirmed === false
    ) {
      this.hasEdit = true;
      this.hasDelete = true;
      this.hascancelConfirm = true;
    } else if (
      this.data.HadConfirmed === true &&
      this.data.ConfirmedQuantity < this.data.OrderQuantity &&
      deliveryDates > today
    ) {
      this.hasEdit = false;
      this.hasDelete = true;
      this.hascancelConfirm = true;
    }
    if (deliveryDates > today) {
      this.hasConfirm = true;
    }
    if (
      this.data.ConfirmedQuantity < this.data.OrderQuantity &&
      deliveryDates > today &&
      this.data.ConfirmedQuantity != 0
    ) {
      this.hascancelConfirm = true;
      this.hasEdit = false;
      this.hasDelete = false;
      this.expireBooking = false;
      this.hasConfirm = true;
    }
    if (
      this.data.ConfirmedQuantity < this.data.OrderQuantity &&
      deliveryDates <= today
    ) {
      this.expireBooking = true;
      this.hasEdit = false;
      this.hasDelete = false;
    }
    if (
      this.data.ConfirmedQuantity >= this.data.OrderQuantity &&
      this.data.IsBlockingPlan === true
    ) {
      this.hasEdit = false;
      this.hasDelete = false;
      //this.hasConfirm = false;
    }
    if (
      this.data.ConfirmedQuantity >= this.data.OrderQuantity &&
      this.data.IsBlockingPlan === false
    ) {
      this.hasCancel = true;
      this.hasDelete = false;
      this.hasEdit = false;
      this.hasConfirm = true;
    }
    if (deliveryDates <= today) {
      this.hasConfirm = false;
    }
    if (this.data.IsBlockingPlan == true) {
      this.hasMasterPlan = true;
    }
  }

  cancel(event) {
    this.router.navigateToRoute("list");
  }

  edit(event) {
    const encoded = Base64Helper.encode(this.data.Id);
    this.router.navigateToRoute("edit", { id: encoded });
  }

  cancelBooking() {
    this.service.cancelBooking(this.data).then((result) => {
      this.cancel();
    });
  }

  confirmBooking(event) {
    const encoded = Base64Helper.encode(this.data.Id);

    this.router.navigateToRoute("confirm", {
        id: encoded
    });
  }

  masterPlan(event) {
    const encoded = Base64Helper.encode(this.data.Id);

    this.router.navigateToRoute("detail", {
        id: encoded
    });
  }

  expired() {
    this.service.expiredBooking(this.data).then((result) => {
      this.cancel();
    });
  }

  delete(event) {
    this.service.delete(this.data).then((result) => {
      this.cancel();
    });
  }

  onitemchange(event) {
    var indexCanceledItem = this.data.Items.findIndex(
      (item) => item.IsCanceled,
    );

    if (indexCanceledItem > -1) {
      this.data.cancelConfirm = true;
      this.service
        .update(this.data)
        .then((result) => {
          alert("Confirm Canceled");
          // this.hasEdit = true;
          // this.hasDelete = true;
          // this.hascancelConfirm = true;
          // this.hasConfirm = true;
          const encoded = Base64Helper.encode(this.data.Id);
          this.activate({
              id: encoded
          });
        })
        .catch((e) => {
          this.error = e;
          const encoded = Base64Helper.encode(this.data.Id);
          this.activate({
              id: encoded
          });
        });
    }
  }
}
