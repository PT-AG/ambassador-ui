import { bindable } from "aurelia-framework";
const SizeLoader = require('../../../../loader/size-loader');
const ProductLoader = require('../../../../loader/garment-product-loader');

export class SubconDetail {
    @bindable selectedProduct;
    @bindable dataQuantity;

    get sizeLoader() {
        return SizeLoader;
    }

    get productLoader() {
        return ProductLoader;
    }

    activate(context) {
        this.context = context;
        this.data = context.data;
        this.error = context.error;
        this.tradingList = context.context.options.tradingList;
        this.productList = [""];

        for (const productCode in this.tradingList) {
            this.productList.push(productCode);
        }

        if (this.data) {
            this.selectedProduct = this.data.Product.Code;
            this.dataQuantity = this.data.Quantity;
        }
    }

    changeCheckBox() {
        this.context.context.options.checkedAll = this.context.context.items.reduce((acc, curr) => acc && curr.data.IsSave, true);
    }

    selectedProductChanged(newValue) {
        if (newValue) {
            const selectedTrading = this.tradingList[newValue];
            this.data.Product = selectedTrading.Product;
            this.data.DesignColor = selectedTrading.DesignColor;
            this.data.BasicPrice = selectedTrading.BasicPrice;
            this.data.DODetailId = selectedTrading.DODetailId;
        } else {
            this.data.Product = null;
            this.data.DesignColor = null;
            this.data.BasicPrice = 0;
            this.data.DODetailId = 0;
        }
    }

    onRemove() {
        this.bind();
    }

    dataQuantityChanged(newValue) {
        this.data.Quantity = newValue;
        this.data.RemainingQuantity = newValue;
    }
}