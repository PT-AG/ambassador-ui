import { inject, bindable } from 'aurelia-framework';
import { Service } from "./service";
import { Router } from 'aurelia-router';
var moment = require('moment');

@inject(Router, Service)
export class List {

    

    constructor(router, service) {
        this.service = service;
        this.router = router;
        // this.BC = ['BCDL', 'SELAIN BCDL'];
    }

    info = { page: 1,size:25};

 


    attached() {
    }

    activate() {
    }

    @bindable isImportItem;
    @bindable KtgrItem;
    
    KategoriItems= ['','BAHAN BAKU','BAHAN EMBALANCE','BAHAN PENDUKUNG']
    ImportItemS = ['','LOKAL','IMPORT']

    search(){
            this.info.page = 1;
            this.info.total=0;
            this.searching();        
    }
      
    searching() {
        let args = {
            page: this.info.page,
            size: this.info.size,
            dateFrom : this.dateFrom ? moment(this.dateFrom).format("YYYY-MM-DD") : "",
            dateTo : this.dateTo ? moment(this.dateTo).format("YYYY-MM-DD") : "",
            ctg : this.category ? this.category : "",
            isImport : this.Import,
        };

  
        this.service.search(args)
            .then(result => {
                this.info.total=result.info.total; 
                this.data = result.data;
                var datas = [];
                for (var item of this.data){
                    item.IncomeTaxDate=moment(item.IncomeTaxDate).format("DD MMM YYYY")=="01 Jan 0001" || moment(item.IncomeTaxDate).format("DD MMM YYYY")=="01 Jan 1970" ? "-" : moment(item.IncomeTaxDate).format("DD MMM YYYY");
                    item.INDate=moment(item.INDate).format("DD MMM YYYY")=="01 Jan 1970" ? "-" : moment(item.INDate).format("DD MMM YYYY");                    

                    item.DOQuantity=item.DOQuantity.toLocaleString('en-EN',{minimumFractionDigits: 2, maximumFractionDigits: 2});
                    item.PricePerDealUnit=item.PricePerDealUnit.toLocaleString('en-EN',{minimumFractionDigits: 2, maximumFractionDigits: 2});
                    item.PriceTotal=item.PriceTotal.toLocaleString('en-EN',{minimumFractionDigits: 2, maximumFractionDigits: 2});
                    item.Conversion=item.Conversion.toLocaleString('en-EN',{minimumFractionDigits: 2, maximumFractionDigits: 2});
                    item.SmallQuantity=item.SmallQuantity.toLocaleString('en-EN',{minimumFractionDigits: 2, maximumFractionDigits: 2});
                    item.ReceiptQuantity=item.ReceiptQuantity.toLocaleString('en-EN',{minimumFractionDigits: 2, maximumFractionDigits: 2});
                    item.URNPricePerDealUnit=item.URNPricePerDealUnit.toLocaleString('en-EN',{minimumFractionDigits: 2, maximumFractionDigits: 2});
                    item.URNPriceTotal=item.URNPriceTotal.toLocaleString('en-EN',{minimumFractionDigits: 2, maximumFractionDigits: 2});
                    item.URNConversion=item.URNConversion.toLocaleString('en-EN',{minimumFractionDigits: 2, maximumFractionDigits: 2});
                    item.URNSmallQuantity=item.URNSmallQuantity.toLocaleString('en-EN',{minimumFractionDigits: 2, maximumFractionDigits: 2});

                    item.PPN=item.PPN.toLocaleString('en-EN',{minimumFractionDigits: 2, maximumFractionDigits: 2});
                    item.DPPValas=item.DPPValas.toLocaleString('en-EN',{minimumFractionDigits: 2, maximumFractionDigits: 2});
                    item.Rate=item.Rate.toLocaleString('en-EN',{minimumFractionDigits: 2, maximumFractionDigits: 2});
                    datas.push(item);
                }
                this.data = datas;
              })
    }

    reset() {
        this.dateFrom= "",
        this.dateTo=""
        this.data = [];
        this.info.page = 1;
    }

    exportToXls() {
        let args = {            
            page: this.info.page,
            size: this.info.size,
            dateFrom : this.dateFrom ? moment(this.dateFrom).format("YYYY-MM-DD") : "",
            dateTo : this.dateTo ? moment(this.dateTo).format("YYYY-MM-DD") : "",
            ctg : this.category ? this.category : "",
            isImport : this.Import,
        };
        
        this.service.generateExcel(args.dateFrom, args.dateTo, args.ctg, args.isImport);
    }

    dateFromChanged(e) {
        var _startDate = new Date(e.srcElement.value);
        var _endDate = new Date(this.dateTo);
        this.dateMin = moment(_startDate).format("YYYY-MM-DD");

        if (_startDate > _endDate || !this.dateTo) {
            this.dateTo = e.srcElement.value;
        }
    }

    KtgrItemChanged(newvalue){
        if (newvalue) {
            if (newvalue === "BAHAN BAKU") {
                this.category = "BB";
            }
            else if (newvalue === "BAHAN PENDUKUNG") { 
                this.category = "BP"; 
            }
            else if (newvalue === "BAHAN EMBALANCE") {
                this.category = "BE"; 
            }else{
                this.category = "";
            }
        }else{
            this.category = "";
        }
    }

    isImportItemChanged(newvalue){
        if (newvalue) {
            if (newvalue === "LOKAL") {
                this.Import = false;
            }
            else if (newvalue === "IMPORT") { 
                this.Import = true; 
            }
        }else{
            this.Import = null;
        }
    }

    changePage(e) {
        var page = e.detail;
        this.info.page = page;
        this.searching();
    }
}