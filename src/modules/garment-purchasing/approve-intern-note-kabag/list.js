import { inject } from 'aurelia-framework';
import { Service,ServiceCore } from "./service";
import { Router } from 'aurelia-router';
var moment = require("moment");
import { AuthService } from "aurelia-authentication";

@inject(Router, Service,ServiceCore, AuthService)
export class List {

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
        { field: "inNo", title: "No. Nota Intern" },
        {
            field: "inDate", title: "Tanggal Nota Intern", formatter: function (value, data, index){
                return moment(value).format("DD MMM YYYY");
            }
        },
        { field: "supplier.Name", title: "Supplier" },
        { field: "items", title: "List No. Invoice", sortable: false },
        { field: "CreatedBy", title: "Admin Pembelian" }
    ];
    
    context = ["Rincian"];

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
            filter: JSON.stringify(this.filterSection),
            order: order
        };


        return this.service.search(arg)
            .then(result => {
                var data = {}
                data.total = result.info.total;
                data.data = result.data;
                data.data.forEach(s => {
                    s.items.toString = function () {
                        var str = "<ul>";
                        for (var item of s.items) {
                            str += `<li>${item.garmentInvoice.invoiceNo}</li>`;
                        }
                        str += "</ul>";
                        return str;
                    }
                });
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

    create() {
        this.router.navigateToRoute('create');
    }

    contextClickCallback(event) {
        var arg = event.detail;
        var data = arg.data;
        switch (arg.name) {
            case "Rincian":
                this.router.navigateToRoute('view', { id: data.Id });
                break;
        }
    }

	checkStatus(items) {
        var isCetak = true;
        for(var item of items){
            for(var detail of item.details){
                var receiptQuantityTotal = 0;
                var InvreceiptQuantityTotal = 0;
                var deliveryOrderItems = detail.deliveryOrder.items || [];
                var invoiceItems = item.garmentInvoice.items || [];
                
                var received=[];

                for(var invoiceItem of invoiceItems){
                    for(var detail of invoiceItem.details){
                        for(let coba of deliveryOrderItems){
                            for(let deliveryOrderDetail of coba.fulfillments){
                                if(deliveryOrderDetail.Id == detail.dODetailId){
                                    if(!received[deliveryOrderDetail.Id]){
                                        received[deliveryOrderDetail.Id]=deliveryOrderDetail.receiptQuantity;
                                    }
                                    else{
                                        received[deliveryOrderDetail.Id] +=deliveryOrderDetail.receiptQuantity;
                                    }
                                }
                            }
                        }
                    }
                }
                for(var flag of received){
                    if(flag===0){
                        isCetak = false;
                        break;
                    }
                }
            }
        }
		return isCetak;
	}
}
