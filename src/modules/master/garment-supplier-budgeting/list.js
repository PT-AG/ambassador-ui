import { inject } from "aurelia-framework";
import { Service } from "./service";
import { Router } from "aurelia-router";
import { Base64Helper } from "../../../utils/base-64-coded-helper";

@inject(Router, Service)
export class List {
  context = ["detail", "nonaktif"];
  columns = [
    {
      field: "Activated",
      title: "Activate",
      checkbox: true,
      sortable: false,
      formatter: function (value, data, index) {
        this.checkboxEnabled = !(data.Active || data._active);
        return "";
      },
    },
    { field: "code", title: "Kode" },
    { field: "name", title: "Nama" },
    { field: "country", title: "Negara" },
    { field: "address", title: "Alamat" },
    { field: "NPWP", title: "NPWP" },
    {
      field: "import",
      title: "Import",
      formatter: function (value, row, index) {
        return value ? "YA" : "TIDAK";
      },
    },
    {
      field: "usevat",
      title: "Kena PPN",
      formatter: function (value, row, index) {
        return value ? "YA" : "TIDAK";
      },
    },
    {
      field: "usetax",
      title: "Kena PPH",
      formatter: function (value, row, index) {
        return value ? "YA" : "TIDAK";
      },
    },
    {
      field: "Active",
      title: "Active",
      formatter: function (value, row, index) {
        return (value || row._active) ? "SUDAH" : "BELUM";
      },
    },
  ];

  dataToBePosted = [];

  rowFormatter(data, index) {
    if (data.Active || data._active) return { classes: "success" };
    else return {};
  }

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
      for (var d of result.data) {
        d.Active = d.Active !== undefined ? d.Active : d._active;
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

  contextCallback(event) {
    var arg = event.detail;
    var data = arg.data;
    switch (arg.name) {
      case "detail":
      case "Detail":
        const encoded = Base64Helper.encode(data.Id || data._id);
        this.router.navigateToRoute("view", { id: encoded });
        break;
      case "nonaktif":
        this.service
          .nonActived(data.Id || data._id)
          .then((result) => {
            this.table.refresh();
          })
          .catch((e) => {
            this.error = e;
          });
        break;
    }
  }

  contextShowCallback(index, name, data) {
    switch (name) {
      case "nonaktif":
        return data.Active || data._active;
      default:
        return true;
    }
  }

  posting() {
    if (this.dataToBePosted.length > 0) {
      this.service
        .post(this.dataToBePosted)
        .then((result) => {
          if (result && result.error) {
            alert(result.error);
            return;
          }
          this.table.refresh();
        })
        .catch((e) => {
          var message = "Terjadi error";
          if (e) {
            if (e.error) {
              message = e.error;
            } else if (e.message) {
              message = e.message;
            }
          }
          alert(message);
        });
    } else {
      alert("Tidak ada data dipilih");
    }
  }

  create() {
    this.router.navigateToRoute("create");
  }

  upload() {
    this.router.navigateToRoute("upload");
  }
}
