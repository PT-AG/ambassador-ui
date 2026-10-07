import { inject, Lazy,bindable } from "aurelia-framework";
import { Router } from "aurelia-router";
import { Service } from "./service";
import { Base64Helper } from "../../../utils/base-64-coded-helper";

const BankLoader= require('../../../loader/account-banks-loader');
const CurrencyLoader = require('../../../loader/garment-currencies-by-latest-date-loader');

@inject( Router, Service )
export class Edit {
    
  
    get bankLoader() {
        return BankLoader;
    }
    
    get currencyLoader() {
        return CurrencyLoader;
    }
    columns2 = [
        "No Realisasi","Tanggal Realisasi VB","Tipe VB", "Pemohon VB", "Bagian/Unit","Nominal Realisasi","Mata Uang"
    ];

    bankView = (bank) => {
        return bank.BankName + " " + bank.Currency.Code + " - " + bank.AccountNumber
    }
    
    tableOptions = {
        pagination: false,
        showColumns: false,
        search: false,
        showToggle: false,
    };

    formOptions = {
        cancelText: "Kembali",
        saveText: "Simpan",
    };

    controlOptions = {
        label: {
            length: 4,
        },
        control: {
            length: 4,
        },
    };

    constructor( router, service ) {
        this.router = router;
        this.service = service;
        this.data = {};
    }

    cancelCallback(event) {
        this.router.navigateToRoute("list");
    }

    saveCallback(event) {
        if (this.data.Items && this.data.Items.length > 0) {
            this.data.Amount = 0;
            for(var v of this.data.Items){
                this.data.Amount += v.VBRealizationAmount;
            }
            if(!this.selectedBank){
                alert("harap pilih bank");
                return;
            }

            const args = {
                Id: this.data.Id,
                Items: this.data.Items,
                Bank: this.selectedBank,
                Currency: this.currency,
                Amount: this.data.Amount,
                OtherExpense: this.data.OtherExpense,
                Date: this.data.Date,
                BGCheckNo: this.data.BGCheckNo,
            };
            this.service.update(args)
            .then(result => {
                alert("Data berhasil dibuat");
                this.router.navigateToRoute("list");
            })
            .catch(e => {
                this.error = e;
                if (typeof (this.error) == "string") {
                    alert(this.error);
                } else {
                    alert("Missing Some Data");
                }
            })
        } else {
            alert("harap pilih data");
        }
    }

    bind() {
        this.error = {};
    }

    @bindable currency;
    async currencyChanged(newValue, oldValue) {
        this.data.Currency = newValue;
        if (this.bankCurrency == "IDR" && this.currencyCodeValue != "IDR" && this.currencyCodeValue != null && !this.readOnly) {
            this.sameCurrency = false;
        }
        else {
            this.sameCurrency = true;
        }
    }

    search() {
        // console.log(this.data);
        this.documentTable.refresh();
    }

    get addItems() {
        return (event) => {
        this.data.Items.push({});
        };
    }

    async activate(params) {
        const decoded = Base64Helper.decode(params.id);
        let id = decoded;
        this.data = await this.service.getById(id);
        if(this.data){
            this.selectedBank = this.data.Bank;
            this.currency = this.data.Currency;

            if(this.data.Bank.Currency.Code==this.currency.Code){
                this.sameCurrency = true;
            }
        }
    }
}
