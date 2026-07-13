import { inject } from "aurelia-framework";
import { Service } from "./service";
import { Router } from "aurelia-router";
import moment from "moment";
import { Base64Helper } from '../../../utils/base-64-coded-helper';

@inject(Router, Service)
export class List {
  context = ["detail", "Cetak PDF"];

  columns = [
    { field: "localSalesDONo", title: "No DO Penjualan Lokal" },
    {
      field: "date",
      title: "Tgl DO",
      formatter: function (value) {
        return moment(value).format("DD MMM YYYY");
      },
    },
    { field: "localSalesNoteNo", title: "No Nota Penjualan" },
    { field: "buyerName", title: "Buyer" },
    { field: "to", title: "Kepada" },
    { field: "storageDivision", title: "Bag Gudang" },
  ];

  loader = (info) => {
    var order = {};
    if (info.sort) order[info.sort] = info.order;

    var arg = {
      page: parseInt(info.offset / info.limit, 10) + 1,
      size: info.limit,
      keyword: info.search,
      order: order,
    };

    return this.service.search(arg).then((result) => {
      for (const data of result.data) {
        data.buyerName = `${data.buyer.name}`;
      }

      return {
        total: result.info.total,
        data: result.data,
      };
    });
  };

  constructor(router, service) {
    this.service = service;
    this.router = router;
  }

  contextClickCallback(event) {
    var arg = event.detail;
    var data = arg.data;
    switch (arg.name) {
      case "detail":
        const encoded = Base64Helper.encode(data.id);
        this.router.navigateToRoute("view", { id: encoded });
        //this.router.navigateToRoute('view', { id: data.id });
        
        break;
      case "Cetak PDF":
        this.service.getPdfById(data.id);
        break;
    }
  }

  create() {
    this.router.navigateToRoute("create");
  }
}
