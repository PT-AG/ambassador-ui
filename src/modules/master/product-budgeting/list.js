import { inject } from 'aurelia-framework';
import { Service } from "./service";
import { Router } from 'aurelia-router';

@inject(Router, Service)
export class List {
  context = ["detail","nonaktif"];
  columns = [
    {
      field: "Activated", title: "Activate", checkbox: true, sortable: false,
      formatter: function (value, data, index) {
        this.checkboxEnabled = !data.Active;
        return "" }
    },
    { field: "Code", title: "Kode Barang" },
    { field: "Name", title: "Nama Barang" },
    { field: "UomUnit", title: "Satuan Default" },
    { field: "CurrencyCode", title: "Mata Uang" },
    { field: "Price", title: "Harga Barang" },
    { field: "Tags", title: "Tags" },
    {
      field: "Active", title: "Active",
      formatter: function (value, row, index) {
        return value ? "SUDAH" : "BELUM";
      }
    },
  ];

  rowFormatter(data, index) {
    if (data.Active)
      return { classes: "success" }
    else
      return {}
  }

  loader = (info) => {
    var order = {};
    if (info.sort)
      order[info.sort] = info.order;

    var arg = {
      page: parseInt(info.offset / info.limit, 10) + 1,
      size: info.limit,
      keyword: info.search,
      order: order
    }

    return this.service.search(arg)
      .then(result => {
        for (var a of result.data) {
          a.UomUnit = a.UOM.Unit;
          a.CurrencyCode = a.Currency.Code;
        }
        return {
          total: result.info.total,
          data: result.data
        }
      });
  }

  constructor(router, service) {
    this.service = service;
    this.router = router;
    this.accessoriesId = "";
    this.accessories = [];
  }

  contextCallback(event) {
    var arg = event.detail;
    var data = arg.data;
    switch (arg.name) {
      case "detail":
        this.router.navigateToRoute('view', { id: data.Id });
        break;
      case "nonaktif":
        this.service.nonActived(data.Id).then(result => {
          this.table.refresh();
        }).catch(e => {
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
        this.service.post(this.dataToBePosted)
          .then(result => {
            if (result && result.error) {
              alert(result.error);
              return;
            }
            this.table.refresh();
          })
          .catch(e => {
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

  upload() {
    this.router.navigateToRoute('upload');
  }

  create() {
    this.router.navigateToRoute('create');
  }
}
