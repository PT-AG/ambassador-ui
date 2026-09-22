import { inject } from "aurelia-framework";
import { Router } from "aurelia-router";
import moment from "moment";
import numeral from "numeral";
import { Dialog } from "../../../au-components/dialog/dialog";
import { Service } from "./service";
import { PermissionHelper } from "../../../utils/permission-helper";

@inject(Router, Service, Dialog, PermissionHelper)
export class List {
  context = ["Hapus"];

  columns = [
    { field: "ReferenceNo", title: "No Referensi" },
    // {
    //   field: "SendToVerificationDate",
    //   title: "Tanggal Penerimaan Verifikasi",
    //   formatter: function (value, data, index) {
    //     return moment(value).format("DD MMM YYYY");
    //   },
    // },
    //{ field: "VBRequestDocumentNo", title: "No VB" },
    { field: "DocumentNo", title: "Nomor Realisasi VB" },
    {
      field: "Amount",
      title: "Nominal Realisasi",
      formatter: function (value, data, index) {
        return numeral(value).format("0,000.00");
      },
      align: "right",
    },
  ];

  constructor(router, service, dialog, permissionHelper) {
    this.service = service;
    // this.purchasingDocumentExpeditionService = purchasingDocumentExpeditionService;
    this.router = router;
    this.dialog = dialog;

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
      order: order,
      position: 5,
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
          return `<li>${item.VBRequestDocumentNo}</li>`;
        });
        vbReq = vbReq.filter(function (elem, index, self) {
          return index == self.indexOf(elem);
        });
        _data.DocumentNo = `<ul>${docNo.join()}</ul>`;
        _data.VBRequestDocumentNo = `<ul>${vbReq.join()}</ul>`;
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
      case "Hapus":
        this.dialog
          .prompt("Apakah anda yakin ingin mengembalikan data ke verifikasi?")
          .then((response) => {
            if (response.ok) {
              this.service
                .cashierDelete(data.VBRealizationId, data)
                .then((result) => {
                  this.tableList.refresh();
                });
            }
          })
          .catch((e) => {
            this.error = e;
          });
        break;
    }
  }

  create() {
    this.router.navigateToRoute("create");
  }
}
