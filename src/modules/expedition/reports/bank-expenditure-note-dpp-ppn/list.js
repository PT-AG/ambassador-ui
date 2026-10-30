import { inject } from 'aurelia-framework';
import moment from 'moment';
import numeral from 'numeral';
import XLSX from 'xlsx';
import { Service } from './service';
const SupplierLoader = require('../../../../loader/supplier-loader');
const DivisionLoader = require('../../../../loader/division-loader');
const PurchasingDocumentExpeditionLoader = require('../../../../loader/bank-expenditure-note-dpp-ppn-loader');
const BankExpenditureNoteDPPAndPPNLoader = require('../../../../loader/bank-expenditure-note-loader');
const BankLoader = require('../../../../loader/account-banks-loader');

@inject(Service)
export class List {
    paymentMethodList = ["", "KREDIT", "DP(DOWN PAYMENT) + BP(BALANCE PAYMENT)", "DP(DOWN PAYMENT) + PERMIN 1 + BP(BALANCE PAYMENT)", "RETENSI"];
    isPaidFilter = { IsPaid: true };

    columns = [
        { field: 'DocumentNo', title: 'No Bukti Pengeluaran Bank' },
        {
            field: 'Date',
            title: 'Tanggal Bayar DPP + PPN',
            formatter: function (value, data, index) {
                return value ? moment(value).format('DD MMM YYYY') : "-";
            },
        },
        { field: 'CategoryName', title: 'Category' },
        { field: 'DivisionName', title: 'Divisi' },
        { field: 'PaymentMethod', title: 'Cara Pembayaran' },
        {
            field: 'OtherExpense',
            title: 'Biaya Lain-lain',
            formatter: function (value, data, index) {
                return value || value == 0 ? numeral(value).format("0,000.00") : "-";
            },
            align: 'right'
        },
        {
            field: 'TotalDPP', title: 'Total DPP', formatter: function (value, data, index) {
                return value || value == 0 ? numeral(value).format("0,000.00") : "-";
            },
            align: 'right'
        },
        {
            field: 'TotalPPN', title: 'Total PPN', formatter: function (value, data, index) {
                return value || value == 0 ? numeral(value).format("0,000.00") : "-";
            },
            align: 'right'
        },
        {
            field: 'TotalPaid',
            title: 'Total Bayar Ke Supplier',
            formatter: function (value, data, index) {
                return value || value == 0 ? numeral(value).format("0,000.00") : "-";
            },
            align: 'right'
        },
        {
            field: 'DifferenceNominal', title: 'Sisa yang Belum Dibayar', formatter: function (value, data, index) {
                return value || value == 0 ? numeral(value).format("0,000.00") : "-";
            },
            align: 'right'
        },
        { field: 'Currency', title: 'Mata Uang' },
        { field: 'BankName', title: 'Bank Bayar PPH' },
        { field: 'SupplierName', title: 'Supplier' },
        { field: 'UnitPaymentOrderNo', title: 'No SPB' },
        {
            field: 'DPP',
            title: 'DPP',
            formatter: function (value, data, index) {
                return value || value == 0 ? numeral(value).format("0,000.00") : "-";
            },
            align: 'right'
        },
        {
            field: 'VAT',
            title: 'PPN',
            formatter: function (value, data, index) {
                return value || value == 0 ? numeral(value).format("0,000.00") : "-";
            },
            align: 'right'
        },
        { field: 'InvoiceNumber', title: 'No Invoice' }
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

        this.data = [];
        this.currentData = [];
        this.isEmpty = true;
    }

    loader = (info) => {
        let order = {};
        if (info.sort)
            order[info.sort] = info.order;

        let arg = {
            page: parseInt(info.offset / info.limit, 10) + 1,
            size: info.limit,
            order: order,
            select: [],
        };

        if (this.info.bank)
            arg.bankId = this.info.bank.Id;
        if (this.info.bankExpenditureNote)
            arg.documentNo = this.info.bankExpenditureNote.DocumentNo;
        if (this.info.unitPaymentOrder)
            arg.unitPaymentOrderNo = this.info.unitPaymentOrder.UnitPaymentOrderNo;
        if (this.info.invoice)
            arg.invoiceNo = this.info.invoice.InvoiceNo;
        if (this.info.supplier)
            arg.supplierCode = this.info.supplier.code;
        if (this.info.division)
            arg.divisionCode = this.info.division.code;
        if (this.info.paymentMethod)
            arg.paymentMethod = this.info.paymentMethod;
        if ((this.info.dateFrom && this.info.dateFrom != 'Invalid Date') || (this.info.dateTo && this.info.dateTo != 'Invalid Date')) {
            arg.dateFrom = this.info.dateFrom && this.info.dateFrom != 'Invalid Date' ? this.info.dateFrom : '';
            arg.dateTo = this.info.dateTo && this.info.dateTo != 'Invalid Date' ? this.info.dateTo : '';

            if (!arg.dateFrom) {
                arg.dateFrom = new Date(arg.dateTo);
                arg.dateFrom.setMonth(arg.dateFrom.getMonth() - 1);
            }

            if (!arg.dateTo) {
                arg.dateTo = new Date(arg.dateFrom);
                arg.dateTo.setMonth(arg.dateTo.getMonth() + 1);
            }

            arg.dateFrom = moment(arg.dateFrom).format();
            arg.dateTo = moment(arg.dateTo).format();
        } else {
            arg.dateFrom = new Date();
            arg.dateFrom.setMonth(arg.dateFrom.getMonth() - 1);
            arg.dateTo = new Date();

            arg.dateFrom = moment(arg.dateFrom).format();
            arg.dateTo = moment(arg.dateTo).format();
        }

        return this.flag ? (
            this.service.search(arg)
                .then((result) => {
                    let data = result.data || [];

                    // Sort data by DocumentNo, UnitPaymentOrderNo, InvoiceNumber
                    data.sort((a, b) => {
                        let cmp = (a.DocumentNo || "").localeCompare(b.DocumentNo || "");
                        if (cmp !== 0) return cmp;
                        cmp = (a.UnitPaymentOrderNo || "").localeCompare(b.UnitPaymentOrderNo || "");
                        if (cmp !== 0) return cmp;
                        return (a.InvoiceNumber || "").localeCompare(b.InvoiceNumber || "");
                    });

                    // Aggregate document totals
                    let docMap = new Map();
                    for (let item of data) {
                        let docNo = item.DocumentNo || "";
                        if (!docMap.has(docNo)) {
                            docMap.set(docNo, {
                                totalDPP: 0,
                                totalPPN: 0,
                                totalPaid: 0,
                                totalDiff: 0,
                                otherExpense: item.OtherExpense || 0,
                                rows: []
                            });
                        }
                        let entry = docMap.get(docNo);
                        entry.totalDPP += (item.DPP || 0);
                        entry.totalPPN += (item.VAT || 0);
                        entry.totalPaid += (item.TotalPaid || 0);
                        entry.totalDiff += (item.DifferenceNominal || 0);
                        entry.rows.push(item);
                    }

                    for (let [docNo, entry] of docMap.entries()) {
                        if (entry.rows.length > 0) {
                            let firstRow = entry.rows[0];
                            firstRow.TotalDPP = entry.totalDPP;
                            firstRow.TotalPPN = entry.totalPPN;
                            firstRow.TotalPaid = entry.totalPaid + entry.otherExpense;
                            firstRow.DifferenceNominal = entry.totalDiff;
                        }
                    }

                    this.currentData = data;
                    setTimeout(() => this.mergeCells(), 100);

                    return {
                        total: result.info ? result.info.total : data.length,
                        data: data
                    };
                })
        ) : { total: 0, data: [] };
    }

    mergeCells(data) {
        if (!this.tableList || !this.tableList.table) return;
        let rows = data || this.currentData || [];
        if (!rows || rows.length === 0) return;

        // 1. Group by DocumentNo
        let docGroups = [];
        let currentDocNo = null;
        let currentDocGroup = null;

        for (let i = 0; i < rows.length; i++) {
            let item = rows[i];
            if (!item.DocumentNo) continue;
            if (item.DocumentNo !== currentDocNo) {
                currentDocNo = item.DocumentNo;
                currentDocGroup = {
                    index: i,
                    rowspan: 1,
                    docNo: item.DocumentNo,
                    items: [item]
                };
                docGroups.push(currentDocGroup);
            } else {
                currentDocGroup.rowspan++;
                currentDocGroup.items.push(item);
            }
        }

        let docMergeColumns = [
            "DocumentNo",
            "Date",
            "OtherExpense",
            "TotalDPP",
            "TotalPPN",
            "TotalPaid",
            "DifferenceNominal",
            "Currency",
            "BankName",
            "SupplierName"
        ];

        for (let group of docGroups) {
            if (group.rowspan > 1) {
                // Merge document-level columns
                for (let field of docMergeColumns) {
                    $(this.tableList.table).bootstrapTable("mergeCells", {
                        index: group.index,
                        field: field,
                        rowspan: group.rowspan,
                        colspan: 1
                    });
                }

                // Columns merged if values are identical across the document
                let checkFields = ["CategoryName", "DivisionName", "PaymentMethod"];
                for (let field of checkFields) {
                    let firstVal = group.items[0][field];
                    let allSame = group.items.every(it => it[field] === firstVal);
                    if (allSame) {
                        $(this.tableList.table).bootstrapTable("mergeCells", {
                            index: group.index,
                            field: field,
                            rowspan: group.rowspan,
                            colspan: 1
                        });
                    } else {
                        // Merge contiguous rows with the same value
                        let subStart = 0;
                        while (subStart < group.items.length) {
                            let subLen = 1;
                            let val = group.items[subStart][field];
                            while (subStart + subLen < group.items.length && group.items[subStart + subLen][field] === val) {
                                subLen++;
                            }
                            if (subLen > 1) {
                                $(this.tableList.table).bootstrapTable("mergeCells", {
                                    index: group.index + subStart,
                                    field: field,
                                    rowspan: subLen,
                                    colspan: 1
                                });
                            }
                            subStart += subLen;
                        }
                    }
                }
            }
        }

        // 2. Group by UnitPaymentOrderNo within Document (if SPB spans multiple rows)
        let spbGroups = [];
        let currentSPBKey = null;
        let currentSPBGroup = null;

        for (let i = 0; i < rows.length; i++) {
            let item = rows[i];
            let spbKey = `${item.DocumentNo || ""}__${item.UnitPaymentOrderNo || ""}`;
            if (spbKey !== currentSPBKey) {
                currentSPBKey = spbKey;
                currentSPBGroup = {
                    index: i,
                    rowspan: 1,
                    key: spbKey
                };
                spbGroups.push(currentSPBGroup);
            } else {
                currentSPBGroup.rowspan++;
            }
        }

        for (let group of spbGroups) {
            if (group.rowspan > 1) {
                $(this.tableList.table).bootstrapTable("mergeCells", {
                    index: group.index,
                    field: "UnitPaymentOrderNo",
                    rowspan: group.rowspan,
                    colspan: 1
                });
            }
        }
    }

    search() {
        if (this.info.dateFrom == 'Invalid Date')
            this.info.dateFrom = undefined;
        if (this.info.dateTo == 'Invalid Date')
            this.info.dateTo = undefined;

        if ((this.info.dateFrom && this.info.dateTo) || (!this.info.dateFrom && !this.info.dateTo)) {
            this.error = {};
            this.flag = true;
            this.tableList.refresh();
        } else {
            if (!this.info.dateFrom)
                this.error.dateFrom = "Tanggal Awal harus diisi";
            if (!this.info.dateTo)
                this.error.dateTo = "Tanggal Akhir harus diisi";
        }
    }

    getExcelData() {
        let info = {
            offset: this.page * 50,
            limit: 50,
        };

        this.loader(info)
            .then(response => {
                this.excelData.push(...response.data);

                if (this.excelData.length !== response.total) {
                    this.page++;
                    this.getExcelData();
                } else {
                    let wsData = [];
                    let prevDocNo = null;

                    for (let data of this.excelData) {
                        let isSameDoc = (data.DocumentNo === prevDocNo);
                        wsData.push({
                            'No Bukti Pengeluaran Bank': !isSameDoc ? data.DocumentNo : '',
                            'Tanggal Bayar DPP + PPN': !isSameDoc ? (data.Date ? moment(data.Date).format('DD MMM YYYY') : '-') : '',
                            'Category': data.CategoryName || '-',
                            'Divisi': data.DivisionName || '-',
                            'Cara Pembayaran': data.PaymentMethod || '-',
                            'Biaya Lain-lain': !isSameDoc ? (data.OtherExpense || data.OtherExpense === 0 ? numeral(data.OtherExpense).format('0,000.00') : '-') : '',
                            'Total DPP': !isSameDoc ? (data.TotalDPP || data.TotalDPP === 0 ? numeral(data.TotalDPP).format('0,000.00') : '-') : '',
                            'Total PPN': !isSameDoc ? (data.TotalPPN || data.TotalPPN === 0 ? numeral(data.TotalPPN).format('0,000.00') : '-') : '',
                            'Total Bayar Ke Supplier': !isSameDoc ? (data.TotalPaid || data.TotalPaid === 0 ? numeral(data.TotalPaid).format('0,000.00') : '-') : '',
                            'Sisa yang Belum Dibayar': !isSameDoc ? (data.DifferenceNominal || data.DifferenceNominal === 0 ? numeral(data.DifferenceNominal).format('0,000.00') : '-') : '',
                            'Mata Uang': !isSameDoc ? data.Currency : '',
                            'Bank Bayar PPH': !isSameDoc ? data.BankName : '',
                            'Supplier': !isSameDoc ? data.SupplierName : '',
                            'No SPB': data.UnitPaymentOrderNo,
                            'DPP': data.DPP || data.DPP === 0 ? numeral(data.DPP).format('0,000.00') : '-',
                            'PPN': data.VAT || data.VAT === 0 ? numeral(data.VAT).format('0,000.00') : '-',
                            'No Invoice': data.InvoiceNumber || '-'
                        });
                        prevDocNo = data.DocumentNo;
                    }

                    let wb = XLSX.utils.book_new();
                    wb.Props = {
                        Title: 'Report',
                        Subject: 'AG',
                        Author: 'AG',
                        CreatedDate: new Date()
                    };
                    wb.SheetNames.push('Laporan DPP PPN');

                    let ws;
                    if (wsData.length === 0) {
                        ws = XLSX.utils.aoa_to_sheet([
                            [
                                'No Bukti Pengeluaran Bank',
                                'Tanggal Bayar DPP + PPN',
                                'Category',
                                'Divisi',
                                'Cara Pembayaran',
                                'Biaya Lain-lain',
                                'Total DPP',
                                'Total PPN',
                                'Total Bayar Ke Supplier',
                                'Sisa yang Belum Dibayar',
                                'Mata Uang',
                                'Bank Bayar PPH',
                                'Supplier',
                                'No SPB',
                                'DPP',
                                'PPN',
                                'No Invoice'
                            ]
                        ], { origin: "A6" });
                    } else {
                        ws = XLSX.utils.json_to_sheet(wsData, { origin: "A6" });
                    }
                    XLSX.utils.sheet_add_aoa(ws, [
                        ["PT.AG"],
                        ["Laporan Bukti Pengeluaran Bank DPP + PPN"],
                        [`PERIODE : ${this.info.dateFrom ? moment(this.info.dateFrom).format('DD MMMM YYYY') : '-'} sampai dengan ${this.info.dateTo ? moment(this.info.dateTo).format('DD MMMM YYYY') : '-'}`]
                    ], { origin: "A2" });
                    wb.Sheets['Laporan DPP PPN'] = ws;

                    let wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'binary' });
                    let buf = new ArrayBuffer(wbout.length);
                    let view = new Uint8Array(buf);
                    for (let i = 0; i < wbout.length; i++) view[i] = wbout.charCodeAt(i) & 0xFF;

                    let fileSaver = require('file-saver');
                    fileSaver.saveAs(new Blob([buf], { type: 'application/octet-stream' }), 'Laporan DPP PPN.xlsx');
                }
            });
    }

    excel() {
        this.flag = true;

        this.page = 0;
        this.excelData = [];
        this.getExcelData();
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

    get divisionLoader() {
        return DivisionLoader;
    }

    get purchasingDocumentExpeditionUPONoLoader() {
        return PurchasingDocumentExpeditionLoader;
    }

    get purchasingDocumentExpeditionInvoiceNoLoader() {
        return PurchasingDocumentExpeditionLoader;
    }

    get bankExpenditureNoteLoader() {
        return BankExpenditureNoteDPPAndPPNLoader;
    }
}
