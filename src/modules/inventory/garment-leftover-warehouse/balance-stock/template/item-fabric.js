import { inject, bindable, containerless, computedFrom, BindingEngine } from 'aurelia-framework'
import { Service, CoreService,PurchasingService } from '../service';

const UnitLoader = require('../../../../../loader/garment-units-loader');
const POLoader = require('../../../../../loader/garment-external-purchase-orders-item-by-po-serial-number-loader');


@inject(Service, CoreService,PurchasingService)
export class ItemFabric {

    @bindable selectedUnit;
    @bindable selectedPONo;

    constructor(service, coreService,purchasingService) {
        this.service = service;
        this.coreService = coreService;
        this.purchasingService=purchasingService;
    }
    
    async activate(context) {
        this.context = context;
        this.data = context.data;
        this.error = context.error;
        this.options = context.options;

        if (this.data.Uom == null) {
            let uomResult = await this.coreService.getUom({ size: 1, filter: JSON.stringify({ Unit: 'MTR' }) });
            this.data.Uom = {
                Id: uomResult.data[0].Id,
                Unit: uomResult.data[0].Unit
            }
        }

        if (this.data) {
            this.selectedUnit = this.data.Unit;
            this.selectedPONo = this.data.PONo;
        }
    }

    get unitLoader() {
        return UnitLoader;
    }

    get poLoader() {
        return POLoader;
    }

    selectedUnitChanged(newValue) {
        this.data.Unit = null;
        if (newValue) {
            this.data.Unit = {
                Id: newValue.Id,
                Code: newValue.Code,
                Name: newValue.Name
            }
        }
    }

    async selectedPONoChanged(newValue, oldValue) {
        this.data.PONo = null;
        this.data.Product = null;
        this.data.Construction = null;
        this.data.Composition = null;
        this.data.Yarn = null;
        this.data.Width = null;

        if (newValue) {
            this.data.PONo = newValue.PO_SerialNumber;
            this.data.Product = {
                Id: newValue.ProductId,
                Code: newValue.ProductCode,
                Name: newValue.ProductName
            }
            let garmentProductsResult = await this.coreService.getGarmentProducts({ size: 1, filter: JSON.stringify({ Id: this.data.Product.Id }) });
            this.data.Construction = garmentProductsResult.data[0].Const;
            this.data.Composition = garmentProductsResult.data[0].Composition;
            this.data.Yarn = garmentProductsResult.data[0].Yarn;
            this.data.Width = garmentProductsResult.data[0].Width;

            let uenItem= await this.purchasingService.getBasicPrice(this.data.PONo);
            this.data.BasicPrice= uenItem.BasicPrice || 0;
        }
    }

    poView = (po) => {
        return `${po.PO_SerialNumber} - ${po.ProductCode}`;
    }
}