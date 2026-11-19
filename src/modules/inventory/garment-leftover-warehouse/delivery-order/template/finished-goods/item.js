import { inject, bindable, computedFrom } from 'aurelia-framework'
import { Service } from "../../service";

const UnitLoader = require('../../../../../../loader/garment-units-loader');

@inject(Service)
export class items {
    @bindable selectedUnit;
    @bindable selectedLeftoverComodity;

    constructor(service) {
        this.service = service;
    }

    async activate(context) {
        this.context = context;
        this.data = context.data;
        this.error = context.error;
        this.options = context.options;

        this.itemList = context.context.options.itemList;
        this.isEdit = context.context.options.isEdit && this.data.Id > 0;

        if (this.data.Unit) {
            this.selectedUnit = this.data.Unit;
        }

        if (this.data.LeftoverComodity) {
            this.selectedLeftoverComodity = {
                LeftoverComodityId: this.data.LeftoverComodity.Id,
                LeftoverComodityName: this.data.LeftoverComodity.Name,
                LeftoverComodityCode: this.data.LeftoverComodity.Code
            } 
        }
        
        if (this.data.Id) {
            var stock = await this.service.searchStock({ size: 1, filter: JSON.stringify({ UnitId: (this.data.Unit || {}).Id, ReferenceType: "FINISHED_GOOD", LeftoverComodityId: (this.data.LeftoverComodity || {}).Id }) });
            if (!this.error)
                this.data.StockQuantity = stock.data[0].Quantity + this.data.Quantity;
        }
    }

    get unitLoader() {
        return UnitLoader;
    }

    get leftoverComodityLoader() {
        return (keyword) => {
            const info = {
                keyword: keyword,
                filter: JSON.stringify(this.leftoverComodityLoaderFilter),
                select: this.leftoverComodityLoaderSelect,
                size: 10
            };

            return this.service.searchStockDistinct(info).then(result => 
                result.data.filter(item => !this.itemList.includes(item.LeftoverComodityCode))
            );
        };
    }

    get leftoverComodityLoaderSelect() {
        return ["LeftoverComodityCode", "LeftoverComodityName", "LeftoverComodityId"];
    }

    @computedFrom("data.LeftoverComodity", "data.Unit")
    get leftoverComodityLoaderFilter() {
        return {
            ReferenceType: "FINISHED_GOOD",
            UnitId: (this.data.Unit || {}).Id || 0,
            "Quantity>0": true,
            RONo: null
        };
    }

    selectedUnitChanged(newValue) {
        this.data.Unit = newValue;
        this.selectedLeftoverComodity = null;
        this.data.StockId = 0;
        this.data.StockQuantity = 0;

        if (this.data.LeftoverComodity != null) 
            this.itemList.splice(this.itemList.indexOf((this.data.LeftoverComodity || {}).Code), 1);

        this.data.LeftoverComodity = null;
    }

    get unitLoader() {
        return UnitLoader;
    }

    unitView = (unit) => {
        return `${unit.Code} - ${unit.Name}`;
    }

    selectedLeftoverComodityChanged(newValue, oldValue) {
        this.data.StockId = 0;
        this.data.StockQuantity = 0;
        this.LeftoverComodity = null;

        if (newValue && oldValue) {
            if (newValue.LeftoverComodityCode != oldValue.LeftoverComodityCode) {
                this.itemList.splice(this.itemList.indexOf(oldValue.LeftoverComodityCode), 1);
                this.selectedLeftoverComodity = null;
                this.data.StockId = 0;
                this.data.StockQuantity = 0;
                this.data.LeftoverComodity = {};
                this.data.Quantity = 0;
                this.data.BasicPrice = 0;
            }
        }

        if (newValue) {
            this.data.LeftoverComodity = {
                Id: newValue.LeftoverComodityId,
                Name: newValue.LeftoverComodityName,
                Code: newValue.LeftoverComodityCode
            }

            this.itemList.push(newValue.LeftoverComodityCode);
            this.selectedLeftoverComodity = newValue;
            this.service.searchStock({ filter: JSON.stringify({ LeftoverComodityId: (this.data.LeftoverComodity || {}).Id, ReferenceType: "FINISHED_GOOD", UnitId: (this.data.Unit || {}).Id || 0, "Quantity > 0": true, RONo: null }) })
                .then(result => {
                    if (result.statusCode == 200 && result.data.length > 0) {
                        this.data.StockId = result.data[0].Id;
                        this.data.StockQuantity = result.data[0].Quantity;
                        this.data.BasicPrice = result.data[0].BasicPrice;
                    }
                });
        } else {
            this.data.StockId = 0;
            this.data.StockQuantity = 0;
            this.data.LeftoverComodity = null;
            this.selectedLeftoverComodity = null;
        }
    }
}