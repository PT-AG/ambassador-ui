import { inject } from 'aurelia-framework';
import { Service } from "./service";
import { Router, activationStrategy } from 'aurelia-router';
import moment from 'moment';
import { Base64Helper } from '../../../utils/base-64-coded-helper';

@inject(Router, Service)
export class List {
  dataToBePosted = [];
  byUser = true;
  pageTitle = "Purchase Request";

  rowFormatter(data, index) {
    if (data.isRejected)
      return { classes: "danger" };
    if (data.isPosted && data.isApprovedStaff && data.isApprovedManager1 && data.isApprovedManager2)
      return { classes: "success" };
    if (data.isPosted)
      return { classes: "danger" };
    return {};
  }

  context = ["Rincian", "Cetak PDF"]

  buildColumns(byUser) {
    const cols = [];
    if (byUser) {
      cols.push({
        field: "isPosting", title: "Post", checkbox: true, sortable: false,
        formatter: function (value, data, index) {
          this.checkboxEnabled = !data.isPosted;
          return "";
        }
      });
    }

    cols.push(
      {
        field: "date", title: "Tgl. PR", formatter: function (value) {
          return value ? moment(value).format("DD MMM YYYY") : "-";
        }
      },
      {
        field: "CreatedUtc", title: "Tgl. Buat", formatter: function (value) {
          return value ? moment(value).format("DD MMM YYYY") : "-";
        }
      }
    );

    if (byUser) {
      cols.push({
        field: "prCreatedDate", title: "Tanggal Status", sortable: false,
        formatter: function (value, data) {
          if (data.items && data.items.length > 0) {
            var dates = data.items.map(function (item) {
              var d = item.statusDate || value;
              return `<li>${d ? moment(d).format("DD MMM YYYY") : "-"}</li>`;
            });
            return `<ul>${dates.join("")}</ul>`;
          }
          return value ? `<ul><li>${moment(value).format("DD MMM YYYY")}</li></ul>` : "-";
        }
      });
    }

    cols.push(
      { field: "no", title: "No. PR" },
      { field: "DivisionName", title: "Divisi" },
      { field: "UnitName", title: "Unit" },
      { field: "CategoryName", title: "Kategori" },
      {
        field: "isPosted", title: "Posted",
        formatter: function (value, row) {
          if (row.isRejected) return "DITOLAK";
          return value ? "SUDAH" : "BELUM";
        }
      },
      { field: "IsApprovedStaffLabel", title: "Approval Staff" },
      { field: "IsApprovedManager1Label", title: "Approval Manager 1" },
      { field: "IsApprovedManager2Label", title: "Approval Manager 2" }
    );

    if (byUser) {
      cols.push(
        {
          field: "purchaseOrderStaff", title: "Staff Pembelian",
          formatter: function (value) {
            return value ? value : "-";
          }
        },
        {
          field: "items", title: "Barang", sortable: false,
          formatter: function (value, data) {
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
          formatter: function (value, data) {
            if (data.isRejected && data.reasonRejected) {
              return `<ul><li>DITOLAK: ${data.reasonRejected}</li></ul>`;
            }
            if (data.items && data.items.length > 0) {
              var statuses = data.items.map(function (item) {
                return `<li>${item.status || value || "-"}</li>`;
              });
              return `<ul>${statuses.join("")}</ul>`;
            }
            return value && value !== "-" ? `<ul><li>${value}</li></ul>` : "-";
          }
        }
      );
    }

    return cols;
  }

  columns = this.buildColumns(true);

  determineActivationStrategy() {
    return activationStrategy.replace;
  }

  activate(params, routeConfig, navigationInstruction) {
    const instruction = navigationInstruction && navigationInstruction.getAllInstructions()[0];
    const parentInstruction = instruction && instruction.parentInstruction;
    const settings = (parentInstruction && parentInstruction.config && parentInstruction.config.settings) || {};
    this.byUser = settings.byUser !== false;
    this.pageTitle = this.byUser ? "Purchase Request" : "Purchase Request (All User)";
    this.columns = this.buildColumns(this.byUser);
  }

  loader = (info) => {
    var order = {};
    if (info.sort)
      order[info.sort] = info.order;
    var arg = {
      page: parseInt(info.offset / info.limit, 10) + 1,
      size: info.limit,
      keyword: info.search,
      select: [
        "date",
        "CreatedUtc",
        "CreatedBy",
        "no",
        "unit.division.name",
        "unit.name",
        "category.name",
        "isPosted",
        "isApprovedStaff",
        "isApprovedManager1",
        "isApprovedManager2",
        "isRejected",
        "reasonRejected",
        "purchaseOrderStaff",
        "items.product.name",
        "status",
        "prCreatedDate"
      ],
      order: order
    }

    return this.service.search(arg, this.byUser)
      .then(result => {
        for (var data of result.data) {
            data.Id = data.Id || data._id || 0;
            data.DivisionName = data.unit ? (data.unit.division ? data.unit.division.name : "-") : "-";
            data.UnitName = data.unit ? data.unit.name : "-";
            data.CategoryName = data.category ? data.category.name : "-";
            data.IsApprovedStaffLabel = data.isApprovedStaff ? "SUDAH" : "BELUM";
            data.IsApprovedManager1Label = data.isApprovedManager1 ? "SUDAH" : "BELUM";
            data.IsApprovedManager2Label = data.isApprovedManager2 ? "SUDAH" : "BELUM";
            data.CreatedBy = data.CreatedBy || "-";
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
        break;
      case "Cetak PDF":
        this.service.getPdfById(data._id, this.byUser);
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
