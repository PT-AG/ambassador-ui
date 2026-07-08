import { inject } from 'aurelia-framework';
import { Service } from "./service";
import { Router } from 'aurelia-router';
import { Base64Helper } from '../../../utils/base-64-coded-helper';

import moment from 'moment';
@inject(Router, Service)
export class List {
    context = ["Rincian"];
    columns = [
        { field: "YearOfPeriod", title: "T a h u n" },
        { field: "MonthOfPeriod", title: "B u l a n" },
        { field: "QuaterCode", title: "P e r i o d e" },
        { field: "SectionCode", title: "S e k s i"},
        { field: "SectionName", title: "Penanggung Jawab Seksi"},
        { field: "Amount", title: "Target Omzet" }
    ];

    loader = (info) => {
        var order = {};

        if (info.sort)
            order[info.sort] = info.order;

        var arg = {
            page: parseInt(info.offset / info.limit, 10) + 1,
            size: info.limit,
            keyword: info.search,
            order: order,
        }

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

    contextCallback(event) {
        var arg = event.detail;
        var data = arg.data;
        switch (arg.name) {
            case "Rincian":
                const encoded = Base64Helper.encode(data.Id);
                this.router.navigateToRoute('view', { id: encoded });
                //this.router.navigateToRoute('view', { id: data.Id });
                break;
        }
    }

    create() {
        this.router.navigateToRoute('create');
    }
}