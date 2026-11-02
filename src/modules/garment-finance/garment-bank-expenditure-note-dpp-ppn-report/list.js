import { inject } from "aurelia-framework";
import moment from "moment";
import numeral from "numeral";
import XLSX from "xlsx";
import { Service } from "./service";

const DPPVATExpenditureDocumentLoader = require("../shared/dpp-vat-expenditure-loader");
const InternalNoteLoader = require("../shared/internal-note-loader");
const InvoiceLoader = require("../shared/invoice-loader");
const SupplierLoader = require("../shared/garment-supplier-loader");
const BankLoader = require("../../../loader/account-banks-loader");

@inject(Service)
export class List {
  paymentMethodList = [
    "",
    "KREDIT",
    "DP(DOWN PAYMENT) + BP(BALANCE PAYMENT)",
    "DP(DOWN PAYMENT) + PERMIN 1 + BP(BALANCE PAYMENT)",
    "RETENSI",
  ];
  isPaidFilter = { IsPaid: true };

  columns = [
    { field: "ExpenditureNoteNo", title: "No Bukti Pengeluaran Bank" },
    {
      field: "ExpenditureDate",
      title: "Tanggal Bayar DPP + PPN",
      formatter: function (value, data, index) {
        return value ? moment(value).format("DD MMM YYYY") : "-";
      },
    },
    { field: "CategoryName", title: "Category" },
    { field: "PaymentMethod", title: "Cara Pembayaran" },
    {
      field: "OtherExpense",
      title: "Biaya Lain-lain",
      formatter: function (value, data, index) {
        return value || value == 0 ? numeral(value).format("0,000.00") : "-";
      },
      align: "right",
    },
    {
      field: "DPP",
      title: "DPP",
      formatter: function (value, data, index) {
        return value ? numeral(value).format("0,000.00") : "-";
      },
      align: "right",
    },
    {
      field: "VAT",
      title: "PPN",
      formatter: function (value, data, index) {
        return value || value == 0 ? numeral(value).format("0,000.00") : "-";
      },
      align: "right",
    },
    {
      field: "InternalNoteAmount",
      title: "Total Bayar Ke Supplier",
      formatter: function (value, data, index) {
        return value ? numeral(value).format("0,000.00") : "-";
      },
      align: "right",
    },
    {
      field: "TotalPaid",
      title: "Total Bayar Keseluruhan",
      formatter: function (value, data, index) {
        let total = (value !== undefined && value !== null)
          ? value
          : (data.Amount || data.InternalNoteAmount || 0) + (data.OtherExpense || 0);
        return numeral(total).format("0,000.00");
      },
      align: "right",
    },
    { field: "CurrencyCode", title: "Mata Uang" },
    { field: "BankName", title: "Bank Bayar PPH" },
    { field: "SupplierName", title: "Supplier" },
    { field: "InternalNoteNo", title: "No. NI" },
    { field: "InvoiceNo", title: "No Invoice" },
    {
      field: "InvoiceAmount",
      title: "Nilai Invoice",
      formatter: function (value, data, index) {
        return value ? numeral(value).format("0,000.00") : numeral(0).format("0,000.00");
      },
      align: "right",
    },
    {
      field: "PaidAmount",
      title: "Nilai Dibayar",
      formatter: function (value, data, index) {
        return value ? numeral(value).format("0,000.00") : numeral(0).format("0,000.00");
      },
      align: "right",
    },
    {
      field: "Difference",
      title: "Selisih",
      formatter: function (value, data, index) {
        return value ? numeral(value).format("0,000.00") : numeral(0).format("0,000.00");
      },
      align: "right",
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
    onPostBody: (data) => {
      this.mergeCells(data);
    }
  };

  constructor(service) {
    this.service = service;
    this.info = {};
    this.error = {};
  }

  loader = (info) => {
    let order = {};
    if (info.sort) order[info.sort] = info.order;

    let arg = {
      page: parseInt(info.offset / info.limit, 10) + 1,
      size: info.limit,
      order: order,
      select: [],
    };

    if (this.info.bank)
      arg.bankId = this.info.bank.Id;
    if (this.info.bankExpenditureNote)
      arg.expenditureId = this.info.bankExpenditureNote.Id;
    if (this.info.unitPaymentOrder)
      arg.internalNoteId = this.info.unitPaymentOrder.Id;
    if (this.info.invoice) arg.invoiceId = this.info.invoice.Id;
    if (this.info.supplier) arg.supplierId = this.info.supplier.Id;
    if (
      (this.info.dateFrom && this.info.dateFrom != "Invalid Date") ||
      (this.info.dateTo && this.info.dateTo != "Invalid Date")
    ) {
      arg.startDate =
        this.info.dateFrom && this.info.dateFrom != "Invalid Date"
          ? this.info.dateFrom
          : "";
      arg.endDate =
        this.info.dateTo && this.info.dateTo != "Invalid Date"
          ? this.info.dateTo
          : "";

      if (!arg.dateFrom) {
        arg.startDate = new Date(arg.startDate);
        arg.startDate.setMonth(arg.startDate.getMonth() - 1);
      }

      if (!arg.endDate) {
        arg.endDate = new Date(arg.startDate);
        arg.endDate.setMonth(arg.endDate.getMonth() + 1);
      }

      arg.startDate = moment(arg.startDate).format("MM/DD/YYYY");
      arg.endDate = moment(arg.endDate).format("MM/DD/YYYY");
    } else {
      arg.startDate = new Date();
      arg.startDate.setMonth(arg.startDate.getMonth() - 1);
      arg.endDate = new Date();

      arg.startDate = moment(arg.startDate).format("MM/DD/YYYY");
      arg.endDate = moment(arg.endDate).format("MM/DD/YYYY");
    }

    return this.flag
      ? this.service.search(arg).then((result) => {
        let data = result.data.Result || result.data || [];

        // Hitung total per No Bukti Pengeluaran Bank
        let docTotals = {};
        for (let item of data) {
          let docNo = item.ExpenditureNoteNo;
          if (!docTotals[docNo]) {
            docTotals[docNo] = {
              otherExpense: item.OtherExpense || 0,
              amount: item.Amount || 0,
              internalNotes: {}
            };
          }
          if (item.InternalNoteNo) {
            docTotals[docNo].internalNotes[item.InternalNoteNo] = item.InternalNoteAmount || 0;
          }
        }

        for (let item of data) {
          let doc = docTotals[item.ExpenditureNoteNo];
          let sumNI = Object.values(doc.internalNotes).reduce((a, b) => a + b, 0);
          // doc.amount (Pembayaran Keluar) sudah termasuk biaya lain-lain
          item.TotalPaid = sumNI > 0 ? sumNI + doc.otherExpense : doc.amount;
        }

        data.sort((a, b) => {
          let cmp = (a.ExpenditureNoteNo || "").localeCompare(b.ExpenditureNoteNo || "");
          if (cmp !== 0) return cmp;
          cmp = (a.InternalNoteNo || "").localeCompare(b.InternalNoteNo || "");
          if (cmp !== 0) return cmp;
          return (a.InvoiceNo || "").localeCompare(b.InvoiceNo || "");
        });
        this.currentData = data;
        setTimeout(() => this.mergeCells(), 100);

        return {
          total: data.length,
          data: data,
        };
      })
      : { total: 0, data: [] };
  };

  mergeCells(data) {
    if (!this.tableList || !this.tableList.table) return;
    let rows = data || this.currentData || [];
    if (!rows || rows.length === 0) return;

    // 1. Group by ExpenditureNoteNo (Document level columns)
    let docGroups = [];
    let currentDocNo = null;
    let currentDocGroup = null;

    for (let i = 0; i < rows.length; i++) {
      let item = rows[i];
      if (!item.ExpenditureNoteNo) continue;
      if (item.ExpenditureNoteNo !== currentDocNo) {
        currentDocNo = item.ExpenditureNoteNo;
        currentDocGroup = {
          index: i,
          rowspan: 1,
          docNo: item.ExpenditureNoteNo
        };
        docGroups.push(currentDocGroup);
      } else {
        currentDocGroup.rowspan++;
      }
    }

    let docMergeColumns = [
      "ExpenditureNoteNo",
      "ExpenditureDate",
      "OtherExpense",
      "TotalPaid",
      "CurrencyCode",
      "BankName",
      "SupplierName"
    ];

    for (let group of docGroups) {
      if (group.rowspan > 1) {
        for (let field of docMergeColumns) {
          $(this.tableList.table).bootstrapTable("mergeCells", {
            index: group.index,
            field: field,
            rowspan: group.rowspan,
            colspan: 1
          });
        }
      }
    }

    // 2. Group by InternalNoteNo within the document (Item level columns)
    let niGroups = [];
    let currentNIKey = null;
    let currentNIGroup = null;

    for (let i = 0; i < rows.length; i++) {
      let item = rows[i];
      let niKey = `${item.ExpenditureNoteNo || ""}__${item.InternalNoteNo || ""}`;
      if (niKey !== currentNIKey) {
        currentNIKey = niKey;
        currentNIGroup = {
          index: i,
          rowspan: 1,
          key: niKey
        };
        niGroups.push(currentNIGroup);
      } else {
        currentNIGroup.rowspan++;
      }
    }

    let niMergeColumns = [
      "InternalNoteNo",
      "DPP",
      "VAT",
      "InternalNoteAmount"
    ];

    for (let group of niGroups) {
      if (group.rowspan > 1) {
        for (let field of niMergeColumns) {
          $(this.tableList.table).bootstrapTable("mergeCells", {
            index: group.index,
            field: field,
            rowspan: group.rowspan,
            colspan: 1
          });
        }
      }
    }
  }

  search() {
    if (this.info.dateFrom == "Invalid Date") this.info.dateFrom = undefined;
    if (this.info.dateTo == "Invalid Date") this.info.dateTo = undefined;

    if (
      (this.info.dateFrom && this.info.dateTo) ||
      (!this.info.dateFrom && !this.info.dateTo)
    ) {
      this.error = {};
      this.flag = true;
      this.tableList.refresh();
    } else {
      // console.log(this.info.dateFrom);
      // console.log(this.info.dateTo);
      if (!this.info.dateFrom) this.error.dateFrom = "Tanggal Awal harus diisi";
      if (!this.info.dateTo) this.error.dateTo = "Tanggal Akhir harus diisi";
    }
  }

  excel() {
    // this.flag = true;

    this.page = 0;
    this.excelData = [];

    if (this.info.dateFrom == "Invalid Date") this.info.dateFrom = undefined;
    if (this.info.dateTo == "Invalid Date") this.info.dateTo = undefined;

    if (
      (this.info.dateFrom && this.info.dateTo) ||
      (!this.info.dateFrom && !this.info.dateTo)
    ) {
      this.error = {};

      let arg = {
        page: 1,
        size: Number.MAX_SAFE_INTEGER,
      };

      if (this.info.bank)
        arg.bankId = this.info.bank.Id;
      if (this.info.bankExpenditureNote)
        arg.expenditureId = this.info.bankExpenditureNote.Id;
      if (this.info.unitPaymentOrder)
        arg.internalNoteId = this.info.unitPaymentOrder.Id;
      if (this.info.invoice) arg.invoiceId = this.info.invoice.Id;
      if (this.info.supplier) arg.supplierId = this.info.supplier.Id;
      if (
        (this.info.dateFrom && this.info.dateFrom != "Invalid Date") ||
        (this.info.dateTo && this.info.dateTo != "Invalid Date")
      ) {
        arg.startDate =
          this.info.dateFrom && this.info.dateFrom != "Invalid Date"
            ? this.info.dateFrom
            : "";
        arg.endDate =
          this.info.dateTo && this.info.dateTo != "Invalid Date"
            ? this.info.dateTo
            : "";

        if (!arg.startDate) {
          arg.startDate = new Date(arg.startDate);
          arg.startDate.setMonth(arg.startDate.getMonth() - 1);
        }

        if (!arg.endDate) {
          arg.endDate = new Date(arg.startDate);
          arg.endDate.setMonth(arg.endDate.getMonth() + 1);
        }

        arg.startDate = moment(arg.startDate).format("MM/DD/YYYY");
        arg.endDate = moment(arg.endDate).format("MM/DD/YYYY");
      } else {
        arg.startDate = new Date();
        arg.startDate.setMonth(arg.startDate.getMonth() - 1);
        arg.endDate = new Date();

        arg.startDate = moment(arg.startDate).format("MM/DD/YYYY");
        arg.endDate = moment(arg.endDate).format("MM/DD/YYYY");
      }

      return this.service.generateXls(arg);
    } else {
      // console.log(this.info.dateFrom);
      // console.log(this.info.dateTo);
      if (!this.info.dateFrom) this.error.dateFrom = "Tanggal Awal harus diisi";
      if (!this.info.dateTo) this.error.dateTo = "Tanggal Akhir harus diisi";
    }
  }

  reset() {
    this.flag = false;
    this.info.bank = undefined;
    this.info.bankExpenditureNote = undefined;
    this.info.unitPaymentOrder = undefined;
    this.info.invoice = undefined;
    this.info.supplier = undefined;
    this.info.division = undefined;
    this.info.dateFrom = undefined;
    this.info.dateTo = undefined;
    this.info.paymentMethod = "";
    this.error.dateFrom = undefined;
    this.error.dateTo = undefined;
    this.currentData = [];
    this.tableList.refresh();
  }

  get bankLoader() {
    return BankLoader;
  }

  get supplierLoader() {
    return SupplierLoader;
  }

  get dppVATExpenditureDocumentLoader() {
    return DPPVATExpenditureDocumentLoader;
  }

  get internalNoteLoader() {
    return InternalNoteLoader;
  }

  get invoiceLoader() {
    return InvoiceLoader;
  }
}
