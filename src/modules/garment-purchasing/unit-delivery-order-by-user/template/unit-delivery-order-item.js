import { inject, BindingEngine, computedFrom } from 'aurelia-framework'
import { Service } from "../service";
var UomLoader = require('../../../../loader/uom-loader');
@inject(BindingEngine,Service)
export class UnitDeliveryOrderItem {

  fabricOptions = ['NON FABRIC', 'MAIN FABRIC', 'CONTRASS', 'INTERLINING', 'LINING', 'PIPING', 'SLEEK', 'FRONTING', 'FELT', 'RIB'];
  async activate(context) {
    this.context = context;
    this.data = context.data;
    this.error = context.error;
    this.options = context.options;

    this.readOnly = this.options.readOnly || this.data.IsDisabled;
    this.isEdit = context.context.options.isEdit;

    // if( this.data.Id){
    //   var filter= JSON.stringify({RONo:this.data.RONo});
    //       var info = {
    //         filter: filter
    //       };
    //   var epo=await this.service.getGarmentEPOByRONo(info);
      
    //   const item = epo.data.find(a => a.Id === this.data.EPOItemId);
    //   this.data.Remark = item ? item.Remark : "";
    // }
  }

  constructor(bindingEngine, service) {
    this.bindingEngine = bindingEngine;
    this.service = service;
  }

  bind() {

  }

  @computedFrom("options.readOnly", "isEdit")
  get isDefaultDOAppear() {
    return this.options.readOnly || this.isEdit;
  }

  fabricChanged(e) {
    var selectedFabric = e.srcElement.value;
    if (selectedFabric) {
      this.data.FabricType = selectedFabric;
    } else {
      this.data.FabricType = null;;
    }
  }

  changeCheckBox() {
    this.context.context.options.checkedAll = this.context.context.items.filter(item => item.data.IsDisabled === false).reduce((acc, curr) => acc && curr.data.IsSave, true);
  }

  productChanged(newValue) {
    var selectedProduct = newValue;
    if (selectedProduct) {
      this.data.Product.Id = selectedProduct.ProductId;
      this.data.Product.Name = selectedProduct.ProductName;
      this.data.Product.Code = selectedProduct.ProductCode;
      this.data.Product.Remark = selectedProduct.ProductRemark;
    } else {
      this.data.Product = null;
    }
  }

  get uomLoader() {
    return UomLoader;
  }

  uomView = (uom) => {
    return uom.Unit
  }

  get product() {
    return this.data.Product.Name;
  }

  controlOptions = {
    control: {
      length: 12
    }
  };
}