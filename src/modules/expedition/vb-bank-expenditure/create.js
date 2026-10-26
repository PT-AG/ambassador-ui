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
        "No Realisasi","Tanggal Realisasi VB","Tipe VB", "Pemohon VB", "Bagian/Unit","Nominal Realisasi","Mata Uang","Keterangan"
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
        if (this.isSaving) return;

        if (this.data.Items && this.data.Items.length > 0) {
            this.data.Amount = 0;
            for(var v of this.data.Items){
                this.data.Amount += v.VBRealizationAmount;
            }
            if(!this.selectedBank){
                alert("harap pilih bank");
                return;
            }

            this.isSaving = true;

            const args = {
            ListIds: this.data.Items.map((d) => {
                return {
                    VBRequestId: d.VBRequestDocumentId,
                    VBRealizationId: d.VBId,
                };
            }),
            Items: this.data.Items,
            Bank: this.selectedBank,
            Currency: this.currency,
            Amount: this.data.Amount,
            OtherExpense: this.data.OtherExpense,
            Date: this.data.Date,
            BGCheckNo: this.data.BGCheckNo,
            };
            this.service.post(args)
            .then(result => {
                this.isSaving = false;
                alert("Data berhasil dibuat");
                this.router.navigateToRoute("list");
            })
            .catch(e => {
                this.isSaving = false;
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
        this.data = { Items: [] };
        this.error = {};
    }

    @bindable currency;
    async currencyChanged(newValue, oldValue) {
        this.data.Currency = newValue;
        if (this.selectedBank.Currency.Code == "IDR" && this.currencyCodeValue != "IDR" && this.currencyCodeValue != null && !this.readOnly) {
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

    get grandTotal() {
        let result = 0;
        if (this.data.Items && this.data.Items.length > 0) {
            for (let detail of this.data.Items) {
                if (detail.VBRealizationAmount) {
                    result += detail.VBRealizationAmount;
                }

            }
        }
        // console.log(result);
        this.data.GrandTotal = result;
        return result;
    }
}
