import { inject } from 'aurelia-framework';
import { Service } from "./service";
import { Router } from 'aurelia-router';
import moment from 'moment';

@inject(Router, Service)
export class List {
    context = ["Detail"];

    rowFormatter(data, index) {
        if (data.IsApprovedKasie && data.IsApprovedKabag)
            return { classes: "success" }
        else
            return {}
    }

    columns = [
        { field: "EPONo", title: "No. PO Eksternal" },
        {
            field: "OrderDate", title: "Tanggal Order", formatter: function (value, data, index) {
                return moment(value).format("DD MMM YYYY");
            }
        },
        { field: "Supplier.Name", title: "Supplier" },
        { field: "CreatedBy", title: "Dibuat Oleh" },
        {
            field: "Items", title: "Keterangan OB", sortable: false, formatter: function (value, data, index) {
                if (value && value.length > 0) {
                    return value[0].OverBudgetRemark;
                }
                return "-";
            }
        }
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
        };

        return this.service.search(arg)
            .then(result => {
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
            case "Detail":
                this.router.navigateToRoute('view', { id: data.Id });
                break;
        }
    }
}
