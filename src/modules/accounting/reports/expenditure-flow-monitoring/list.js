import {inject, bindable} from 'aurelia-framework';
import {Service} from "./service";
import {Router} from 'aurelia-router';
import moment from 'moment';
//const UnitLoader = require('../../../loader/garment-units-loader');

@inject(Router, Service)
export class List {
    constructor(router, service) {
        this.service = service;
        this.router = router;

    }
    bind(context) {
        this.context = context;
    }

    controlOptions = {
        label: {
            length: 4
        },
        control: {
            length: 4
        }
    };

    @bindable UnitItem;

    UnitItems = ['','AMBASSADOR GARMINDO 1','AMBASSADOR GARMINDO 2']

    searching() {
        var info = {
            // unit : this.unit ? this.unit.Id : "",
            unit : this.unit ? this.unit : 0,
            dateFrom : this.dateFrom ? moment(this.dateFrom).format("YYYY-MM-DD") :  moment(new Date()).format("YYYY-MM-DD") ,
            dateTo : this.dateTo ? moment(this.dateTo).format("YYYY-MM-DD") :  moment(new Date()).format("YYYY-MM-DD") ,
            
        }
        const format = (val) =>
                            (val === null || val === undefined ? 0 : val)
                                .toLocaleString('en-EN', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                                });
        const fieldsToFormat = [
                                "QtyOrder",
                                "BasicPrice",

                                "BeginingBalanceExpenditureGood",
                                "ExpenditureGoodRetur",
                                "ExpenditureGoodRemainingQty",
                                "ExpenditureGoodInTransfer",
                                "ExpenditureGoodAdj",
                                "EndBalanceExpenditureGood",
                                "ExportQty",
                                "LocalQty",
                                "OtherQty",
                                "SampleQty",
                                "FinishingInExpenditure",

                                "SubconExpenditureGoodInQty",
                                "SubconExpenditureGoodOutQty"
                                ];
            this.service.search(info)
            .then(result => {
                this.data = result.map(item => {

                let formatted = { ...item };

                for (let field of fieldsToFormat) {
                    formatted[`_${field}`] = format(item[field]);
                }

                return formatted;
                });
            });

    }

    

    ExportToExcel() {
        var info = {
            unit : this.unit ? this.unit : 0,
            dateFrom : this.dateFrom ? moment(this.dateFrom).format("YYYY-MM-DD") :  moment(new Date()).format("YYYY-MM-DD") ,
            dateTo : this.dateTo ? moment(this.dateTo).format("YYYY-MM-DD") :  moment(new Date()).format("YYYY-MM-DD")
        }

        this.service.generateExcel(info);
    }

    // get unitLoader(){
    //     return UnitLoader;
    // }
    // unitView = (unit) => {
    //     return `${unit.Code} - ${unit.Name}`;
    // }

    get AmountOrder()
    {
        var totalOrder=0;
        if(this.data)
        {
        for(var item of this.data)
        {
            totalOrder += item.QtyOrder;
        }
        }
        return totalOrder.toLocaleString('en-EN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

   

    get BeginingBalanceSubconQtyTotal()
    {
        var sum=0;
        if(this.data)
        {
        for(var item of this.data)
        {
            sum += item.BeginingBalanceSubconQty;
        }
        }
        return sum.toLocaleString('en-EN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    get SubconInQtyTotal()
    {
        var sum=0;
        if(this.data)
        {
        for(var item of this.data)
        {
            sum += item.SubconInQty;
        }
        }
        return sum.toLocaleString('en-EN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    get SubconOutQtyTotal()
    {
        var sum=0;
        if(this.data)
        {
        for(var item of this.data)
        {
            sum += item.SubconOutQty;
        }
        }
        return sum.toLocaleString('en-EN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    get EndBalanceSubconQtyTotal()
    {
        var sum=0;
        if(this.data)
        {
        for(var item of this.data)
        {
            sum += item.EndBalanceSubconQty;
        }
        }
        return sum.toLocaleString('en-EN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    get BeginingBalanceExpenditureGoodTotal()
    {
        var sum=0;
        if(this.data)
        {
        for(var item of this.data)
        {
            sum += item.BeginingBalanceExpenditureGood;
        }
        }
        return sum.toLocaleString('en-EN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    get FinishingInExpenditureTotal()
    {
        var sum=0;
        if(this.data)
        {
        for(var item of this.data)
        {
            sum += item.FinishingInExpenditure;
        }
        }
        return sum.toLocaleString('en-EN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    get ExpenditureGoodInTransferTotal()
    {
        var sum=0;
        if(this.data)
        {
        for(var item of this.data)
        {
            sum += item.ExpenditureGoodInTransfer;
        }
        }
        return sum.toLocaleString('en-EN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    get ExpenditureGoodReturTotal()
    {
        var sum=0;
        if(this.data)
        {
        for(var item of this.data)
        {
            sum += item.ExpenditureGoodRetur;
        }
        }
        return sum.toLocaleString('en-EN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    get ExportQtyTotal()
    {
        var sum=0;
        if(this.data)
        {
        for(var item of this.data)
        {
            sum += item.ExportQty;
        }
        }
        return sum.toLocaleString('en-EN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    get LocalQtyTotal()
    {
        var sum=0;
        if(this.data)
        {
        for(var item of this.data)
        {
            sum += item.LocalQty;
        }
        }
        return sum.toLocaleString('en-EN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    get OtherQtyTotal()
    {
        var sum=0;
        if(this.data)
        {
        for(var item of this.data)
        {
            sum += item.OtherQty;
        }
        }
        return sum.toLocaleString('en-EN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    get SampleQtyTotal()
    {
        var sum=0;
        if(this.data)
        {
        for(var item of this.data)
        {
            sum += item.SampleQty;
        }
        }
        return sum.toLocaleString('en-EN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    get ExpenditureGoodAdjTotal()
    {
        var sum=0;
        if(this.data)
        {
        for(var item of this.data)
        {
            sum += item.ExpenditureGoodAdj;
        }
        }
        return sum.toLocaleString('en-EN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    get EndBalanceExpenditureGoodTotal()
    {
        var sum=0;
        if(this.data)
        {
        for(var item of this.data)
        {
            sum += item.EndBalanceExpenditureGood;
        }
        }
        return sum.toLocaleString('en-EN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    reset() {
        this.date  = null;
        this.unit = null;
    }

}