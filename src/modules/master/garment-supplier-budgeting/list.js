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
        this.checkboxEnabled = !data.Active;
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
    // { field: "IncomeTaxes", title: "PPH", formatter: function (value, data, index) {
    //   if(data.IncomeTaxes.name == "" || data.IncomeTaxes.name == null && data.IncomeTaxes.rate == 0){
    //     return "-"
    //   }else{
    //     return data.IncomeTaxes.name + " - " + data.IncomeTaxes.rate;
    //   }
    // } },
  ];

  dataToBePosted = [];
  rowFormatter(data, index) {
    if (data.Active) return { classes: "success" };
    else return {};
  }

  loader = (info) => {
    var order = {};
    if (info.sort) order[info.sort] = info.order;

    var arg = {
      page: parseInt(info.offset / info.limit, 10) + 1,
      size: info.limit,
      keyword: info.search,
      select: [
        "code",
        "name",
        "address",
        "import",
        "NPWP",
        "usevat",
        "usetax",
        "IncomeTaxes",
        "country",
      ],
      order: order,
    };

    return this.service.search(arg).then((result) => {
      return {
        total: result.info.total,
        data: result.data,
      };
      data.IncomeTaxesName = result.data.IncomeTaxes.name;
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
        const encoded = Base64Helper.encode(data.Id);
        this.router.navigateToRoute("view", { id: encoded });
        //this.router.navigateToRoute('view', { id: data.Id });
        break;
      case "nonaktif":
        this.service
          .nonActived(data.Id)
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
        return data.Active;
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
