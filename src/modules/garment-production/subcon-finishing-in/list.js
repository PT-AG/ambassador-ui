import { inject } from 'aurelia-framework';
import { Service, PurchasingService } from "./service";
import { Router } from 'aurelia-router';
import { AuthService } from "aurelia-authentication";
var moment = require("moment");

@inject(Router, Service, PurchasingService, AuthService)
export class List {
    constructor(router, service, purchasingService, authService) {
        this.service = service;
        this.purchasingService = purchasingService;
        this.router = router;
        this.authService = authService;
    }

    filter = {};

    activate(params) {
        let username = null;

        console.log(this.authService.authenticated);

        if (this.authService.authenticated) {
            const me = this.authService.getTokenPayload();
            username = me.username;
        }

        this.filter = {
            CreatedBy: username,
            FinishingInType: "PEMBELIAN",
            'SubconType != null' : true
        }
    }

    context = ["Rincian", "Cetak"];

    columns = [
        { field: "FinishingInNo", title: "No Finishing In Subkon" },
        { field: "SubconType", title: "Jenis Subkon" },
        { field: "RONo", title: "RO" },
        { field: "Article", title: "No Artikel" },
        { field: "TotalFinishingInQuantity", title: "Jumlah", sortable: false },
        { field: "TotalRemainingQuantity", title: "Sisa", sortable: false },
        { field: "UnitCode", title: "Unit Finishing In Subkon" },
        { field: "FinishingInType", title: "Asal Barang" },
        { field: "FinishingInDate", title: "Tanggal Finishing In Subkon", formatter: value => moment(value).format("DD MMM YYYY") },
        { field: "ProductList", title: "Kode Barang", sortable: false },
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
                result.data.forEach(d => {
                    d.UnitCode = d.Unit.Code;
                    d.UnitFromCode = d.UnitFrom.Code;
                    d.ProductList = `${d.Products.map(p => `- ${p}`).join("<br/>")}`;
                });
                return {
                    total: result.info.total,
                    data: result.data
                }
            });
    }

    async contextClickCallback(event) {
        var arg = event.detail;
        var data = arg.data;
        let pr = await this.purchasingService.getGarmentPR({ size: 1, filter: JSON.stringify({ RONo: data.RONo }) });
        var buyer = "";

        if(pr.data.length>0){
            buyer = pr.data[0].Buyer.Code;
        }

        switch (arg.name) {
            case "Rincian":
                this.router.navigateToRoute('view', { id: data.Id });
                break;
            case "Cetak":
                this.service.getPdfById(data.Id, buyer); 
                break;
        }
    }

    create() {
        this.router.navigateToRoute('create');
    }
}