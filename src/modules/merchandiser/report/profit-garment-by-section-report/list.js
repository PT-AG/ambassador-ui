import { inject, bindable } from 'aurelia-framework';
import { Service } from "./service";
import { Router } from 'aurelia-router';
import moment from 'moment';
var SectionLoader = require('../../../../loader/garment-sections-loader');

@inject(Router, Service)
export class List {
    
    constructor(router, service) {
        this.service = service;
        this.router = router;
        this.today = new Date();
    }
   
    section=null;    
    dateFrom = null;
    dateTo = null;
      
    get sectionLoader() {
        return SectionLoader;
    }

    sectionView = (section) => { 
        return `${section.Code}`
    }

    sectionChanged(newValue){
        var selectedSection = newValue;
        if(selectedSection){
            this.data.SectionCodee = selectedSection.Code;
        }
    }

    activate() {
       
    }

    
    searching() {
        const toNum = (v) => {
            if (typeof v === 'number' && Number.isFinite(v)) return v;
            if (v === null || v === undefined) return 0;
            const s = String(v).trim();
            if (!s) return 0;
            // hilangkan thousand separator tanpa regex
            return Number(s.split(',').join('')) || 0;
        };

        var info = {
            dateFrom : this.dateFrom,
            dateTo : this.dateTo,
        }
        if (this.section) {
           info.section = this.section.Code
        }
        this.service.search(JSON.stringify(info))
            .then(result => {
                this.data = result;
                console.log(result);

                this.grandTotalByUom = [];
                this.grandTotal = 0;
                this.grandTotalGrossProfit = 0;

                var dataBySection = {};
                var subTotalSection = {};
                var subTotalSection1 = {};
                var subTotalSection2 = {};
                var subTotalSection3 = {};
                  
                  for (var data of result) {
                       var SECTION = data.Section;
                        if (!dataBySection[SECTION]) dataBySection[SECTION] = [];                 
                            dataBySection[SECTION].push({            
                            RO_Number : data.RO_Number,
                            Section : data.Section,
                            UnitName : data.UnitName,
                            BuyerCode : data.BuyerCode,
                            BuyerName : data.BuyerName,
                            BrandCode : data.BrandCode,
                            BrandName : data.BrandName,
                            Type : data.Type,
                            Article : data.Article,
                            Comodity : data.Comodity,
                            ComodityDescription : data.ComodityDescription,
                            FabAllow : data.FabAllow,
                            AccAllow : data.AccAllow,
                            DeliveryDate : moment(data.DeliveryDate).format("DD MMM YYYY")=="01 Jan 1970"? "-" : moment(data.DeliveryDate).format("DD MMM YYYY"),                          
                            Profit : data.Profit.toLocaleString('en-EN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),              
                            ProfitIDR : data.ProfitIDR.toLocaleString('en-EN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),                                 
                            ProfitUSD : data.ProfitUSD.toLocaleString('en-EN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),                                 
                            ProfitFOB : data.ProfitFOB.toLocaleString('en-EN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),                                 
                            Commision : data.Commision,
                            CommisionIDR : data.CommisionIDR,
                            // .toLocaleString('en-EN',{minimumFractionDigits: 2, maximumFractionDigits: 2}),
                            
                            Quantity : data.Quantity.toLocaleString('en-EN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),              
                            UOMUnit : data.UOMUnit,
                            CurrencyRate : data.CurrencyRate.toLocaleString('en-EN',{minimumFractionDigits: 0, maximumFractionDigits: 4}),
                            ConfirmPrice : data.ConfirmPrice.toLocaleString('en-EN',{minimumFractionDigits: 4, maximumFractionDigits: 4}),
                            ConfirmPrice1 : data.ConfirmPrice1.toLocaleString('en-EN',{minimumFractionDigits: 4, maximumFractionDigits: 4}),
                            HPP : data.HPP,
                            // .toLocaleString('en-EN',{minimumFractionDigits: 4, maximumFractionDigits: 4}),                      
                            TermPayment : data.TermPayment,
                            CMPrice : data.CMPrice.toLocaleString('en-EN',{minimumFractionDigits: 4, maximumFractionDigits: 4}),
                            FOBPrice : data.FOBPrice.toLocaleString('en-EN',{minimumFractionDigits: 4, maximumFractionDigits: 4}),
                            Amount : data.Amount.toLocaleString('en-EN',{minimumFractionDigits: 2, maximumFractionDigits: 2}),
                            GrossProfit : data.GrossProfit.toLocaleString('en-EN',{minimumFractionDigits: 2, maximumFractionDigits: 2}),
                         });
                    
                        if (!subTotalSection[SECTION]) {
                           subTotalSection[SECTION] = 0;
                           } 
                           subTotalSection[SECTION] += toNum(data.Amount);
                           
                        if (!subTotalSection1[SECTION]) {
                            subTotalSection1[SECTION] = 0;
                           } 
                           subTotalSection1[SECTION] += toNum(data.ProfitIDR);
 
                        if (!subTotalSection2[SECTION]) {
                            subTotalSection2[SECTION] = 0;
                            } 
                            subTotalSection2[SECTION] += toNum(data.ProfitUSD);

                        if (!subTotalSection3[SECTION]) {
                            subTotalSection3[SECTION] = 0;
                            } 
                            subTotalSection3[SECTION] += toNum(data.GrossProfit);
                        }
                    //
                    for (var data of result) {
                        const uomIndex = this.grandTotalByUom.findIndex(uom => uom.uom == data.UOMUnit);
                        if (uomIndex > -1) {
                            this.grandTotalByUom[uomIndex].quantity += toNum(data.Quantity);
                            this.grandTotalByUom[uomIndex].amount += toNum(data.Amount);
                        } else {
                            this.grandTotalByUom.push({
                                uom: data.UOMUnit,
                                quantity: toNum(data.Quantity),
                                amount: toNum(data.Amount)
                            });
                        }
                        //console.log(this.grandTotalByUom);
                        this.grandTotal += toNum(data.Amount);
                        this.grandTotalGrossProfit += toNum(data.GrossProfit);
                    }
                    //
                       
               var Sections = [];
               this.AmountTotal = 0;
               this.AmountTotal1 = 0;
               this.AmountTotal2 = 0;
               this.AmountTotal3 = 0;
               this.AmountTotalRp=0;
               this.AmountTotalusd=0;

                      
               for (var data in dataBySection) {
                   Sections.push({
                   data: dataBySection[data],
                   SECTION: dataBySection[data][0].Section,
                   subTotal: (subTotalSection[data]).toLocaleString('en-EN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
                   subTotal1: (subTotalSection1[data]).toLocaleString('en-EN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
                   subTotal2: (subTotalSection2[data]).toLocaleString('en-EN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
                   subTotal3: (subTotalSection3[data]).toLocaleString('en-EN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
                   //  subtotalusd:1111,
                  //  subtotalrp:2222
                  });
                //   console.log('SECTION :'+ SECTION);
                   this.AmountTotal += subTotalSection[data];                                     
                   this.AmountTotal1 += subTotalSection1[data];                                     
                   this.AmountTotal2 += subTotalSection2[data];  
                   this.AmountTotal3 += subTotalSection3[data];        
                   this.AmountTotalRp = subTotalSection[data];  
                   this.AmountTotalusd = subTotalSection[data];                           
                //    console.log('subTotal :'+ this.AmountTotal);
                //    console.log('AmountTotalRp :'+ this.AmountTotalRp);
                //    console.log('AmountTotalusd :'+ this.AmountTotalusd);
                  }

               //ini subtotal keseluruhan
             //console.log("subTotal stlh loop" ,this.AmountTotal);
            //    console.log('AmountTotalusd stlh loop :'+ this.AmountTotalRp);
            //    console.log(`AmountTotalrp stlh loop : ${this.AmountTotal-this.AmountTotalRp}`);
               this.subtotalusd=this.AmountTotalRp;
               this.subtotalrp=this.AmountTotal-this.AmountTotalRp;
               this.AmountTotal = this.AmountTotal.toLocaleString('en-EN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
               this.AmountTotal1 = this.AmountTotal1.toLocaleString('en-EN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
               this.AmountTotal2 = this.AmountTotal2.toLocaleString('en-EN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
               this.AmountTotal3 = this.AmountTotal3.toLocaleString('en-EN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
               this.Sections = Sections;

                });  
    }
          
    ExportToExcel() {
        var info = {
            dateFrom : this.dateFrom,
            dateTo : this.dateTo,
        }
        if (this.section) {
           info.section = this.section.Code
        }
        this.service.generateExcel(JSON.stringify(info));
    }

    reset() {
        this.dateFrom = null;
        this.dateTo = null;
        this.section = null;
        this.Sections = [];
        this.AmountTotal = null;
        this.AmountTotal1 = null;
        this.AmountTotal2 = null;  
        this.AmountTotal3 = null;
    }

    dateFromChanged(e) {
        var _startDate = new Date(e.srcElement.value);
        var _endDate = new Date(this.dateTo);

        if (_startDate > _endDate)
            this.dateTo = e.srcElement.value;

    } 
}
