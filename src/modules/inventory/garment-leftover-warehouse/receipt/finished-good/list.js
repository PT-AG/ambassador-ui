import { inject } from 'aurelia-framework';
import { Service } from "./service";
import { Router } from 'aurelia-router';
import moment from 'moment';
import { Base64Helper } from '../../../../../utils/base-64-coded-helper';

@inject(Router, Service)
export class List {
    dataToBePosted = [];

    rowFormatter(data, index) {
        if (data.IsPosted) {
            return { classes: "success" };
        } else return {};
    }

    context = ["detail","cetak PDF"]

    columns = [
        {
            title: "Post?",
            checkbox: true,
            sortable: false,
            formatter: function (value, data) {
                return { disabled: data.IsPosted };
            },
        },
        { field: "FinishedGoodReceiptNo", title: "No Bon Penerimaan" },
        { field: "UnitFromName", title: "Unit Asal" },
        {
            field: "ReceiptDate", title: "Tgl Penerimaan Gudang", formatter: function (value, data, index) {
                return moment(value).format("DD MMM YYYY");
            }
        },
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
                    data.UnitFromName = data.UnitFrom.Name;
                    
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

    contextShowCallback(index, name, data) {
        switch (name) {
            case "cetak PDF":
                return data.IsPosted;
            default:
                return true;
        }
    }

    posting() {
        if (this.dataToBePosted.length > 0) {
            const ids = this.dataToBePosted.map(item => item.Id);  // ✅ Extract ID saja
            this.service
                .post(ids)
                .then((result) => {
                    this.table.refresh();
                })
                .catch((e) => {
                    this.error = e;
                });
        }
    }

    create() {
        this.router.navigateToRoute('create');
    }
}
