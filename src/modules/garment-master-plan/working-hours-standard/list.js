import { inject } from "aurelia-framework";
import { Service } from "./service";
import { Router } from "aurelia-router";
import { Base64Helper } from "../../../utils/base-64-coded-helper";
var moment = require("moment");

@inject(Router, Service)
export class List {
  dataToBeCompleted = [];

  constructor(router, service) {
    this.service = service;
    this.router = router;
  }

  bind() {
    this.setContext();
    this.setColumns();
  }

  setContext() {
    this.context = ["Rincian"];
  }

  setColumns() {
    this.columns = [
      { field: "start", title: "Awal (Jam)" },
      { field: "end", title: "Akhir (Jam)" },
      { field: "remark", title: "Keterangan" },
      // { field: "color", title: "Warna" }
    ];
  }

  loader = (info) => {
    var order = {};
    if (info.sort) order[info.sort] = info.order;

    var arg = {
      page: parseInt(info.offset / info.limit, 10) + 1,
      size: info.limit,
      keyword: info.search,
      select: ["start", "end", "remark", "color"],
      order: order,
    };

    return this.service.search(arg).then((result) => {
      return {
        total: result.info.total,
        data: result.data,
      };
    });
  };

  contextClickCallback(event) {
    var arg = event.detail;
    var data = arg.data;
    switch (arg.name) {
      case "Rincian":
        const encoded = Base64Helper.encode(data._id);
        this.router.navigateToRoute("view", { id: encoded });
        break;
    }
  }

  contextShowCallback(index, name, data) {
    return true;
  }

  create() {
    this.router.navigateToRoute("create");
  }
}
