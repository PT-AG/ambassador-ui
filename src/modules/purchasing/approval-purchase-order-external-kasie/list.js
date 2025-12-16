import { inject } from 'aurelia-framework';
import { Router } from 'aurelia-router';
import moment from 'moment';
import { Service } from './service';

@inject(Router, Service)
export class List {

    context = ["Rincian"];

    columns = [
        { field: "no", title: "Nomor PO Eksternal" },
        {
            field: "orderDate",
            title: "Tanggal PO Eksternal",
            formatter: value => moment(value).format("DD MMM YYYY")
        },
        { field: "supplier.name", title: "Nama Supplier" },
        {
            field: "purchaseRequestNo",
            title: "Nomor Purchase Request",
            sortable: false,
            formatter: value => value
        },
        {
            field: "isPosted",
            title: "Status Post",
            formatter: value => value ? "SUDAH" : "BELUM"
        }
    ];

    constructor(router, service) {
        this.router = router;
        this.service = service;
    }

    loader = (info) => {
        let order = {};
        if (info.sort) order[info.sort] = info.order;

        let filter = {
            IsPosted: true,
            IsApprovedKasie: false
        };

        let args = {
            page: Math.floor(info.offset / info.limit) + 1,
            size: info.limit,
            keyword: info.search,
            filter: JSON.stringify(filter),
            order
        };

        return this.service.search(args).then(result => {

            for (let data of result.data) {
                let prList = (data.items || []).map(i => i.prNo);

                prList = prList.filter((v, i, a) => a.indexOf(v) === i);

                data.purchaseRequestNo = prList.join("<br>");
            }

            return {
                total: result.info.total,
                data: result.data
            };
        });
    }

    contextClickCallback(event) {
        const { name, data } = event.detail;

        if (name === "Rincian") {
            this.router.navigateToRoute("view", { id: data._id });
        }
    }
}
