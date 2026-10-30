import { inject } from "aurelia-framework";
import moment from "moment";
import numeral from "numeral";
import { Service } from "./service";

const VBBankExpenditureLoader = require("../loaders/vb-bank-expenditure-loader");
const AccountBankLoader = require("../../../loader/account-banks-loader");
const DivisionLoader = require("../../../loader/division-loader");
const VBRealizationLoader = require("../loaders/vb-realization-all-loader");
const VBRequestLoader = require("../loaders/vb-request-loader");
const AccountLoader = require("../loaders/account-loader");
const UnitLoader = require("../loaders/unit-loader");

@inject(Service)
export class List {
  columns = [
    { field: "DocumentNo", title: "No. Bukti Pengeluaran Bank" },
    {
      field: "Date",
      title: "Tanggal Pengeluaran Bank",
      formatter: function (value, data, index) {
        return value ? moment.utc(value).local().format("DD MMM YYYY") : "-";
      },
    },
    {
      field: "BankName",
      title: "Nama Bank",
      formatter: function (value, data, index) {
        if (data.BankName && data.BankAccountNumber) {
          return `${data.BankName} - ${data.BankAccountNumber}`;
        }
        return value || "-";
      },
    },
    {
      field: "BGCheckNo",
      title: "No. BG/Cek",
      formatter: function (value, data, index) {
        return value || "-";
      },
    },
    { field: "VBRealizationNo", title: "No. Realisasi VB" },
    {
      field: "VBRealizationDate",
      title: "Tanggal Realisasi VB",
      formatter: function (value, data, index) {
        return value ? moment.utc(value).local().format("DD MMM YYYY") : "-";
      },
    },
    {
      field: "VBNo",
      title: "No. VB",
      formatter: function (value, data, index) {
        return value || "-";
      },
    },
    {
      field: "VBType",
      title: "Tipe VB",
      formatter: function (value, data, index) {
        return value == 1 ? "Dengan PO" : "Tanpa PO";
      },
    },
    { field: "VBRequestName", title: "Pemohon VB" },
    { field: "UnitName", title: "Bagian/Unit" },
    { field: "DivisionName", title: "Divisi" },
    { field: "CurrencyCode", title: "Mata Uang" },
    {
      field: "VBAmount",
      title: "Nominal VB",
      formatter: function (value, data, index) {
        return numeral(value || 0).format("0,000.00");
      },
      align: "right",
    },
    {
      field: "VBRealizationAmount",
      title: "Nominal Realisasi VB",
      formatter: function (value, data, index) {
        return numeral(value || 0).format("0,000.00");
      },
      align: "right",
    },
    {
      field: "OtherExpense",
      title: "Biaya Lain-lain",
      formatter: function (value, data, index) {
        return numeral(value || 0).format("0,000.00");
      },
      align: "right",
    },
    {
      field: "TotalAmount",
      title: "Total Bayar",
      formatter: function (value, data, index) {
        return numeral(value || 0).format("0,000.00");
      },
      align: "right",
    },
    {
      field: "Remark",
      title: "Keterangan",
      formatter: function (value, data, index) {
        return value || "-";
      },
    },
  ];

  controlOptions = {
    label: {
      length: 4,
    },
    control: {
      length: 4,
    },
  };

  tableOptions = {
    showColumns: false,
    search: false,
    showToggle: false,
    sortable: false,
    pagination: true,
  };

  constructor(service) {
    this.service = service;
    this.info = {};
    this.error = {};
    this.data = [];
  }

  bankView = (bank) => {
    return bank.AccountName
      ? `${bank.AccountName} - ${bank.BankName} - ${bank.AccountNumber} - ${bank.Currency.Code}`
      : `${bank.BankName} - ${bank.AccountNumber}`;
  };

  loader = (info) => {
    let order = {};
    if (info.sort) order[info.sort] = info.order;

    let arg = {
      page: parseInt(info.offset / info.limit, 10) + 1,
      size: info.limit,
      order: order,
    };

    if (this.info.vbBankExpenditure) {
      if (typeof this.info.vbBankExpenditure === "object") {
        if (this.info.vbBankExpenditure.Id)
          arg.vbBankExpenditureId = this.info.vbBankExpenditure.Id;
        if (this.info.vbBankExpenditure.DocumentNo)
          arg.vbBankExpenditureNo = this.info.vbBankExpenditure.DocumentNo;
      } else {
        arg.vbBankExpenditureNo = this.info.vbBankExpenditure;
      }
    }

    if (this.info.bank && this.info.bank.Id)
      arg.bankAccountId = this.info.bank.Id;

    if (this.info.vbRealization) {
      if (typeof this.info.vbRealization === "object") {
        if (this.info.vbRealization.Id)
          arg.vbRealizationId = this.info.vbRealization.Id;
        if (this.info.vbRealization.DocumentNo)
          arg.vbRealizationNo = this.info.vbRealization.DocumentNo;
      } else {
        arg.vbRealizationNo = this.info.vbRealization;
      }
    }

    if (this.info.vbRequest) {
      if (typeof this.info.vbRequest === "object") {
        if (this.info.vbRequest.Id)
          arg.vbId = this.info.vbRequest.Id;
        if (this.info.vbRequest.DocumentNo)
          arg.vbNo = this.info.vbRequest.DocumentNo;
      } else {
        arg.vbNo = this.info.vbRequest;
      }
    }

    if (this.info.account) {
      if (typeof this.info.account === "object") {
        if (this.info.account.username)
          arg.vbRequestName = this.info.account.username;
      } else {
        arg.vbRequestName = this.info.account;
      }
    }

    if (this.info.unit && this.info.unit.Id) arg.unitId = this.info.unit.Id;

    if (this.info.division && this.info.division.Id)
      arg.divisionId = this.info.division.Id;

    if (this.info.dateFrom)
      arg.dateStart = moment(this.info.dateFrom).format("YYYY-MM-DD");

    if (this.info.dateTo)
      arg.dateEnd = moment(this.info.dateTo).format("YYYY-MM-DD");

    return this.flag
      ? this.service.search(arg).then((result) => {
          return {
            total: result.info.total,
            data: result.data,
          };
        })
      : { total: 0, data: [] };
  };

  search() {
    this.error = {};
    this.flag = true;
    this.tableList.refresh();
  }

  excel() {
    let vbBankExpenditureId = undefined;
    let vbBankExpenditureNo = undefined;
    if (this.info.vbBankExpenditure) {
      if (typeof this.info.vbBankExpenditure === "object") {
        vbBankExpenditureId = this.info.vbBankExpenditure.Id;
        vbBankExpenditureNo = this.info.vbBankExpenditure.DocumentNo;
      } else {
        vbBankExpenditureNo = this.info.vbBankExpenditure;
      }
    }

    let vbRealizationId = undefined;
    let vbRealizationNo = undefined;
    if (this.info.vbRealization) {
      if (typeof this.info.vbRealization === "object") {
        vbRealizationId = this.info.vbRealization.Id;
        vbRealizationNo = this.info.vbRealization.DocumentNo;
      } else {
        vbRealizationNo = this.info.vbRealization;
      }
    }

    let vbId = undefined;
    let vbNo = undefined;
    if (this.info.vbRequest) {
      if (typeof this.info.vbRequest === "object") {
        vbId = this.info.vbRequest.Id;
        vbNo = this.info.vbRequest.DocumentNo;
      } else {
        vbNo = this.info.vbRequest;
      }
    }

    let vbRequestName = undefined;
    if (this.info.account) {
      if (typeof this.info.account === "object") {
        vbRequestName = this.info.account.username;
      } else {
        vbRequestName = this.info.account;
      }
    }

    let params = {
      vbBankExpenditureId: vbBankExpenditureId,
      vbBankExpenditureNo: vbBankExpenditureNo,
      bankAccountId: this.info.bank && this.info.bank.Id,
      vbRealizationId: vbRealizationId,
      vbRealizationNo: vbRealizationNo,
      vbId: vbId,
      vbNo: vbNo,
      vbRequestName: vbRequestName,
      unitId: this.info.unit && this.info.unit.Id,
      divisionId: this.info.division && this.info.division.Id,
      dateStart:
        (this.info.dateFrom &&
          moment(this.info.dateFrom).format("YYYY-MM-DD")) ||
        undefined,
      dateEnd:
        (this.info.dateTo && moment(this.info.dateTo).format("YYYY-MM-DD")) ||
        undefined,
    };

    this.service.getXls(params);
  }

  reset() {
    this.flag = false;
    this.error = {};
    this.info.vbBankExpenditure = undefined;
    this.info.bank = undefined;
    this.info.vbRealization = undefined;
    this.info.vbRequest = undefined;
    this.info.account = undefined;
    this.info.unit = undefined;
    this.info.division = undefined;
    this.info.dateFrom = undefined;
    this.info.dateTo = undefined;
    this.tableList.refresh();
  }

  get vbBankExpenditureLoader() {
    return VBBankExpenditureLoader;
  }

  get bankLoader() {
    return AccountBankLoader;
  }

  get divisionLoader() {
    return DivisionLoader;
  }

  get vbRequestLoader() {
    return VBRequestLoader;
  }

  get vbRealizationLoader() {
    return VBRealizationLoader;
  }

  get accountLoader() {
    return AccountLoader;
  }

  get unitLoader() {
    return UnitLoader;
  }
}

