import { inject } from 'aurelia-framework';
import { Service } from "./service";
import { Router } from 'aurelia-router';
import moment from 'moment';
import { Base64Helper } from '../../../utils/base-64-coded-helper';

@inject(Router, Service)
export class List {
  dataToBePosted = [];

  rowFormatter(data, index) {
    if (data.isPosted)
      return { classes: "success" }
    else
      return {}
  }

  context = ["Rincian", "Cetak PDF"]

  columns = [
    {
      field: "isPosting", title: "Post", checkbox: true, sortable: false,
      formatter: function (value, data, index) {
        this.checkboxEnabled = !data.isPosted;
        return ""
      }
    },
    {
      field: "date", title: "Tgl. PR", formatter: function (value, data, index) {
        return moment(value).format("DD MMM YYYY");
      }
    },
    {
      field: "prCreatedDate", title: "Tanggal Status", sortable: false,
      formatter: function (value, data, index) {
        if (data.items && data.items.length > 0) {
          var dates = data.items.map(function (item) {
            var d = item.statusDate || value;
            return `<li>${d ? moment(d).format("DD MMM YYYY") : "-"}</li>`;
          });
          return `<ul>${dates.join("")}</ul>`;
        }
        return value ? `<ul><li>${moment(value).format("DD MMM YYYY")}</li></ul>` : "-";
      }
    },
    { field: "no", title: "No. PR" },
    { field: "DivisionName", title: "Divisi" },
    { field: "UnitName", title: "Unit" },
    { field: "CategoryName", title: "Kategori" },
    // { field: "NPWP", title: "NPWP" },
    {
      field: "isPosted", title: "Posted",
      formatter: function (value, row, index) {
        return value ? "SUDAH" : "BELUM";
      }
    },
    {
      field: "purchaseOrderStaff", title: "Staff Pembelian",
      formatter: function (value, data, index) {
        return value ? value : "-";
      }
    },
    {
      field: "items", title: "Barang", sortable: false,
      formatter: function (value, data, index) {
        if (data.items && data.items.length > 0) {
          var products = data.items.map(function (item) {
            var name = item.product && item.product.name ? item.product.name : (item.productName || "-");
            return `<li>${name}</li>`;
          });
          return `<ul>${products.join("")}</ul>`;
        }
        return "-";
      }
    },
    {
      field: "status", title: "Status", sortable: false,
      formatter: function (value, data, index) {
        if (data.items && data.items.length > 0) {
          var statuses = data.items.map(function (item) {
            return `<li>${item.status || value || "-"}</li>`;
          });
          return `<ul>${statuses.join("")}</ul>`;
        }
        return value && value !== "-" ? `<ul><li>${value}</li></ul>` : "-";
      }
    }
  ];

  loader = (info) => {
    var order = {};
    if (info.sort)
      order[info.sort] = info.order;
    // console.log(info)
    var arg = {
      page: parseInt(info.offset / info.limit, 10) + 1,
      size: info.limit,
      keyword: info.search,
      select: [
        "date",
        "no",
        "unit.division.name",
        "unit.name",
        "category.name",
        "isPosted",
        "purchaseOrderStaff",
        "items.product.name",
        "status",
        "prCreatedDate"
      ],
      order: order
    }

    return this.service.search(arg)
      .then(result => {
        for (var data of result.data) {
            data.Id = data.Id || data._id || 0;
            data.DivisionName = data.unit ? (data.unit.division ? data.unit.division.name : "-") : "-";
            data.UnitName = data.unit ? data.unit.name : "-";
            data.CategoryName = data.category ? data.category.name : "-";
            data.purchaseOrderStaff = data.purchaseOrderStaff || "-";
            data.status = data.status || "-";
            data.prCreatedDate = data.prCreatedDate || null;
            data.items = data.items || [];
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
  }

  contextClickCallback(event) {
    var arg = event.detail;
    var data = arg.data;
    switch (arg.name) {
      case "Rincian":
        const encoded = Base64Helper.encode(data._id);
        this.router.navigateToRoute('view', { id: encoded });
        //this.router.navigateToRoute('view', { id: data.Id });
        break;
      case "Cetak PDF":
        this.service.getPdfById(data._id);
        break;
    }
  }

  contextShowCallback(index, name, data) {
    switch (name) {
      case "Cetak PDF":
        return data.isPosted;
      default:
        return true;
    }
  }

  posting() {
    if (this.dataToBePosted.length > 0) {
      this.service.post(this.dataToBePosted).then(result => {
        this.table.refresh();
      }).catch(e => {
        this.error = e;
      })
    }
  }

  create() {
    this.router.navigateToRoute('create');
  }
}
