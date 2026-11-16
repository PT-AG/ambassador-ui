import { inject, bindable, containerless, computedFrom, BindingEngine } from 'aurelia-framework'
const UnitLoader = require('../../../../../../loader/garment-units-loader');
const StockLoader = require('../../../../../../loader/garment-leftover-warehouse-stock-distinct-loader');
import { Service } from '../../service';

@inject(Service)
export class Item {
    @bindable selectedUnit;
    @bindable selectedStock;
    @bindable selectedUom;
    @bindable selectedProduct;

    constructor(service) {
        this.service = service;
    }

    activate(context) {
        this.context = context;
        this.data = context.data;
        this.error = context.error;
        this.options = context.options;

        this.itemList = context.context.options.itemList;
        this.isEdit = context.context.options.isEdit && this.data.Id > 0;

        if (this.data.Unit) {
            this.selectedUnit = this.data.Unit;
        }

        if (this.data.Stocks) {
            this.uomItems = [""].concat(this.data.Stocks.map(d => (d.Uom || {}).Unit));
        }
        
        if (this.data.Product) {
            this.selectedProduct = {
                ProductId: this.data.Product.Id,
                ProductName: this.data.Product.Name,
                ProductCode: this.data.Product.Code
            };
        }

        if (this.data.Uom) {
            this.selectedUom = (this.data.Uom || {}).Unit || "";
        } else {
            this.selectedUom = "";
        }
    }

    uomItems = [""];

    get unitLoader() {
        return UnitLoader;
    }

    get productLoader() {
        return (keyword) => {
            const info = {
                keyword: keyword,
                filter: JSON.stringify(this.productLoaderFilter),
                select: this.productLoaderSelect,
                size: 10
            };

            return this.service.searchStockDistinct(info).then(result =>
                result.data.filter(item => !this.itemList.includes(item.ProductCode))
            );
        };
    }

    get productLoaderSelect() {
        return ["ProductCode", "ProductName", "ProductId"];
    }

    @computedFrom("data.Product", "data.Unit")
    get productLoaderFilter() {
        return {
            ReferenceType: "ACCESSORIES",
            UnitId: (this.data.Unit || {}).Id || 0,
            "Quantity > 0": true,
            PONo: null
        };
    }

    selectedUnitChanged(newValue) {
        this.data.Unit = newValue;
        this.selectedProduct = null;
        this.data.Stocks = null;
        this.uomItems = [""];
        this.selectedUom = null;

        if (this.data.Product != null) 
            this.itemList.splice(this.itemList.indexOf((this.data.Product || {}).Code), 1);

        this.data.Product = null;
    }

    selectedProductChanged(newValue, oldValue) {
        this.data.Stocks = null;
        this.uomItems = [""];
        this.selectedUom = null;
        this.Product = null;

        if (newValue && oldValue) {
            if (newValue.ProductCode != oldValue.ProductCode) {
                this.itemList.splice(this.itemList.indexOf(oldValue.ProductCode), 1);
                this.selectedProduct = null;
                this.selectedUom = null;
                this.data.StockId = 0;
                this.data.Stock = {};
                this.data.Product = {};
                this.data.Quantity = 0;
                this.data.BasicPrice = 0;
                this.data.Uom = {};
                this.uomItems = [];
            }
        }

        if (newValue) {
            this.data.Product = {
                Id: newValue.ProductId,
                Name: newValue.ProductName,
                Code: newValue.ProductCode
            };

            this.itemList.push(newValue.ProductCode);
            this.selectedProduct = newValue;
            this.service.searchStock({ filter: JSON.stringify({ ProductId: (this.data.Product || {}).Id || 0, ReferenceType: "ACCESSORIES", UnitId: (this.data.Unit || {}).Id || 0, "Quantity > 0": true }) })
                .then(result => {
                    if (result.statusCode == 200) {
                        const uomUnits = result.data.filter((value, index, self) => self.map(x => x.Uom.Unit).indexOf(value.Uom.Unit) == index);
                        this.data.Stocks = result.data.filter(d => uomUnits.findIndex(u => u == (d.Uom || {}).Unit) < 0);
                        this.uomItems = [""].concat(this.data.Stocks.map(d => (d.Uom || {}).Unit));
                    }
                });
        } else {
            this.itemList.splice(this.itemList.indexOf(oldValue.ProductCode), 1);
            this.selectedProduct = null;
            this.selectedUom = null;
            this.data.StockId = 0;
            this.data.Stock = {};
            this.data.Product = {};
            this.data.Quantity = 0;
            this.data.BasicPrice = 0;
            this.data.Uom = {};
            this.uomItems = [];
        }
    }

    selectedUomChanged(newValue) {
        if (newValue) {
            this.data.Stock = this.data.Stocks.find(d => d.Uom.Unit == newValue);
            if (this.data.Stock) {
                const existingItem = (this.context.context.options.existingItems || []).find(i => i.StockId == this.data.Stock.Id) || { Quantity: 0 };
                this.data.Stock.Quantity += existingItem.Quantity;

                this.data.StockId = this.data.Stock.Id;
                this.data.Quantity = this.data.Stock.Quantity;
                this.data.Uom = this.data.Stock.Uom;
                this.data.BasicPrice = this.data.Stock.BasicPrice;
            }
        } else {
            this.data.Stock = null;
            this.data.StockId = 0;
            this.data.Quantity = 0;
            this.data.Uom = null;
        }
    }
}