import { inject } from 'aurelia-framework';
import { Service } from "./service";
import { Router } from 'aurelia-router';
import moment from 'moment';

@inject(Router, Service)
export class List {

    rowFormatter(data, index) {
        if (data.Status == "Sudah")
            return { classes: "success" }
        else
            return {}
    }

    context = ["Rincian","Cetak PDF"]

    columns = [

        { field: "UnitDONo", title: "No. Delivery Order" },
        { field: "RONo", title: "No. RO" },
        { field: "Article", title: "Artikel" },
        {
            field: "UnitDODate", title: "Tanggal DeliveryOrder", formatter: function (value, data, index) {
                return moment(value).format("DD MMM YYYY");
            }
        },
        { field: "UnitDOType", title: "Jenis Delivery Order" },
        { field: "UnitDOFor", title: "Unit" },
        { field: "UnitRequestName", title: "Unit Yang Meminta" },
        { field: "StorageName", title: "Gudang Yang Mengirim" },
        { field: "CreatedBy", title: "Yang Membuat" },
        { field: "Status", title: "Status BUK" }
    ];

    loader = async (info) => {
        var order = {};
        if (info.sort)
            order[info.sort] = info.order;
        var arg = {
            page: parseInt(info.offset / info.limit, 10) + 1,
            size: info.limit,
            keyword: info.search,
            order: order,
            filter: JSON.stringify({'UnitDOType=="MARKETING"': false})
        }

        return this.service.search(arg)
            .then(async result => {
                var data = {};
                data.total = result.info.total;
                data.data = result.data;
                
                
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
                this.router.navigateToRoute('view', { id: data.Id });
                break;
            case "Cetak PDF":
                this.service.getPdfById(data.Id);
                break;
        }
    }

    // contextShowCallback(index, name, data) {
    //     switch (name) {
    //         case "Cetak PDF":
    //             return data.IsPosted;
    //         default:
    //             return true;
    //     }
    // }

    create() {
        this.router.navigateToRoute('create');
    }
}