import { inject } from "aurelia-framework";
import { Router } from "aurelia-router";
import moment from "moment";
import numeral from "numeral";
import { Service } from "./service";
import { Base64Helper } from "../../../utils/base-64-coded-helper";

@inject(Router, Service)
export class List {
  context = ["Detail","Cetak PDF"];

  columns = [
    { field: "DocumentNo", title: "No Dokumen" },
    {
      field: "Date",
      title: "Tanggal Pengeluaran Bank",
      formatter: function (value, data, index) {
        return moment(value).format("DD MMM YYYY");
      },
    },
    { field: "VBRealizationDocumentNo", title: "Nomor Realisasi VB" },
    {
      field: "Amount",
      title: "Nominal Realisasi",
      formatter: function (value, data, index) {
        return numeral(value).format("0,000.00");
      },
      align: "right",
    },
  ];

  constructor(router, service) {
    this.service = service;
    this.router = router;

  }

  changeRole(role) {
    if (role.key !== this.activeRole.key) {
      this.activeRole = role;
      this.tableList.refresh();
    }
  }

  loader = (info) => {
    let order = {};

    if (info.sort) order[info.sort] = info.order;
    let arg = {
      page: parseInt(info.offset / info.limit, 10) + 1,
      size: info.limit,
      keyword: info.search,
      order: order
    };

    return this.service.search(arg).then((result) => {
      console.log(result.data);
      for (var _data of result.data) {
        var docNo = _data.VBRealizations.map(function (item) {
          return `<li>${item.DocumentNo}</li>`;
        });
        docNo = docNo.filter(function (elem, index, self) {
          return index == self.indexOf(elem);
        });
        var vbReq = _data.VBRealizations.map(function (item) {
          return `<li>${item.DocumentNo}</li>`;
        });
        vbReq = vbReq.filter(function (elem, index, self) {
          return index == self.indexOf(elem);
        });
        //_data.DocumentNo = `<ul>${docNo.join()}</ul>`;
        _data.VBRealizationDocumentNo = `<ul>${vbReq.join()}</ul>`;
      }
      return Promise.all(result.data).then((data) => {
        return {
          total: result.info.Count,
          data,
        };
      });
    });
  };

  contextClickCallback(event) {
    let arg = event.detail;
    let data = arg.data;

    switch (arg.name) {
        case "Detail":
            const encoded = Base64Helper.encode(data.Id);
            this.router.navigateToRoute('view', { id: encoded });
            break;
        case "Cetak PDF":
            this.service.getPdfById(data.Id);
            break;
    }
  }

  create() {
    this.router.navigateToRoute("create");
  }
}
