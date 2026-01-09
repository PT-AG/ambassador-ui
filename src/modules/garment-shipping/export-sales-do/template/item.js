import { inject, bindable, computedFrom } from 'aurelia-framework'
import { Service,SalesService } from "../service";

@inject(Service,SalesService)
export class items {
    //@bindable selectedRO;
    @bindable selectedUom;
    @bindable selectedComodity;
    
    // comodityView = (comodity) => {
    //     return `${comodity.Code || comodity.code} - ${comodity.Name || comodity.name}`;
    // }

    // uomView = (uom) => {
    //     return uom.Unit || uom.unit;
    // }

    // roView = (ro) => {
    //     return `${ro.RO_Number}`;
    //}
    
    constructor(service,salesService) {
        this.service = service;
        this.salesService = salesService;
    }

    async activate(context) {
        this.context = context;
        this.data = context.data;
        this.error = context.error;
        this.options = context.options;
        this.readOnly = this.options.readOnly;
        this.isCreate = context.context.options.isCreate;
        this.isEdit = context.context.options.isEdit;
        this.data.cartonQuantity=0;
        this.data.grossWeight=0;
        this.data.nettWeight=0;
        this.data.volume=0;
        if(this.data.roNo) {
            // this.selectedComodity = {
            //     Id : this.data.comodity.Id || this.data.comodity.id,
            //     Code : this.data.comodity.Code || this.data.comodity.code,
            //     Name : this.data.comodity.Name || this.data.comodity.name
            // };      

            // this.selectedUom = {
            //     Unit : this.data.uom.Unit || this.data.uom.unit,
            //     Id : this.data.uom.Id || this.data.uom.id
            // };

            this.selectedComodity = `${this.data.comodity.Code || this.data.comodity.code} - ${this.data.comodity.Name || this.data.comodity.name}`;
            this.selectedUom = this.data.uom.Unit || this.data.uom.unit;
        }
    }

    // get filter() {
    //     var filter = {};
    //     filter = {
    //         BuyerCode: this.data.BuyerCodeFilter,
    //         "SCGarmentId!=null": true
    //     };
    //     return filter;
    // }

    // selectedROChanged(newValue) {
    //     if (newValue) {
    //         this.salesService.getCostCalculationById(newValue.Id)
    //             .then(result => {
    //                 this.data.roNo = result.RO_Number;
    //                 this.data.article = result.Article;
    //                 this.data.buyerBrand = result.BuyerBrand;
    //                 this.data.unit = result.Unit;

    //                 this.data.uom = result.UOM;
    //                 this.data.quantity = result.Quantity;
    //                 this.data.comodity = result.Comodity;
    //             });
    //     }
    // }
}