import { inject } from 'aurelia-framework';
import { Service } from "./service";
import { Router } from 'aurelia-router';
var moment = require("moment");

@inject(Router, Service)
export class List {
    dataToBePosted = [];

    rowFormatter(data, index) {
        if (data.IsApprovedKasie && data.IsApprovedKabag)
            return { classes: "success" }
        else if (data.isPosted)
            return { classes: "error" }
        else
            return {}
    }
    
    columns = [
        {
            field: "Check", title: "Post", checkbox: true, sortable: false,
            formatter: function (value, data, index) {
                this.checkboxEnabled = !data.isPosted; 
                return "";
            }
        },
        { field: "inNo", title: "No. Nota Intern" },
        {
            field: "inDate", title: "Tanggal Nota Intern", formatter: function (value, data, index){
                return moment(value).format("DD MMM YYYY");
            }
        },
        { field: "supplier.Name", title: "Supplier" },
        { field: "items", title: "List No. Invoice", sortable: false },
        { field: "CreatedBy", title: "Admin Pembelian" },
        { 
            field: "IsPosted", title: "Status", formatter: function(value, data, index) {
                if(data.IsApprovedKabag) return "SUDAH DISETUJUI KABAG";
                if(data.IsApprovedKasie) return "SUDAH DISETUJUI KASIE";
                if(data.isPosted) return "SUDAH DIPOSTING";
                return "DRAFT";
            }
        }
    ];
    
    context = ["Rincian", "Cetak PDF"];

    loader = (info) => {
        var order = {};
        if (info.sort)
            order[info.sort] = info.order;

        var arg = {
            page: parseInt(info.offset / info.limit, 10) + 1,
            size: info.limit,
            keyword: info.search,
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

    constructor(router, service) {
        this.service = service;
        this.router = router;
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
            case "Cetak PDF":
                this.service.getPdfById(data.Id);
                break;
        }
    }

	checkStatus(data) {
        var items = data.items || [];
        var isCetak = true;

        var totalAmount = 0;
        for(var item of items){
            if(item.garmentInvoice && item.garmentInvoice.items){
                for(var invItem of item.garmentInvoice.items){
                    for(var detail of invItem.details){
                        totalAmount += (detail.priceTotal || detail.PriceTotal || 0);
                    }
                }
            }
            
            for(var detail of item.details){
                var deliveryOrderItems = detail.deliveryOrder.items || [];
                var invoiceItems = item.garmentInvoice.items || [];
                var received=[];
                for(var invoiceItem of invoiceItems){
                    for(var det of invoiceItem.details){
                        for(let coba of deliveryOrderItems){
                            for(let deliveryOrderDetail of coba.fulfillments){
                                if(deliveryOrderDetail.Id == det.dODetailId){
                                    if(!received[deliveryOrderDetail.Id]){
                                        received[deliveryOrderDetail.Id]=deliveryOrderDetail.receiptQuantity;
                                    } else{
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

        if (isCetak === false) {
            return false;
        }

        var isKasie = data.IsApprovedKasie;
        var isKabag = data.IsApprovedKabag;
        var isPosted = data.isPosted;

        if (totalAmount > 25000000) {
            return isPosted && isKasie && isKabag;
        } else {
            return isPosted && isKasie;
        }
    }

    contextShowCallback(index, name, data) {
        switch (name) {
            case "Cetak PDF":
                return this.checkStatus(data);
            default:
                return true;
        }
    }
    
    posting() {
        if (this.dataToBePosted.length > 0) {
            if (confirm(`Posting ${this.dataToBePosted.length} data?`)) {
                var list = this.dataToBePosted.map(d => {
                    return { 
                        Id: d.Id, 
                        INNo: d.INNo 
                    } 
                });

                this.service.post(list)
                    .then(result => {
                        alert("Data berhasil diposting");
                        this.table.refresh();
                        this.dataToBePosted = [];
                    })
                    .catch(e => {
                        this.error = e;
                    })
            }
        }
    }
}
