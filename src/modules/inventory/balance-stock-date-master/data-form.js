import {inject, bindable, computedFrom} from 'aurelia-framework';
const BalanceDateLoader = require('../../../loader/garment-balance-stock-date-master-loader');
import { Service } from "./service";
import { Router } from 'aurelia-router';
var moment = require("moment");

@inject(Router, Service)
export class DataForm {
    @bindable _date;
    @bindable readOnly;
    @bindable balanceStockDate;
    @bindable counter=0;
    formOptions = {
        cancelText: "Kembali",
        saveText: "Simpan",
        deleteText: "Hapus",
        editText: "Ubah",
    }

      constructor(router, service) {
        this.service = service;
    }

    @computedFrom("data.id")
    get isEdit() {
        return (this.data.Id || '').toString() != '';
    }
     
   
    async bind(context) {
    this.context = context;
    this.data = this.context.data;
    this.error = this.context.error;

    this.cancelCallback = this.context.cancelCallback;
    this.deleteCallback = this.context.deleteCallback;
    this.editCallback = this.context.editCallback;
    this.saveCallback = this.context.saveCallback;
    this.data.BalanceStockDate= this.balanceDateLoader;
    
    var arg = {
      size: 1,
      order: {}
    }

    this.service.search(arg)
      .then(result => {
       for(var a of result.data)
       {
            this.data.BalanceStockDate =moment(a.BalanceStockDate).format("YYYY-MM-DD");
            this._date= moment(a.BalanceStockDate).format("YYYY-MM-DD");
            this.balanceStockDate =moment(a.BalanceStockDate).format("YYYY-MM-DD");
       }
        return {
          total: result.info.total,
          data: result.data
          
        }
      });
    }
    

    balanceStockDateChanged(e) {
        this.counter +=1;
        var _newDate = new Date(e);
       
        if (moment(_newDate).format("YYYY-MM-DD") < this._date && moment(_newDate).format("YYYY-MM-DD") != '1970-01-01') {
           alert('Tanggal tidak boleh lebih kecil dari tanggal Stock Opname sebelummya!');
           this.balanceStockDate =null;
           this.data.BalanceStockDate=null;
        }else if (moment(_newDate).format("YYYY-MM-DD") == this._date && moment(_newDate).format("YYYY-MM-DD") != '1970-01-01' && this.counter > 1) {
            alert('Tanggal tidak boleh sama dengan tanggal Stock Opname sebelummya!');
            this.balanceStockDate =null;
            this.data.BalanceStockDate=null;
         }
        else
        {
            this.data.BalanceStockDate =moment(_newDate).format("YYYY-MM-DD");
        }
    }
}
