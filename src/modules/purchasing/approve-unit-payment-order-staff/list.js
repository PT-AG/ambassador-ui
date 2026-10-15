import {inject} from 'aurelia-framework';
import { Service,ServiceCore } from "./service";
import { Router } from 'aurelia-router';
import { AuthService } from "aurelia-authentication";
import moment from 'moment';

@inject(Router, Service,ServiceCore, AuthService)
export class List {
    info = { page: 1, keyword: '' };

    context = ["Rincian"];

    async activate(params, routeConfig, navigationInstruction) {
        const instruction = navigationInstruction.getAllInstructions()[0];
        const parentInstruction = instruction.parentInstruction;
        this.title = parentInstruction.config.title;
        this.type = parentInstruction.config.settings.type;

        this.username = null;
        this.filterSection={};
    }

    columns = [
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
        this.filterSection["IsApprovedStaff==false"]=true;
        this.filterSection["IsPosted==true"]=true;

        if (info.sort)
            order[info.sort] = info.order;
        var arg = {
            page: parseInt(info.offset / info.limit, 10) + 1,
            size: info.limit,
            keyword: info.search,
            select: ["date", "no", "supplier.name", "division.name", "items.unitReceiptNote.no", "items.unitReceiptNote.deliveryOrder.no", "isPosted", "isApprovedKasie", "isApprovedStaff"],
            filter: JSON.stringify(this.filterSection),
            order: order
        }

        return this.service.search(arg)
            .then(result => {
                for (var _data of result.data) {
                    var btuNo = _data.items.map(function (item) {
                        return `<li>${item.unitReceiptNote.no} - ${item.unitReceiptNote.deliveryOrder.no} </li>`;
                    });
                    _data.unitReceiptNoteNo = `<ul>${btuNo.join()}</ul>`;
                    _data.UPONo = _data.no;
                    _data.DivisionName = _data.division.name;
                    _data.SupplierName = _data.supplier.name;
                }
                return {
                    total: result.info.total,
                    data: result.data
                }
            });
    }

    constructor(router, service,serviceCore, authService) {
        this.service = service;
        this.router = router;
        this.serviceCore=serviceCore;
        this.authService=authService;
    }

    contextClickCallback(event) {
        var arg = event.detail;
        var data = arg.data;
        switch (arg.name) {
            case "Rincian":
                this.router.navigateToRoute('view', { id: data.Id || data._id });
                break;
        }
    }

    contextShowCallback(index, name, data) {
        return true;
    }
}