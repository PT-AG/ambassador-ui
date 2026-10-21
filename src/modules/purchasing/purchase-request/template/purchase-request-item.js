import {bindable} from 'aurelia-framework'
import moment from 'moment';
var ProductLoader = require('../../../../loader/product-purchasing-null-tags-loader');

export class PurchaseRequestItem {
  @bindable dataProduct;

  activate(context) {
    this.context = context;
    this.data = context.data;
    this.error = context.error;
    this.options = context.options; 
    this.collectionOptions = (context.context && context.context.options) || {};

    if (!this.data.productId) {
      this.data.productId = {};
    }
    if (this.data.product) {
      this.dataProduct = this.data.product;
    }
    if(this.data.quantity){
      this.data.quantity=this.data.quantity.toLocaleString('en-EN', { minimumFractionDigits: 2 });
    }

    if (this.data.isShowing === undefined) {
      this.data.isShowing = false;
    }

    const allStatusDetails = (this.collectionOptions && this.collectionOptions.statusDetails) || [];
    const itemId = this.data._id || this.data.Id;
    const productCode = (this.data.product && this.data.product.code) || null;

    this.statusDetails = allStatusDetails
      .filter(detail => (itemId && detail.purchaseRequestItemId == itemId) || (productCode && detail.productCode == productCode))
      .map(detail => ({
        purchaseRequestDate: this.formatDate(detail.purchaseRequestDate),
        internalPurchaseOrderDate: this.formatDate(detail.internalPurchaseOrderDate),
        externalPurchaseOrderDate: this.formatDate(detail.externalPurchaseOrderDate),
        deliveryOrderDate: this.formatDate(detail.deliveryOrderDate),
        unitReceiptNoteDate: this.formatDate(detail.unitReceiptNoteDate)
      }));
  }

  formatDate(value) {
    return value ? moment(value).format("DD MMM YYYY") : "-";
  }

  get productLoader() {
    return ProductLoader;
  }

  dataProductChanged(newValue) {
    this.data.product = newValue;
    if (this.data.product) {
      this.data.productId = this.data.product.Id || {};
      this.data.product._id = this.data.productId;
      this.data.product.uom = {
        _id: this.data.product.UOM.Id,
        unit: this.data.product.UOM.Unit
      };
      delete this.data.product.UOM._id;
    }
  }

  controlOptions = {
    control: {
      length: 12
    }
  };
}