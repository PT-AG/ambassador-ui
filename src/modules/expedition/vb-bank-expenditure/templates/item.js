import {bindable} from 'aurelia-framework'
const VbLoader = require('../../../../loader/vb-realization-expenditure-loader');

export class Item {

    constructor() {
    }

    activate(context) {
        this.data = context.data;
        
        this.options = context.options;
        this.isShowing = false;
        if(this.data){
            this.data.vbtypeVal=this.data.VBType == 1 ? "Dengan PO" : "Non PO";
            this.data.Unit = {
                    Name : this.data.UnitName,
                    Id : this.data.UnitId,
                };
            this.data.Division = {
                    Id: this.data.DivisionId,
                    Name: this.data.DivisionName,
                };
            this.selectedVB = {
                VBId: this.data.VBId,
                VBRealizationDate: this.data.VBRealizationDate,
                VBRealizationNo: this.data.VBRealizationNo,
                Amount: this.data.Amount,
                CurrencyCode: this.data.CurrencyCode,
                CurrencyRate: this.data.CurrencyRate,
                VBType: this.data.VBType,
                vbtypeVal: this.data.vbtypeVal,
                Unit:{
                    Name : this.data.UnitName,
                    Id : this.data.UnitId,
                },

                Division: {
                    Id: this.data.DivisionId,
                    Name: this.data.DivisionName,
                },

                VBRequestName: this.data.VBRequestName,
                VBAmount: this.data.VBAmount,
                VBRealizationAmount: this.data.VBRealizationAmount,
                VBRealizationId: this.data.VBRealizationId
            };
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
            this.data.VBId= newValue.VBId;
            this.data.VBRealizationDate = newValue.VBRealizationDate;
            this.data.VBRealizationNo = newValue.VBRealizationNo;
            this.data.Amount = newValue.Amount;
            this.data.CurrencyCode = newValue.CurrencyCode;
            this.data.CurrencyRate = newValue.CurrencyRate;
            this.data.VBType = newValue.VBType;
            this.data.vbtypeVal=newValue.VBType == 1 ? "Dengan PO" : "Non PO";
            this.data.Unit = {};
            this.data.Unit.Id = newValue.UnitId;
            this.data.Unit.Name = newValue.UnitName;
            this.data.Division = {};
            this.data.Division.Id = newValue.DivisionId;
            this.data.Division.Name = newValue.DivisionName;
            this.data.VBRequestName = newValue.VBRequestName;
            this.data.VBAmount = newValue.VBAmount;
            this.data.VBRealizationAmount = newValue.VBRealizationAmount;
            this.data.VBRealizationId = newValue.VBRealizationId;
        }
        else{
            this.data.VBRealizationNo = null;
            this.data.Amount = 0;
            this.data.CurrencyCode = null;
            this.data.Unit = null;
            this.data.CompletedDate = null;
            this.data.VBId = null;
            this.data.Division = null;
            this.data.VBRequestName = null;
            this.data.VBAmount = 0;
            this.data.VBRealizationAmount = 0;
            this.data.VBType = null;
            this.data.vbtypeVal = null;
        }
    }
}
