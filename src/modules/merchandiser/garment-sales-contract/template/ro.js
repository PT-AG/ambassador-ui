import {inject, computedFrom} from 'aurelia-framework';
import {bindable} from 'aurelia-framework'
import {Service} from '../service';

//import CCLoader from "../../../../loader/cost-calculation-garment-loader";

@inject(Service)
export class ROItem {

    ROList = [];

    constructor(service) {
        this.service = service;
    }

    activate(item) {
        this.data = item.data;
        this.error = item.error;
        this.options = item.options;
        this.ROList = item.context.options.ROList;
        this.buyer = this.data.buyer;

        if(this.data.CostCalculationId){
            this.selectedRO = {
                RO_Number: this.data.RONumber
            }
            this.data.comodity = this.data.ComodityCode + " - " + this.data.ComodityName;
        }
    }

    controlOption = {
        control: {
            length: 12
        }
    }

    get filterCostCalculationGarment() {
        return {
            "IsPosted": true,
            "SCGarmentId": null,
            "IsApprovedKadivMD":true,
            "BuyerBrandId":this.buyer
        }
    }

    // get roLoader() {
    //     return CCLoader;
    // }

    get roLoader() {

        return async (keyword) => {
			var info = {
				keyword: keyword,
				filter: JSON.stringify({ 
                    "IsPosted": true,
                    "SCGarmentId": null,
                    "IsApprovedKadivMD":true,
                    "BuyerBrandId":this.buyer 
                }),
                size : 10
			};

			return this.service.getROLoader(info).then((result) => {
                return result.data.filter(x => !this.ROList.includes(x.RO_Number));
            });
        }
    }
    
    roView(cc) {
        return `${cc.RO_Number}` ;
    }

    @bindable selectedRO;
    async selectedROChanged(newValue, oldValue) {
        //this.data.Buyer = newValue;
        if(oldValue && newValue)
            if(newValue.RO_Number != oldValue.RO_Number) {
                
                this.ROList.splice(this.ROList.indexOf(oldValue.RO_Number), 1);

                this.selectedRO=null;
                this.data.RONumber="";
                this.data.Quantity=0;
                this.data.Article="";
                this.data.ComodityId="";
                this.data.ComodityName="";
                this.data.ComodityCode="";
                this.data.Uom=null;
                this.data.UomId="";
                this.data.UomUnit="";
                this.data.Price=0;
                this.data.DeliveryDate=null;
                this.data.Items.splice(0);
                this.data.comodity="";
                this.data.buyer="";
                this.data.Amount=0;
            }
        if (newValue) {

            this.selectedRO = newValue;
            this.data.RONumber = newValue.RO_Number;

            this.ROList.push(newValue.RO_Number);

            if(newValue.Id) {
                
                this.data.BuyerBrandCode=newValue.BuyerBrand.Code;
                this.data.Quantity=newValue.Quantity;
                this.data.Article=newValue.Article;
                this.data.ComodityId=newValue.Comodity.Id;
                this.data.CostCalculationId=newValue.Id;
                this.data.ComodityName=newValue.Comodity.Name;
                this.data.ComodityCode=newValue.Comodity.Code;
                this.data.comodity=this.data.ComodityCode + " - " +this.data.ComodityName;
                this.data.buyer=this.data.BuyerBrandCode + " - " + this.data.BuyerBrandName;
                this.data.Uom=newValue.UOM;
                this.data.UomId=newValue.UOM.Id;
                this.data.UomUnit=newValue.UOM.Unit;
                this.data.Price=newValue.ConfirmPrice.toLocaleString('en-EN', { minimumFractionDigits: 2});
                this.data.DeliveryDate=newValue.DeliveryDate;
                if(this.data.Items.length==0){
                    this.data.Amount=parseFloat(this.data.Quantity*parseFloat(newValue.ConfirmPrice))//.toLocaleString('en-EN', { minimumFractionDigits: 2});
                }
            }
        } 
        else {

            this.ROList.splice(this.ROList.indexOf(oldValue.RO_Number), 1);

            this.selectedRO=null;
            this.data.RONumber="";
            this.data.Quantity=0;
            this.data.Article="";
            this.data.ComodityId="";
            this.data.ComodityName="";
            this.data.ComodityCode="";
            this.data.Uom=null;
            this.data.UomId="";
            this.data.UomUnit="";
            this.data.DeliveryDate=null;
            this.data.Price=0;
            this.data.Items.splice(0);
            this.data.comodity="";
            this.data.Amount=0;
        }
    }

    PriceChanged(e){
        this.data.Price=parseFloat(e.srcElement.value).toLocaleString('en-EN', { minimumFractionDigits: 4});
    
        this.data.Amount=parseFloat(this.data.Quantity*parseFloat(e.srcElement.value))//.toLocaleString('en-EN', { minimumFractionDigits: 2});
        
    }

    get detailHeader() {
        return [{ header: "Keterangan" }, { header: "Quantity" }, { header: "Harga" }];
    }

    async itemsChanged(e){
        this.hasItems=true;
        this.data.Price=0;
        this.data.Amount=0;
        if(this.data.Items){
            for(var item of this.data.Items){
                if(item.Price && item.Quantity){
                    this.data.Amount+=item.Price*item.Quantity;
                }
            }
            //this.data.Amount=parseFloat(this.data.Amount).toLocaleString('en-EN', { minimumFractionDigits: 2});
            if(this.data.Items.length==0){
                this.hasItems=false;
                var price= await this.service.getCostCalById(this.data.CostCalculationId);
                this.data.Price=parseFloat(price.ConfirmPrice).toLocaleString('en-EN', { minimumFractionDigits: 2});
                this.data.Amount=parseFloat(this.data.Quantity*parseFloat(price.ConfirmPrice))//.toLocaleString('en-EN', { minimumFractionDigits: 2});
            }
        }
    }

    get  removeItems() {
        return async (event) => //console.log(event.detail);
        {
            if(this.data.Items){
                this.data.Amount=0;
                for(var item of this.data.Items){
                    if(item.Price && item.Quantity){
                    this.data.Amount+=item.Price*item.Quantity;
                }
                }
                //this.data.Amount=parseFloat(this.data.Amount).toLocaleString('en-EN', { minimumFractionDigits: 2});
            }
            if(this.data.Items.length==0){
                this.hasItems=false;
                var price= await this.service.getCostCalById(this.data.CostCalculationId);
                this.data.Price=await price.ConfirmPrice;
                this.data.Amount=parseFloat(this.data.Quantity*parseFloat(this.data.Price))//.toLocaleString('en-EN', { minimumFractionDigits: 2});
                this.data.Price=price.ConfirmPrice.toLocaleString('en-EN', { minimumFractionDigits: 2});
            
            }
        }
    }

    itemsInfo = {
        onAdd: function () {
            this.data.Items.push({
                Uom: this.data.Uom,
                Description: '',
                Price: 0,
                Quantity: 0,
                PricePerUnit: this.data.Uom
            });
        }.bind(this)
    }

}
