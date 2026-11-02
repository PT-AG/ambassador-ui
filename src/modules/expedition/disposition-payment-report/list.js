import { inject } from 'aurelia-framework';
import moment from 'moment';
import numeral from 'numeral';
import XLSX from 'xlsx';
import { Service } from './service';
const SupplierLoader = require('../../../loader/supplier-loader');
const DivisionLoader = require('../../../loader/division-loader');
const DispositionNoteLoader = require('../../../loader/purchase-dispositions-all-loader');
const BankExpenditureNoteDPPAndPPNLoader = require('../../../loader/payment-disposition-loader');
const BankLoader = require('../../../loader/account-banks-loader');

@inject(Service)
export class List {
    paymentMethodList = ["", "KREDIT", "DP(DOWN PAYMENT) + BP(BALANCE PAYMENT)", "DP(DOWN PAYMENT) + PERMIN 1 + BP(BALANCE PAYMENT)", "RETENSI"];
    isPaidFilter = { IsPaid: true };

    columns = [
        { field: 'ExpenditureNo', title: 'No. Bukti Pembayaran Disposisi' },
        {
            field: 'ExpenditureDate',
            title: 'Tanggal Bayar Disposisi',
            formatter: function (value, data, index) {
                return value ? moment(value).format('DD MMM YYYY') : "-";
            }
        },
        { field: 'DispositionNo', title: 'No. Disposisi' },
        {
            field: 'DispositionDate', title: 'Tgl Disposisi',
            formatter: function (value, data, index) {
                return value ? moment(value).format('DD MMM YYYY') : "-";
            }
        },
        {
            field: 'DispositionDueDate', title: 'Tgl Jatuh Tempo',
            formatter: function (value, data, index) {
                return value ? moment(value).format('DD MMM YYYY') : "-";
            }
        },
        { field: 'BankName', title: 'Bank Bayar' },
        { field: 'CurrencyCode', title: 'Mata Uang' },
        { field: 'SupplierName', title: 'Supplier' },
        { field: 'ProformaNo', title: 'Nomor Proforma Invoice' },
        { field: 'CategoryName', title: 'Kategori' },
        { field: 'DivisionName', title: 'Divisi' },
        {
            field: 'VATAmount', title: 'PPN', formatter: function (value, data, index) {
                return value ? numeral(value).format("0,000.00") : "-";
            },
            align: 'right'
        },
        {
            field: 'OtherExpense',
            title: 'Biaya Lain-lain',
            formatter: function (value, data, index) {
                return value || value == 0 ? numeral(value).format("0,000.00") : "-";
            },
            align: 'right'
        },
        {
            field: 'PaidAmount', title: 'Total Disposisi', formatter: function (value, data, index) {
                return value || value == 0 ? numeral(value).format("0,000.00") : "-";
            },
            align: 'right'
        },
        {
            field: 'DispositionNominal', title: 'Jumlah dibayar ke Supplier', formatter: function (value, data, index) {
                return value || value == 0 ? numeral(value).format("0,000.00") : "-";
            },
            align: 'right'
        },
        {
            field: 'TotalPaidOverall',
            title: 'Total Bayar Keseluruhan',
            formatter: function (value, data, index) {
                let total = (value !== undefined && value !== null)
                    ? value
                    : ((Number(data.DispositionNominal) || 0) + (Number(data.OtherExpense) || 0));
                return numeral(total).format("0,000.00");
            },
            align: 'right'
        },
        {
            field: 'DifferenceAmount', title: 'Sisa yang Belum Dibayar', formatter: function (value, data, index) {
                return value || value == 0 ? numeral(value).format("0,000.00") : "-";
            },
            align: 'right'
        },
        { field: 'TransactionType', title: 'Jenis Transaksi' }
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
            arg.bankExpenditureId = this.info.bankExpenditureNote.Id;
        if (this.info.dispositionNote)
            arg.dispositionId = this.info.dispositionNote.Id;
        if (this.info.supplier)
            arg.supplierId = this.info.supplier._id ? this.info.supplier._id : (this.info.supplier.Id || 0);
        if (this.info.division)
            arg.divisionId = this.info.division.Id;
        if ((this.info.startDate && this.info.startDate != 'Invalid Date') || (this.info.endDate && this.info.endDate != 'Invalid Date')) {
            arg.startDate = this.info.startDate && this.info.startDate != 'Invalid Date' ? this.info.startDate : '';
            arg.endDate = this.info.endDate && this.info.endDate != 'Invalid Date' ? this.info.endDate : '';

            if (!arg.startDate) {
                arg.startDate = new Date(arg.endDate);
                arg.startDate.setMonth(arg.startDate.getMonth() - 1);
            }

            if (!arg.endDate) {
                arg.endDate = new Date(arg.startDate);
                arg.endDate.setMonth(arg.endDate.getMonth() + 1);
            }

            arg.startDate = moment(arg.startDate).format();
            arg.endDate = moment(arg.endDate).format();
        }

        return this.flag ? (
            this.service.search(arg)
                .then((result) => {
                    let data = result.data || [];
                    data.sort((a, b) => {
                        let cmp = (a.ExpenditureNo || "").localeCompare(b.ExpenditureNo || "");
                        if (cmp !== 0) return cmp;
                        return (a.DispositionNo || "").localeCompare(b.DispositionNo || "");
                    });

                    let docTotals = {};
                    for (let item of data) {
                        let expNo = item.ExpenditureNo;
                        if (!docTotals[expNo]) {
                            docTotals[expNo] = {
                                otherExpense: Number(item.OtherExpense) || 0,
                                totalPaidToSupplier: 0
                            };
                        }
                        docTotals[expNo].totalPaidToSupplier += (Number(item.DispositionNominal) || 0);
                    }

                    for (let item of data) {
                        let doc = docTotals[item.ExpenditureNo];
                        item.TotalPaidOverall = (item.TotalPaidOverall !== undefined && item.TotalPaidOverall !== null && item.TotalPaidOverall !== 0)
                            ? item.TotalPaidOverall
                            : (doc ? (doc.totalPaidToSupplier + doc.otherExpense) : ((Number(item.DispositionNominal) || 0) + (Number(item.OtherExpense) || 0)));
                    }

                    this.currentData = data;
                    setTimeout(() => this.mergeCells(), 100);

                    return {
                        total: data.length,
                        data: data
                    };
                })
        ) : { total: 0, data: [] };
    }

    mergeCells(data) {
        if (!this.tableList || !this.tableList.table) return;
        let rows = data || this.currentData || [];
        if (!rows || rows.length === 0) return;

        let expenditureGroups = [];
        let currentExpenditureNo = null;
        let currentGroup = null;

        for (let i = 0; i < rows.length; i++) {
            let item = rows[i];
            if (!item.ExpenditureNo) continue;
            if (item.ExpenditureNo !== currentExpenditureNo) {
                currentExpenditureNo = item.ExpenditureNo;
                currentGroup = {
                    index: i,
                    rowspan: 1,
                    expenditureNo: item.ExpenditureNo
                };
                expenditureGroups.push(currentGroup);
            } else {
                currentGroup.rowspan++;
            }
        }

        let mergeColumns = [
            "ExpenditureNo",
            "ExpenditureDate",
            "BankName",
            "OtherExpense",
            "TotalPaidOverall",
            "CurrencyCode",
            "SupplierName",
            "TransactionType"
        ];

        for (let group of expenditureGroups) {
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
        if (this.info.startDate == 'Invalid Date')
            this.info.startDate = undefined;
        if (this.info.endDate == 'Invalid Date')
            this.info.endDate = undefined;

        if ((this.info.startDate && this.info.endDate) || (!this.info.startDate && !this.info.endDate)) {
            this.error = {};
            this.flag = true;
            this.tableList.refresh();
        } else {
            if (!this.info.startDate)
                this.error.startDate = "Tanggal Awal harus diisi";
            if (!this.info.endDate)
                this.error.endDate = "Tanggal Akhir harus diisi";
        }
    }

    getExcelData() {
        let info = {
            offset: this.page * 50,
            limit: 50,
        };
    }

    excel() {
        if (this.info.startDate == 'Invalid Date')
            this.info.startDate = undefined;
        if (this.info.endDate == 'Invalid Date')
            this.info.endDate = undefined;

        if ((this.info.startDate && this.info.endDate) || (!this.info.startDate && !this.info.endDate)) {
            this.error = {};
            this.flag = true;
            let arg = {
                select: [],
            };

            if (this.info.bank)
                arg.bankId = this.info.bank.Id;
            else
                arg.bankId = 0;
            if (this.info.bankExpenditureNote)
                arg.bankExpenditureId = this.info.bankExpenditureNote.Id;
            else
                arg.bankExpenditureId = 0;
            if (this.info.dispositionNote)
                arg.dispositionId = this.info.dispositionNote.Id;
            else
                arg.dispositionId = 0;
            if (this.info.supplier)
                arg.supplierId = this.info.supplier._id ? this.info.supplier._id : (this.info.supplier.Id || 0);
            else
                arg.supplierId = 0;
            if (this.info.division)
                arg.divisionId = this.info.division.Id;
            else
                arg.divisionId = 0;

            if ((this.info.startDate && this.info.startDate != 'Invalid Date') || (this.info.endDate && this.info.endDate != 'Invalid Date')) {
                arg.startDate = this.info.startDate && this.info.startDate != 'Invalid Date' ? this.info.startDate : '';
                arg.endDate = this.info.endDate && this.info.endDate != 'Invalid Date' ? this.info.endDate : '';

                if (!arg.startDate) {
                    arg.startDate = new Date(arg.endDate);
                    arg.startDate.setMonth(arg.startDate.getMonth() - 1);
                }

                if (!arg.endDate) {
                    arg.endDate = new Date(arg.startDate);
                    arg.endDate.setMonth(arg.endDate.getMonth() + 1);
                }

                arg.startDate = moment(arg.startDate).format();
                arg.endDate = moment(arg.endDate).format();
            } else {
                arg.startDate = '';
                arg.endDate = '';
            }

            this.service.getXls(arg);
        } else {
            if (!this.info.startDate)
                this.error.startDate = "Tanggal Awal harus diisi";
            if (!this.info.endDate)
                this.error.endDate = "Tanggal Akhir harus diisi";
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
        this.info.dispositionNote = undefined;
        this.info.startDate = undefined;
        this.info.endDate = undefined;
        this.info.paymentMethod = "";
        this.error.startDate = undefined;
        this.error.endDate = undefined;
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

    get dispositionNoteLoader() {
        return DispositionNoteLoader;
    }

    get bankExpenditureNoteLoader() {
        return BankExpenditureNoteDPPAndPPNLoader;
    }
}
