import { inject } from 'aurelia-framework';
import { Service } from "./service";
import { Router } from 'aurelia-router';
import moment from 'moment';

@inject(Router, Service)
export class List {
    context = ["detail"];
    columns = [
        { field: "Year", title: "Tahun" },
        { field: "Items", title: "Bulan", }
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

                const monthOrder = [
                    'JANUARI', 'FEBRUARI', 'MARET', 'APRIL',
                    'MEI', 'JUNI', 'JULI', 'AGUSTUS',
                    'SEPTEMBER', 'OKTOBER', 'NOVEMBER', 'DESEMBER'
                ];
                result.data.forEach(s => {
                    s.Items.toString = function () {
                        // Sort items sesuai urutan bulan
                        let sortedItems = this
                            .filter(item => item.IsBlock)
                            .sort((a, b) => {
                                return monthOrder.indexOf(a.Month) - monthOrder.indexOf(b.Month);
                            });

                        let str = "<ul>";
                        for (let item of sortedItems) {
                            str += `<li>${item.Month}</li>`;
                        }
                        str += "</ul>";
                        return str;
                    };
                });
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
                this.router.navigateToRoute('view', { id: data.Id });
                break;
        }
    }

    create() {
        this.router.navigateToRoute('create');
    }
}