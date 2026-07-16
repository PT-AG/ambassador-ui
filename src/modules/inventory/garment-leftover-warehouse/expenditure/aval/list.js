import { inject } from 'aurelia-framework';
import { Service } from "./service";
import { Router } from 'aurelia-router';
import moment from 'moment';
import { Base64Helper } from '../../../../../utils/base-64-coded-helper';

@inject(Router, Service)
export class List {

    context = ["detail","cetak PDF"]

    columns = [
        { field: "AvalExpenditureNo", title: "No Bon Pengeluaran" },
        {
            field: "ExpenditureDate", title: "Tgl Pengeluaran Gudang", formatter: function (value, data, index) {
                return moment(value).format("DD MMM YYYY");
            }
        },
        { field: "AvalType", title: "Tipe Pengeluaran" },
        { field: "ExpenditureTo", title: "Tujuan Pengeluaran" },
        { field: "BuyerName", title: "Buyer" },
        { field: "OtherDescription", title: "Keterangan Lain-lain" },
    ];

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
                for (const data of result.data) {
                    data.BuyerName = data.Buyer.Name;
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
            case "detail":
                const encoded = Base64Helper.encode(data.Id);
                this.router.navigateToRoute('view', { id: encoded });
                //this.router.navigateToRoute('view', { id: data.Id });
                break;
            case "cetak PDF":
                this.service.getPdfById(data.Id);
                break;
        }
    }

    create() {
        this.router.navigateToRoute('create');
    }
}
