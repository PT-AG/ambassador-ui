import { inject } from 'aurelia-framework';
import { Router, activationStrategy } from 'aurelia-router';
import moment from 'moment';
import { Service } from '../purchase-request/service';
import { Base64Helper } from '../../../utils/base-64-coded-helper';

const FILTER_BY_TYPE = {
    staff: { IsPosted: true, IsRejected: false, IsApprovedStaff: false },
    manager1: { IsPosted: true, IsRejected: false, IsApprovedStaff: true, IsApprovedManager1: false },
    manager2: { IsPosted: true, IsRejected: false, IsApprovedStaff: true, IsApprovedManager1: true, IsApprovedManager2: false }
};

@inject(Router, Service)
export class List {
    context = ["Rincian"];
    filter = {};
    title = "Approval Purchase Request";
    type = "staff";

    columns = [
        {
            field: "date", title: "Tgl. PR", formatter: function (value) {
                return value ? moment(value).format("DD MMM YYYY") : "-";
            }
        },
        {
            field: "CreatedUtc", title: "Tgl. Buat", formatter: function (value) {
                return value ? moment(value).format("DD MMM YYYY") : "-";
            }
        },
        { field: "no", title: "No. PR" },
        { field: "DivisionName", title: "Divisi" },
        { field: "UnitName", title: "Unit" },
        { field: "CategoryName", title: "Kategori" },
        {
            field: "items", title: "Barang", sortable: false,
            formatter: function (value, data) {
                if (data.items && data.items.length > 0) {
                    var products = data.items.map(function (item) {
                        var name = item.product && item.product.name ? item.product.name : (item.productName || "-");
                        return `<li>${name}</li>`;
                    });
                    return `<ul>${products.join("")}</ul>`;
                }
                return "-";
            }
        },
        { field: "CreatedBy", title: "Dibuat Oleh" }
    ];

    constructor(router, service) {
        this.router = router;
        this.service = service;
    }

    determineActivationStrategy() {
        return activationStrategy.replace;
    }

    activate(params, routeConfig, navigationInstruction) {
        const instruction = navigationInstruction && navigationInstruction.getAllInstructions()[0];
        const parentInstruction = instruction && instruction.parentInstruction;
        const config = (parentInstruction && parentInstruction.config) || {};
        const settings = config.settings || {};

        this.title = config.title || "Approval Purchase Request";
        this.type = settings.type || "staff";
        this.filter = FILTER_BY_TYPE[this.type] || {};
    }

    loader = (info) => {
        var order = {};
        if (info.sort)
            order[info.sort] = info.order;

        var arg = {
            page: parseInt(info.offset / info.limit, 10) + 1,
            size: info.limit,
            keyword: info.search,
            filter: JSON.stringify(this.filter),
            order: order
        };

        return this.service.search(arg, false)
            .then(result => {
                for (var data of result.data) {
                    data.Id = data.Id || data._id || 0;
                    data.DivisionName = data.unit && data.unit.division ? data.unit.division.name : "-";
                    data.UnitName = data.unit ? data.unit.name : "-";
                    data.CategoryName = data.category ? data.category.name : "-";
                    data.CreatedBy = data.CreatedBy || "-";
                    data.items = data.items || [];
                }
                return {
                    total: result.info.total,
                    data: result.data
                };
            });
    }

    contextClickCallback(event) {
        var arg = event.detail;
        var data = arg.data;
        if (arg.name === "Rincian") {
            const encoded = Base64Helper.encode(data._id);
            this.router.navigateToRoute('view', { id: encoded });
        }
    }
}
