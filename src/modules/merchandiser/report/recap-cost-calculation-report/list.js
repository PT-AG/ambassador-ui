import { inject, bindable } from "aurelia-framework";
import { Service } from "./service";
import { Router } from "aurelia-router";
var moment = require("moment");

@inject(Router, Service)
export class List {
  constructor(router, service) {
    this.service = service;
    this.router = router;
    this.today = new Date();
  }

  info = { page: 1, size: 50 };

  controlOptions = {
    label: {
      length: 4,
    },
    control: {
      length: 4,
    },
  };

  search() {
    this.info.page = 1;
    this.info.total = 0;
    this.searching();
  }
  activate() {}
  tableData = [];
  searching() {
    var args = {
      page: this.info.page,
      size: this.info.size,
      dateFrom: this.dateFrom ? moment(this.dateFrom).format("YYYY-MM-DD") : "",
      dateTo: this.dateTo ? moment(this.dateTo).format("YYYY-MM-DD") : "",
    };
    this.service.search(args).then((result) => {
      this.data = [];

      for (var _data of result.data) {
        _data.OL = _data.OL.toLocaleString(
          "en-EN",
          { minimumFractionDigits: 2, maximumFractionDigits: 2 }
        );
        _data.THR = _data.THR.toLocaleString("en-EN", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
        _data.OTL1 = _data.OTL1.toLocaleString(
          "en-EN",
          { minimumFractionDigits: 2, maximumFractionDigits: 2 }
        );
        _data.OTL2 = _data.OTL2.toLocaleString("en-EN", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
        _data.OTL3 = _data.OTL3.toLocaleString(
          "en-EN",
          { minimumFractionDigits: 2, maximumFractionDigits: 2 }
        );
        _data.HPP = _data.HPP.toLocaleString(
          "en-EN",
          { minimumFractionDigits: 2, maximumFractionDigits: 2 }
        );
        _data.ConfirmPrice = _data.ConfirmPrice.toLocaleString(
          "en-EN",
          { minimumFractionDigits: 2, maximumFractionDigits: 2 }
        );
        _data.Total_Process = _data.Total_Process.toLocaleString(
          "en-EN",
          { minimumFractionDigits: 2, maximumFractionDigits: 2 }
        );
        _data.MAT = _data.MAT.toLocaleString(
          "en-EN",
          { minimumFractionDigits: 2, maximumFractionDigits: 2 }
        );
        _data.FC = _data.FC.toLocaleString(
          "en-EN",
          { minimumFractionDigits: 2, maximumFractionDigits: 2 }
        );
        _data.FCFab = _data.FCFab.toLocaleString(
          "en-EN",
          { minimumFractionDigits: 2, maximumFractionDigits: 2 }
        );
        _data.EFF = _data.EFF.toLocaleString(
          "en-EN",
          { minimumFractionDigits: 2, maximumFractionDigits: 2 }
        );
        _data.SMV_Cutting = _data.SMV_Cutting.toLocaleString(
          "en-EN",
          { minimumFractionDigits: 2, maximumFractionDigits: 2 }
        );
        _data.SMV_Sewing = _data.SMV_Sewing.toLocaleString(
          "en-EN",
          { minimumFractionDigits: 2, maximumFractionDigits: 2 }
        );
        _data.SMV_Finishing = _data.SMV_Finishing.toLocaleString(
          "en-EN",
          { minimumFractionDigits: 2, maximumFractionDigits: 2 }
        );
        _data.Total_SMV = _data.Total_SMV.toLocaleString(
          "en-EN",
          { minimumFractionDigits: 2, maximumFractionDigits: 2 }
        );
        _data.Quantity = _data.Quantity.toLocaleString(
          "en-EN",
          { minimumFractionDigits: 2, maximumFractionDigits: 2 }
        );

        this.data.push(_data);
      }

      this.info.total = result.info.total;
    });
  }

  reset() {
    (this.dateFrom = ""), (this.dateTo = "");
  }

  ExportToExcel() {
    let args = {
      dateFrom: this.dateFrom ? moment(this.dateFrom).format("YYYY-MM-DD") : "",
      dateTo: this.dateTo ? moment(this.dateTo).format("YYYY-MM-DD") : "",
    };

    this.service.generateExcel(args);
  }

  dateFromChanged(e) {
    var _startDate = new Date(e.srcElement.value);
    var _endDate = new Date(this.dateTo);
    this.dateMin = moment(_startDate).format("YYYY-MM-DD");

    if (_startDate > _endDate || !this.dateTo) {
      this.dateTo = e.srcElement.value;
    }
  }

  changePage(e) {
    var page = e.detail;
    this.info.page = page;
    this.searching();
  }
}
