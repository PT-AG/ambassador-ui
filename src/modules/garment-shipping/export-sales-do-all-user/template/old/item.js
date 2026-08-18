// import { inject, bindable, computedFrom } from 'aurelia-framework'
// import { Service,SalesService } from "../service";

// const ComodityLoader = require('../../../../loader/garment-comodities-loader');
// const UomLoader = require('../../../../loader/uom-loader');
// var CostCalculationLoader = require("../../../../loader/cost-calculation-garment-loader");

// @inject(Service,SalesService)
// export class items {
//     @bindable selectedRO;

//     get comodityLoader() {
//         return ComodityLoader;
//     }

//     get roLoader() {
//         return CostCalculationLoader;
//     }
    
//     comodityView = (comodity) => {
//         return `${comodity.Code || comodity.code} - ${comodity.Name || comodity.name}`;
//     }

//     get uomLoader() {
//         return UomLoader;
//     }

//     uomView = (uom) => {
//         return uom.Unit || uom.unit;
//     }

    
//     constructor(service,salesService) {
//         this.service = service;
//         this.salesService = salesService;
//     }

//     async activate(context) {
//         this.context = context;
//         this.data = context.data;
//         this.error = context.error;
//         this.options = context.options;
//         this.readOnly = this.options.readOnly;
//         this.isCreate = context.context.options.isCreate;
//         this.isEdit = context.context.options.isEdit;
//         this.data.cartonQuantity=0;
//         this.data.grossWeight=0;
//         this.data.nettWeight=0;
//         this.data.volume=0;
//         if(this.data.roNo){
//             this.selectedRO={
//                 RO_Number:this.data.roNo
//             }
//         }
//     }

//     get filter() {
//         var filter = {};
//         filter = {
//             BuyerCode: this.data.BuyerCodeFilter,
//             "SCGarmentId!=null": true
//         };
//         return filter;
//     }

//     roView = (ro) => {
//         return `${ro.RO_Number}`;
//     }

//     selectedROChanged(newValue) {
//         if (newValue) {
//             this.salesService.getCostCalculationById(newValue.Id)
//                 .then(result => {
//                     this.data.roNo = result.RO_Number;
//                     this.data.article = result.Article;
//                     this.data.buyerBrand = result.BuyerBrand;
//                     this.data.unit = result.Unit;

//                     this.data.uom = result.UOM;
//                     this.data.quantity = result.Quantity;
//                     this.data.comodity = result.Comodity;
//                 });
//         }
//     }
// }