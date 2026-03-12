import {inject} from 'aurelia-framework';
import { Service,ServiceCore } from "./service";
import {Router} from 'aurelia-router';
import { AuthService } from "aurelia-authentication";
import moment from 'moment';
import numeral from "numeral";

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
        if (this.authService.authenticated) {
            const me = this.authService.getTokenPayload();
            this.username = me.username;
        }
        var filterS = {
            Manager2: this.username
        };

        var argS = {
            filter: JSON.stringify(filterS)
        };

        var section= await this.serviceCore.searchSection(argS);
        this.filterSection={};
        var filter="";
        if(section.data.length>0){
            for(var staf of section.data){
                if(filter=="")
                    filter=`CreatedBy=="${staf.Name}"`;
                else
                    filter+=`|| CreatedBy=="${staf.Name}"`;
            }
            this.filterSection[`${filter}`]=true
        }
        else{
            this.filterSection[`CreatedBy=="null"`]=true;
        }
        
    }

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
        { field: "CreatedBy", title: "Yang Membuat"},
        
    ];

    loader = (info) => {
        var order = {};
        if (info.sort)
            order[info.sort] = info.order;

        this.filterSection["IsApprovedKasie==true"]=true;
        this.filterSection["IsApprovedKabag==false"]=true;
        this.filterSection["IsPosted==true"]=true;

        var arg = {
            page: parseInt(info.offset / info.limit, 10) + 1,
            size: info.limit,
            keyword: info.search,
            order: order,
            filter: JSON.stringify(this.filterSection),
        }

        return this.service.search(arg)
            .then(result => {

                return {
                    total: result.data.Total,
                    data: result.data.Data
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
                this.router.navigateToRoute('view', { id: data.Id });
                break;
            case "Cetak PDF":
                this.service.getPdfById(data.Id);
            break;
        }
    }

    contextShowCallback(index, name, data) {
        switch (name) {
            case "Cetak PDF":
                return true;
            default:
                return true;
        }
    }

    create() {
        this.router.navigateToRoute('create');
    }
}