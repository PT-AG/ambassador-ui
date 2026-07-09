import { inject, Lazy } from "aurelia-framework";
import { Router } from "aurelia-router";
import { Service } from "./service";
import moment from "moment";
import { Base64Helper } from "../../../utils/base-64-coded-helper";

@inject(Router, Service)
export class Detail {
  constructor(router, service) {
    this.service = service;
    this.router = router;
    this.today = new Date();
  }

  async activate(params) {
    const decoded = Base64Helper.decode(params.id);

    var id = decoded;

    this.id = id;
    var filterBookingOrderId = { BookingOrderId: id };
    var info = { filter: JSON.stringify(filterBookingOrderId) };
    var datas = await this.service.getMasterPlanByBookingOrderId(info);
    this.total = 0;
    for (var a of datas) {
      this.data = a.Items;
      this.BOId = a.BookingOrderId;
    }
    for (var a of this.data) {
      2;
      a.confirm = a.IsConfirm ? "Ya" : "Tidak";
      var EndDate = moment(a.EndDate).format("DD MMM YYYY");
      var StartDate = moment(a.StartDate).format("DD MMM YYYY");
      a.week = `W${a.WeekNumber} - ${StartDate} s/d ${EndDate}`;
      this.total += a.OrderQuantity;
      a.SMVSewing = a.SMVSewing.toFixed(2);
    }
  }

  cancel(event) {
    const encoded = Base64Helper.encode(this.id);

    this.router.navigateToRoute("view", {
      id: encoded,
    });
  }
}
