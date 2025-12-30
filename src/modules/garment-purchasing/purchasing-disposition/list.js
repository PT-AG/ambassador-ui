import {inject} from 'aurelia-framework';
import {Service} from "./service";
import {Router} from 'aurelia-router';
import moment from 'moment';
import numeral from "numeral";

@inject(Router, Service)
export class List {
    dataToBePosted = [];

    info = { page: 1, keyword: '' };

    context = ["Rincian", "Cetak PDF"]

    columns = [
        {
            field: "Check", title: "Post", checkbox: true, sortable: false,
            formatter: function (value, data, index) {
                this.checkboxEnabled = !data.IsPosted; 
                return "";
            }
        },
        { field: "DispositionNo", title: "Nomor Disposisi Pembayaran" },
        {
            field: "CreatedUtc", title: "Tanggal Disposisi", formatter: function (value, data, index) {
                return moment(value).format("DD MMM YYYY");
            }
        },
        { field: "Category", title: "Kategori"},
        { field: "SupplierName", title: "Supplier" },
        {
            field: "DueDate", title: "Tanggal Jatuh Tempo", formatter: function (value, data, index) {
                return moment(value).format("DD MMM YYYY");
            }
        },
        { field: "CurrencyName", title: "Mata Uang"},
        { field: "AmountDisposition", title: "Nominal Disposisi", sortable: false,formatter:function(value, data, index) {
            return numeral(value).format("0,000.00");
        }},
        { 
            field: "IsPosted", title: "Status", formatter: function(value, data, index) {
                if(data.IsApprovedKabag) return "SUDAH DISETUJUI KABAG";
                if(data.IsApprovedKasie) return "SUDAH DISETUJUI KASIE";
                if(data.IsPosted) return "SUDAH DIPOSTING";
                return "DRAFT";
            }
        }
        
    ];

    rowFormatter(data, index) {
        if (data.IsApprovedKabag) 
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

                return {
                    total: result.data.Total,
                    data: result.data.Data
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
                this.router.navigateToRoute('view', { id: data.Id });
                break;
            case "Cetak PDF":
                this.service.getPdfById(data.Id);
                break;
        }
    }

    contextShowCallback(index, name, data) {
        switch (name) {
            case "Cetak PDF":
                return data.IsApprovedKabag;
            default:
                return true;
        }
    }

    create() {
        this.router.navigateToRoute('create');
    }

    posting() {
        if (this.dataToBePosted.length > 0) {
            if (confirm(`Posting ${this.dataToBePosted.length} data?`)) {
                
                var list = this.dataToBePosted.map(d => {
                    return {
                        Id: d.Id,
                        DispositionNo: d.DispositionNo
                    }
                });

                if (list.length === 0) {
                    alert(`Data yang dipilih sudah diposting semua.`);
                    return;
                }

                this.service.post(list)
                    .then(result => {
                        alert("Data berhasil diposting");
                        this.table.refresh();
                        this.dataToBePosted = [];
                    })
                    .catch(e => {
                        this.error = e;
                        alert("Gagal Posting: " + (e.message || e));
                    })
            }
        }
    }
}