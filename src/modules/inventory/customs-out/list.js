import { inject } from "aurelia-framework";
import { Service } from "./service";
import { Router } from "aurelia-router";
import { AuthService } from "aurelia-authentication";
var moment = require("moment");

@inject(Router, Service, AuthService)
export class List {
  constructor(router, service) {
    this.service = service;
    this.router = router;
  }

  context = ["Rincian"];

  columns = [
    { field: "BCType", title: "Jenis BC" },
    { field: "BCNo", title: "Nomor BC" },
    {
      field: "BCDate",
      title: "Tanggal BC",
      formatter: (value) => moment(value).format("DD MMM YYYY"),
    },
    {
      field: "ListNote",
      title: "List Nota Pengeluaran Gudang Sisa - Aval",
      sortable: false,
    },
  ];

  loader = (info) => {
    var order = {};
    if (info.sort) order[info.sort] = info.order;

    var arg = {
      page: parseInt(info.offset / info.limit, 10) + 1,
      size: info.limit,
      keyword: info.search,
      order: order,
      filter: JSON.stringify(this.filter),
    };

    return this.service.search(arg).then((result) => {
      var data = {};
      data.total = result.info.total;
      data.data = result.data;
      result.data.forEach((s) => {
        s.ListNote = `${s.Items.map(
          (p) => `- ${p.AvalExpenditureNo == null ? "" : p.AvalExpenditureNo}`
        ).join("<br/>")}`;
      });

      return {
        total: result.info.total,
        data: result.data,
      };
    });
  };

  async contextClickCallback(event) {
    var arg = event.detail;
    var data = arg.data;
    switch (arg.name) {
      case "Rincian":
        this.router.navigateToRoute("view", { id: data.Id });
        break;
      case "Cetak PDF":
        this.service.getPdfById(data.Id, buyer);
        break;
    }
  }

  create() {
    this.router.navigateToRoute("create");
  }
}
