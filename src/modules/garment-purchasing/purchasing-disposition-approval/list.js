import { inject } from 'aurelia-framework';
import { Service,ServiceCore } from "./service";
import { Router } from 'aurelia-router';
import { activationStrategy } from 'aurelia-router';
import { AuthService } from "aurelia-authentication";
import moment from 'moment';
import numeral from "numeral";
import { Base64Helper } from '../../../utils/base-64-coded-helper';

@inject(Router, Service,ServiceCore, AuthService)
export class List {
    context = ["Detail"];
    columns = [
            { field: "DispositionNo", title: "Nomor Disposisi Pembayaran" },
            
            {
            field: "CreatedUtc", title: "Tanggal Disposisi", formatter: function (value, data, index) {
                return moment(value).format("DD MMM YYYY");
            }
            },
            { field: "Category", title: "Kategori"},
            { field: "SupplierName", title: "Supplier" },
            {
                field: "DueDate", title: "Tanggal Jatuh Tempo", formatter: function (value, data, index) {
                    return moment(value).format("DD MMM YYYY");
                }
            },
             { field: "CurrencyName", title: "Mata Uang"},
            { field: "AmountDisposition", title: "Nominal Disposisi", sortable: false,formatter:function(value, data, index) {
                return numeral(value).format("0,000.00");
            }},
            { 
                field: "IsPosted", title: "Status", formatter: function(value, data, index) {
                    if(data.IsApprovedDirector) return "SUDAH DISETUJUI DIREKSI";
                    if(data.IsApprovedBudget2) return "SUDAH DISETUJUI ANGGARAN2";
                    if(data.IsApprovedBudget1) return "SUDAH DISETUJUI ANGGARAN1";
                    if(data.IsApprovedVerification) return "SUDAH DISETUJUI VERIFICATION";
                    if(data.IsApprovedKabag) return "SUDAH DISETUJUI MANAGER 2";
                    if(data.IsApprovedKasie) return "SUDAH DISETUJUI MANAGER 1";
                    if(data.IsPosted) return "SUDAH DIPOSTING";
                    return "DRAFT";
                }
            }
    ];
    filter = {};

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
                if (result.data && result.data.Data && Array.isArray(result.data.Data)) {
                    result.data.Data.map(data => {
                        data.IsPostedLabel  = data.IsPosted ? "SUDAH" : "BELUM";
                        return data;
                    });
                } else {
                    result.data.Data = [];
                }
                return {
                    total: result.data ? result.data.Total : 0,
                    data: result.data ? result.data.Data : []
                }
            });
        }

    constructor(router, service,serviceCore, authService) {
        this.service = service;
        this.router = router;
        this.authService = authService;
        this.serviceCore=serviceCore;
    }

    determineActivationStrategy() {
        return activationStrategy.replace;
    }

    async activate(params, routeConfig, navigationInstruction) {
        const instruction = navigationInstruction.getAllInstructions()[0];
        const parentInstruction = instruction.parentInstruction;
        this.title = parentInstruction.config.title;
        const type = parentInstruction.config.settings.type;
        this.type = type;

        let username = null;
        if (this.authService.authenticated) {
            const me = this.authService.getTokenPayload();
            username = me.username;
        }

        switch (type) {
            case "manager1":
                this.filter = {
                    IsPosted: true,
                    IsApprovedKasie: false,
                    ApprovedKasieBy: username 
                };
                break;
            case "manager2":
                this.filter = {
                    IsApprovedKasie: true,
                    IsApprovedKabag: false,
                    ApprovedKabagBy: username 
                };
                break;
            case "verification":
                this.filter = {
                    IsApprovedKasie: true,
                    IsApprovedKabag: true,
                    IsApprovedVerification: false,
                    Position:3
                };
                break;
            case "budget1":
                this.filter = {
                    IsApprovedKasie: true,
                    IsApprovedKabag: true,
                    IsApprovedVerification: true,
                    IsApprovedBudget1: false,
                };
                break;
            case "budget2":
                this.filter = {
                    IsApprovedKasie: true,
                    IsApprovedKabag: true,
                    IsApprovedVerification: true,
                    IsApprovedBudget1: true,
                    IsApprovedBudget2: false,
                };
                break;
            case "director":
                this.filter = {
                    IsApprovedKasie: true,
                    IsApprovedKabag: true,
                    IsApprovedVerification: true,
                    IsApprovedBudget1: true,
                    IsApprovedBudget2: true,
                    IsApprovedDirector: false,
                };
                break;
            default:
                break;
        }
    }

    contextCallback(event) {
        var arg = event.detail;
        var data = arg.data;
        switch (arg.name) {
            case "Detail":
                const encoded = Base64Helper.encode(data.Id);
                this.router.navigateToRoute('view', { id: encoded });
                //this.router.navigateToRoute('view', { id: data.Id });
                break;
        }
    }
}