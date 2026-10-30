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
        const encoded = Base64Helper.encode(this.data.Id);
        this.router.navigateToRoute('view', { id: encoded });
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

            const otherExpense = (this.typingOtherExpense !== null && this.typingOtherExpense !== undefined)
                ? this.typingOtherExpense
                : (Number(this.data && this.data.OtherExpense) || 0);

            const args = {
                Id: this.data.Id,
                Items: this.data.Items,
                Bank: this.selectedBank,
                Currency: this.currency,
                Amount: this.data.Amount,
                OtherExpense: otherExpense,
                Date: this.data.Date,
                BGCheckNo: this.data.BGCheckNo,
            };
            this.service.update(args)
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
        this.error = {};
        this.typingOtherExpense = null;
    }

    parseExpenseInput(val) {
        if (!val || typeof val !== "string") return 0;
        let trimmed = val.trim();
        if (trimmed === "" || trimmed === "-") return 0;

        if (trimmed.includes(",") && trimmed.includes(".")) {
            let lastComma = trimmed.lastIndexOf(",");
            let lastDot = trimmed.lastIndexOf(".");
            if (lastDot > lastComma) {
                trimmed = trimmed.replace(/,/g, "");
            } else {
                trimmed = trimmed.replace(/\./g, "").replace(",", ".");
            }
        } else if (trimmed.includes(",")) {
            let parts = trimmed.split(",");
            if (parts.length === 2 && parts[1].length !== 3) {
                trimmed = trimmed.replace(",", ".");
            } else {
                trimmed = trimmed.replace(/,/g, "");
            }
        } else if (trimmed.includes(".")) {
            let parts = trimmed.split(".");
            if (parts.length > 2) {
                trimmed = trimmed.replace(/\./g, "");
            }
        }

        let num = parseFloat(trimmed);
        return isNaN(num) ? 0 : num;
    }

    onOtherExpenseFocus(event) {
        if (event && event.target && typeof event.target.select === "function") {
            event.target.select();
        }
    }

    onOtherExpenseInput(event) {
        if (event && event.target) {
            let val = event.target.value;
            this.typingOtherExpense = this.parseExpenseInput(val);
        }
    }

    onOtherExpenseBlur(event) {
        if (event && event.target) {
            let val = event.target.value;
            this.typingOtherExpense = this.parseExpenseInput(val);
        }
        let finalVal = (this.typingOtherExpense !== null && this.typingOtherExpense !== undefined)
            ? this.typingOtherExpense
            : (Number(this.data && this.data.OtherExpense) || 0);

        this.data.OtherExpense = finalVal;
        this.typingOtherExpense = null;
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

    get grandTotal() {
        let result = 0;
        if (this.data && this.data.Items && this.data.Items.length > 0) {
            for (let detail of this.data.Items) {
                if (detail.VBRealizationAmount) {
                    result += Number(detail.VBRealizationAmount) || 0;
                }
            }
        }
        let other = (this.typingOtherExpense !== null && this.typingOtherExpense !== undefined)
            ? this.typingOtherExpense
            : (Number(this.data && this.data.OtherExpense) || 0);
        result += other;
        this.data.GrandTotal = result;
        return result;
    }

    get currencyCode() {
        return (this.currency && (this.currency.Code || this.currency.code)) ||
               (this.selectedBank && this.selectedBank.Currency && this.selectedBank.Currency.Code) || "";
    }
}
