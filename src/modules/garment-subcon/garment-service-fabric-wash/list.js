import { inject } from 'aurelia-framework';
import { Service } from "./service";
import { Router } from 'aurelia-router';
import { AuthService } from "aurelia-authentication";
var moment = require("moment");

@inject(Router, Service, AuthService)
export class List {
    constructor(router, service, authService) {
        this.service = service;
        this.router = router;
        this.authService = authService;
    }

    filter = {};
    activate(params) {
        let username = null;
        if (this.authService.authenticated) {
            const me = this.authService.getTokenPayload();
            username = me.username;
        }
    }

    context = ["Rincian", "Cetak"];

    columns = [
        { field: "ServiceSubconFabricWashNo", title: "No Subcon Jasa Komponen" },
        { field: "ServiceSubconFabricWashDate", title: "Tgl Subcon BB Fabric Wash / Print", formatter: value => moment(value).format("DD MMM YYYY") }
    ]

    loader = (info) => {
        var order = {};
        if (info.sort)
            order[info.sort] = info.order;

        var arg = {
            page: parseInt(info.offset / info.limit, 10) + 1,
            size: info.limit,
            keyword: info.search,
            order: order,
            filter: JSON.stringify(this.filter)
        }

        return this.service.search(arg)
            .then(result => {

                this.totalQuantity = result.info.totalQty;

                return {
                    total: result.info.total,
                    data: result.data,
                }
            });
    }

    contextClickCallback(event) {
        var arg = event.detail;
        var data = arg.data;
        switch (arg.name) {
            case "Rincian":
                this.router.navigateToRoute('view', { id: data.Id });
                break;
            case "Cetak":
                this.service.getPdfById(data.Id);
                break;

        }
    }

    create() {
        this.router.navigateToRoute('create');
    }

    downloadExcel(){
        this.router.navigateToRoute('excel');
    }
}