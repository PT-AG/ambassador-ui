import { inject, bindable, computedFrom,BindingEngine } from 'aurelia-framework';
import moment from "moment";

@inject(BindingEngine)
export class DataForm {
  @bindable title;
  @bindable readOnly;
  @bindable tipe;

  tipeitems= ['','IN','OUT'] 

  constructor(service,bindingEngine) {
    this.bindingEngine = bindingEngine;
    this.service = service;

    this.formOptions = {
        cancelText: "Kembali",
        saveText: "Simpan",
    };
  }

  controlOptions = {
    label: {
        align: "right",
        length: 4
    },
    control: {
        length: 5,

    }
  }

//   columns= [
//     "Warna",
//     "Quantity",
//     "Rack",
//     "Level",
//     "Box",
//     "Area",
// ];

  bind(context) {
   
    this.context = context;
    this.data = this.context.data;
    
    const productName =
      this.data && this.data.ProductName
        ? this.data.ProductName.trim().toUpperCase()
        : "";
    this.isFabric = productName === "FABRIC";
    this.isInterliningOrTricot =
      productName.startsWith("INTERLINING") || productName.startsWith("TRICOT");
    this.isWidth = this.isFabric || this.isInterliningOrTricot;

    if (this.isWidth) {
      this.columns = [
        "Warna",
        "Lebar",
        "Quantity",
        "Lot",
        "Batch",
        "No Package",
        "Handling Unit",
        "Rack",
        "Level",
        "Box",
        "Area",
      ];
    } else {
      this.columns = [
        "Warna",
        "Quantity",
        "Batch",
        "No Package",
        "Handling Unit",
        "Rack",
        "Level",
        "Box",
        "Area",
      ];
    }

    //binding Items from header
    this.data.Items=[];
    if(this.data)
    {
      var item ={};
      item.ProductName = this.data.ProductName;
      item.Rack = this.data.Rack;
      item.Box = this.data.Box;
      item.Colour = this.data.Colour;
      item.Level = this.data.Level;
      item.Area = this.data.Area;
      item.Quantity = this.data.RemainingQuantity;
      item.Lot = this.data.Lot;
      item.Width = this.data.Width;

      item.Batch = this.data.Batch
        ? moment.parseZone(this.data.Batch)
            .utcOffset(7)
            .format("YYYY-MM-DD")
        : moment.parseZone(new Date())
            .utcOffset(7)
            .format("YYYY-MM-DD");

      item.HandlingUnitId = this.data.HandlingUnitId;
      item.HandlingUnit = this.data.HandlingUnit;
      item.PackageNo = this.data.PackageNo;

      this.data.Items.push(item);
    }

    // console.log("data",this.data);
    this.error = this.context.error;

    this.cancelCallback = this.context.cancelCallback;
    this.saveCallback = this.context.saveCallback;

    this.isItems=true;

    this.itemOptions = {
      datas : this.data,
      isCreate: this.context.isCreate,
      isView: this.context.isView,
      checkedAll: this.context.isCreate == true ? false : true,
      isEdit: this.data.isEdit,
      colour: this.data.DesignColor,
      isSplitted: Boolean(this.data && (this.data.IsSplitted || this.data.isSplitted))
    };

    // console.log("option",this.itemOptions);
  }

  @computedFrom("data.IsSplitted", "data.isSplitted")
  get isSplitted() {
    return Boolean(this.data && (this.data.IsSplitted || this.data.isSplitted));
  }

  get addItems() {
    if (this.isSplitted) {
      return null;
    }
    return (event) => {
      const lastItem = this.data.Items && this.data.Items.length > 0
        ? this.data.Items[this.data.Items.length - 1]
        : null;

      if (lastItem) {

        this.data.Items.push({
          ProductName: lastItem.ProductName,
          Colour: lastItem.Colour,
          Quantity: 0,
          Lot: lastItem.Lot,
          Width: lastItem.Width,
          Batch: lastItem.Batch
            ? moment.parseZone(lastItem.Batch).utcOffset(7).format("YYYY-MM-DD")
            : null,
          NoPackage: lastItem.NoPackage,
          HandlingUnitId: lastItem.HandlingUnitId,
          HandlingUnit: lastItem.HandlingUnit,
          Rack: lastItem.Rack,
          Level: lastItem.Level,
          Box: lastItem.Box,
          Area: lastItem.Area
        });

      } else {

        this.data.Items.push({
          ProductName: this.data.ProductName,
          Colour: this.data.Colour,
          Quantity: 0,
          Lot: this.data.Lot,
          Width: this.data.Width,
          Batch: this.data.Batch
            ? moment.parseZone(this.data.Batch).utcOffset(7).format("YYYY-MM-DD")
            : null,
          NoPackage: this.data.NoPackage,
          HandlingUnitId: this.data.HandlingUnitId,
          HandlingUnit: this.data.HandlingUnit,
          Rack: this.data.Rack,
          Level: this.data.Level,
          Box: this.data.Box,
          Area: this.data.Area
        });
      }
    };
  }

  get removeItems() {
    if (this.isSplitted) {
      return null;
    }
    return (event) => {
      this.error = null;
    };
  }

} 
