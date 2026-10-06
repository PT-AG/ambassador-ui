import { inject, Lazy,bindable } from "aurelia-framework";
import { Router } from "aurelia-router";
import { Service } from "./service";

const BankLoader= require('../../../loader/account-banks-loader');
const CurrencyLoader = require('../../../loader/garment-currencies-by-latest-date-loader');

@inject( Router, Service )
export class Create {
    
  
    get bankLoader() {
        return BankLoader;
    }
    
    get currencyLoader() {
        return CurrencyLoader;
    }
    columns2 = [
        "No Realisasi","Tanggal Terima Kasir","Unit Pemohon","Nominal Realisasi","Mata Uang"
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

    }

    cancelCallback(event) {
        this.router.navigateToRoute("list");
    }

    saveCallback(event) {
        if (this.data.Items && this.data.Items.length > 0) {
            this.data.Amount = 0;
            for(var v of this.data.Items){
                this.data.Amount += v.Amount;
            }
            if(!this.selectedBank){
                alert("harap pilih bank");
                return;
            }

            const args = {
            ListIds: this.data.Items.map((d) => {
                return {
                    VBRequestId: d.VBRequestDocumentId,
                    VBRealizationId: d.VBId,
                };
            }),
            Bank: this.selectedBank,
            Currency: this.currency,
            Amount: this.data.Amount,
            OtherExpense: this.data.OtherExpense,
            Date: this.data.Date,
            BGCheckNumber: this.data.BGCheckNumber,
            };
            this.service
            .post(args)
            .then(() => {
                alert("Data berhasil dibuat");
                this.router.navigateToRoute(
                    "create",
                    {},
                    { replace: true, trigger: true }
                );
            })
            .catch((e) => {
                this.error = e;
            });
        } else {
            alert("harap pilih data");
        }
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
}
