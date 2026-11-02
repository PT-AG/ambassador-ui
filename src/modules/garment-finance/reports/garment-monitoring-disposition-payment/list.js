import { inject, bindable } from "aurelia-framework";
import moment from "moment";
import numeral from "numeral";
import XLSX from "xlsx";
import { Service } from "./service";
const InvoiceLoader = require("../../shared/garment-invoice-purchasing-disposition");
const DispositionLoader = require("../../shared/disposition-purchasing-loader");
const BankLoader = require("../../../../loader/account-banks-loader");

@inject(Service)
export class List {
	@bindable selectedBank;
	@bindable selectedDispo;
	@bindable selectedInvo;

	columns = [
		{ field: "InvoiceNo", title: "No Bukti Pembayaran Disposisi" },
		{
			field: "InvoiceDate",
			formatter: function (value, data, index) {
				return value ? moment(value).format("DD MMM YYYY") : "";
			},
			title: "Tanggal Bayar Disposisi"
		},
		{ field: "DispositionNo", title: "No Disposisi" },
		{
			field: "DispositionDate",
			formatter: function (value, data, index) {
				return value ? moment(value).format("DD MMM YYYY") : "";
			},
			title: "Tanggal Disposisi"
		},
		{
			field: "DispositionDueDate",
			formatter: function (value, data, index) {
				return value ? moment(value).format("DD MMM YYYY") : "";
			},
			title: "Tanggal Jatuh Tempo"
		},
		{ field: "BankName", title: "Bank Bayar" },
		{ field: "CurrencySymbol", title: "Mata Uang" },
		{ field: "SupplierName", title: "Supplier" },
		{ field: "ProformaNo", title: "Nomor Proforma Invoice" },
		{ field: "Category", title: "Kategori" },
		{
			field: "VatAmount",
			title: "PPN",
			align: "right",
			formatter: (value, data) => {
				return numeral(value).format("0,0.00");
			}
		},
		{
			field: "OtherExpense",
			title: "Biaya Lain-lain",
			align: "right",
			formatter: (value, data) => {
				return numeral(value).format("0,0.00");
			}
		},
		{
			field: "TotalAmount",
			title: "Total Pembayaran",
			align: "right",
			formatter: (value, data) => {
				return numeral(value).format("0,0.00");
			}
		},
		{
			field: "TotalPaidToSupplier",
			title: "Jumlah dibayar ke Supplier",
			align: "right",
			formatter: (value, data) => {
				return numeral(value).format("0,0.00");
			}
		},
		{
			field: "TotalPaidOverall",
			title: "Total Bayar Keseluruhan",
			align: "right",
			formatter: (value, data) => {
				let total = (value !== undefined && value !== null)
					? value
					: (data.TotalPaidToSupplier || 0) + (data.OtherExpense || 0);
				return numeral(total).format("0,0.00");
			}
		},
		{
			field: "TotalDifference",
			title: "Selisih Total yang dibayar",
			align: "right",
			formatter: (value, data) => {
				return numeral(value).format("0,0.00");
			}
		},
		{
			field: "TotalPaid",
			title: "Total yang sudah dibayar",
			align: "right",
			formatter: (value, data) => {
				return numeral(value).format("0,0.00");
			}
		},
		{ field: "PaymentType", title: "Jenis Transaksi" }
	];

	itemYears = [];
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
		this.data = [];
		this.isEmpty = true;
		this.currency = "";
		this.purchase = 0;
		this.payment = 0;
		this.closingBalance = 0;
	}

	async bind() {}

	get bankLoader() {
		return BankLoader;
	}
	bankView = (bank) => {
		return bank.AccountName ? `${bank.AccountName} - ${bank.BankName} - ${bank.AccountNumber} - ${bank.Currency ? bank.Currency.Code : ''}` : '';
	}

	get dispositionLoader() {
		return DispositionLoader;
	}
	dispositionView = (disposition) => {
		return `${disposition.DispositionNo}`;
	}

	get invoiceLoader() {
		return InvoiceLoader;
	}
	invoiceView = (invoice) => {
		return `${invoice.InvoiceNo}`;
	}

	selectedBankChanged(newValue) {
		if (newValue) {
			this.bank = newValue;
		} else {
			this.bank = null;
		}
	}

	selectedDispoChanged(newValue) {
		if (newValue) {
			this.dispositionNo = newValue;
		} else {
			this.dispositionNo = null;
		}
	}

	selectedInvoChanged(newValue) {
		if (newValue) {
			this.invoiceNo = newValue;
		} else {
			this.invoiceNo = null;
		}
	}

	loader = (info) => {
		let startDate = this.startDate && this.startDate != "Invalid Date" ? moment(this.startDate).format("YYYY-MM-DD") : null;
		let endDate = this.endDate && this.endDate != "Invalid Date" ? moment(this.endDate).format("YYYY-MM-DD") : null;
		let invoiceNo = this.invoiceNo ? this.invoiceNo.InvoiceNo : null;
		let dispositionNo = this.dispositionNo ? this.dispositionNo.DispositionNo : null;
		let bankId = this.bank ? this.bank.Id : 0;

		let params = {
			invoiceNo,
			dispositionNo,
			startDate,
			endDate,
			bankId
		};

		return this.flag
			? this.service.search(params).then((result) => {
				let data = result.data.Result || result.data || [];
				data.sort((a, b) => (a.InvoiceNo || "").localeCompare(b.InvoiceNo || ""));

				let docTotals = {};
				for (let item of data) {
					let docNo = item.InvoiceNo;
					if (!docTotals[docNo]) {
						docTotals[docNo] = {
							otherExpense: item.OtherExpense || 0,
							totalPaidToSupplier: 0
						};
					}
					docTotals[docNo].totalPaidToSupplier += (item.TotalPaidToSupplier || 0);
				}

				for (let item of data) {
					let doc = docTotals[item.InvoiceNo];
					item.TotalPaidOverall = doc ? (doc.totalPaidToSupplier + doc.otherExpense) : ((item.TotalPaidToSupplier || 0) + (item.OtherExpense || 0));
				}

				this.currentData = data;
				setTimeout(() => this.mergeCells(), 100);
				return {
					total: 0,
					data: data
				};
			})
			: { total: 0, data: [] };
	};

	mergeCells(data) {
		if (!this.tableList || !this.tableList.table) return;
		let rows = data || this.currentData || [];
		if (!rows || rows.length === 0) return;

		let invoiceGroups = [];
		let currentInvoice = null;
		let currentGroup = null;

		for (let i = 0; i < rows.length; i++) {
			let item = rows[i];
			if (!item.InvoiceNo) continue;
			if (item.InvoiceNo !== currentInvoice) {
				currentInvoice = item.InvoiceNo;
				currentGroup = {
					index: i,
					rowspan: 1,
					invoiceNo: item.InvoiceNo
				};
				invoiceGroups.push(currentGroup);
			} else {
				currentGroup.rowspan++;
			}
		}

		let mergeColumns = [
			"InvoiceNo",
			"InvoiceDate",
			"BankName",
			"CurrencySymbol",
			"SupplierName",
			"OtherExpense",
			"TotalPaidOverall",
			"PaymentType"
		];

		for (let group of invoiceGroups) {
			if (group.rowspan > 1) {
				for (let field of mergeColumns) {
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
		this.error = {};
		this.flag = true;
		this.tableList.refresh();
	}

	excel() {
		let startDate = this.startDate && this.startDate != "Invalid Date" ? moment(this.startDate).format("YYYY-MM-DD") : null;
		let endDate = this.endDate && this.endDate != "Invalid Date" ? moment(this.endDate).format("YYYY-MM-DD") : null;
		let invoiceNo = this.invoiceNo ? this.invoiceNo.InvoiceNo : "";
		let dispositionNo = this.dispositionNo ? this.dispositionNo.DispositionNo : "";
		let bankId = this.bank ? this.bank.Id : 0;

		let params = {
			invoiceNo,
			dispositionNo,
			startDate,
			endDate,
			bankId
		};

		this.service.getXls(params);
	}

	reset() {
		this.flag = false;
		this.selectedBank = null;
		this.bank = null;
		this.selectedDispo = null;
		this.selectedInvo = null;
		this.dispositionNo = null;
		this.invoiceNo = null;
		this.startDate = null;
		this.endDate = null;
		this.data = [];
		this.currentData = [];
		this.tableList.refresh();
	}
}
