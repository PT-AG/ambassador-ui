import {bindable} from 'aurelia-framework'
const VbLoader = require('../../../../loader/vb-realization-expenditure-loader');

export class Item {

    constructor() {
    }

    activate(context) {
        this.data = context.data
        console.log(context.options)
        this.options = context.options;
        this.isShowing = false;
        if(this.data){
            this.selectedVB = {
                DocumentNo: this.data.DocumentNo,
                Amount: this.data.Amount,
                CurrencyCode: this.data.CurrencyCode,
                SuppliantUnitName: this.data.SuppliantUnitName
            }
        }
        
    }

    toggle() {
        this.isShowing = !this.isShowing;
    }

    onRemove() {
        this.bind();
    }

    get vbLoader() {
        return VbLoader;
    }

    @bindable selectedVB;
    async selectedVBChanged(newValue, oldValue) {
        if(newValue){
            this.data.DocumentNo = newValue.DocumentNo;
            this.data.Amount = newValue.Amount;
            this.data.CurrencyCode = newValue.CurrencyCode;
            this.data.UnitName = newValue.SuppliantUnitName;
            this.data.CompletedDate = newValue.CompletedDate;
            this.data.VBId = newValue.Id;
        }
        else{
            this.data.DocumentNo = null;
            this.data.Amount = 0;
            this.data.CurrencyCode = null;
            this.data.UnitName = null;
            this.data.CompletedDate = null;
            this.data.VBId = null;
        }
    }
}
