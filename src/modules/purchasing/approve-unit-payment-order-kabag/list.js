import {inject} from 'aurelia-framework';
import {Service} from "./service";
import {Router} from 'aurelia-router';
import moment from 'moment';

@inject(Router, Service)
export class List {
    info = { page: 1, keyword: '' };

    context = ["Rincian"]

    columns = [
        { field: "DivisionName", title: "Divisi" },
        { field: "SupplierName", title: "Supplier" },
        {
            field: "date", title: "Tanggal Surat Perintah Bayar", formatter: function (value, data, index) {
                return moment(value).format("DD MMM YYYY");
            }
        },
        { field: "UPONo", title: "Nomor Surat Perintah Bayar" },
        { field: "unitReceiptNoteNo", title: "List Nomor Bon Unit-Nomor Surat Jalan", sortable: false }
    ];

    loader = (info) => {
        var order = {};
        var filter = {
            IsApprovedKabag: false,
            IsApprovedKasie: true,
        };

        if (info.sort)
            order[info.sort] = info.order;
        var arg = {
            page: parseInt(info.offset / info.limit, 10) + 1,
            size: info.limit,
            keyword: info.search,
            select: ["date", "no", "supplier.name", "division.name", "items.unitReceiptNote.no", "items.unitReceiptNote.deliveryOrder.no", "items.unitReceiptNote.items.PriceTotal", "isPosted", "isApprovedKasie", "isApprovedKabag"],
            filter: JSON.stringify(filter),
            order: order
        }

        return this.service.search(arg)
            .then(result => {
                //filtering data

                var filteredData = result.data.filter(item => {
                    var totalHarga = 0;
                    
                    if (item.items && item.items.length > 0) {
                        for (var upoItem of item.items) {
                            if (upoItem.unitReceiptNote && upoItem.unitReceiptNote.items) {
                                for (var detailItem of upoItem.unitReceiptNote.items) {
                                    totalHarga += (detailItem.PriceTotal || 0);
                                }
                            }
                        }
                    }
                    
                    return totalHarga > 3000000;
                });

                for (var _data of filteredData) {
                    var btuNo = _data.items.map(function (item) {
                        return `<li>${item.unitReceiptNote.no} - ${item.unitReceiptNote.deliveryOrder.no} </li>`;
                    });
                    _data.unitReceiptNoteNo = `<ul>${btuNo.join()}</ul>`;
                    _data.UPONo = _data.no;
                    _data.DivisionName = _data.division.name;
                    _data.SupplierName = _data.supplier.name;
                }
                return {
                    // total: result.info.total,
                    // data: result.data
                    total: filteredData.length,
                    data: filteredData
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
                this.router.navigateToRoute('view', { id: data._id });
                break;
        }
    }

    contextShowCallback(index, name, data) {
        return true;
    }

    // create() {
    //     this.router.navigateToRoute('create');
    // }
}