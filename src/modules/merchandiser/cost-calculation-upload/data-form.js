import { Router } from "aurelia-router";
import { inject, bindable, BindingEngine, observable, computedFrom } from 'aurelia-framework';
import { ServiceEffeciency } from './service-efficiency';
import { RateService } from './service-rate';
import { ServiceCore } from './service-core';
import moment from 'moment';
import * as XLSX from 'xlsx';

import numeral from 'numeral';
numeral.defaultFormat("0,0.00");
const rateNumberFormat = "0,0.000";
var PreSalesContractLoader = require('../../../loader/garment-pre-sales-contracts-loader');
var BookingOrderLoader = require('../../../loader/garment-booking-order-by-no-for-ccg-loader');

var SizeRangeLoader = require('../../../loader/size-range-loader');
var ComodityLoader = require('../../../loader/garment-comodities-loader');
var UOMLoader = require('../../../loader/uom-loader');
var UnitLoader = require('../../../loader/garment-units-loader');

@inject(Router, BindingEngine, ServiceEffeciency, RateService, Element, ServiceCore)
export class DataForm {
  @bindable title;
  @bindable readOnly;
  @bindable disabled = "true";
  @bindable OLCheck;
  @bindable OTL1Check;
  @bindable OTL2Check;
  @bindable OTL3Check;
  @bindable Quantity;
  @bindable data = {};
  @bindable error = {};
  @bindable SelectedRounding;
  @bindable isCopy = false;
  @bindable previewData = [];
  @bindable headers = [];
  @bindable viewDataTable = false;
  @bindable dataMaterialUpload = [];
  @bindable dataMaterial = [];
  @bindable errorUpload;
  @bindable hasSCNO;
  @bindable hasQuantity;
  @bindable selectedCCType;

  leadTimeList = ["30 hari"];

  subconTypes = [
    "SUBCON SEWING",
    "SUBCON CUTTING SEWING",
    "SUBCON SEWING FINISHING",
    "SUBCON CUTTING SEWING FINISHING",
  ];

  defaultRate = { Id: 0, Value: 0, CalculatedValue: 0 };
  rateList = ["", "IDR", "USD"];

  length0 = {
    label: {
      align: "left"
    }
  }
  length4 = {
    label: {
      align: "left",
      length: 4
    }
  }
  length6 = {
    label: {
      align: "left",
      length: 6
    }
  }
  length8 = {
    label: {
      align: "left",
      length: 8
    }
  }

  costCalculationGarment_MaterialsInfoUploads = {
    columns: [
      { header: "No." },
      { header: "PR Master" },
      { header: "PO Gudang" },
      { header: "CMT", value: "isFabricCM" },
      { header: "No. PO" },
      { header: "Kategori", value: "Category" },
      { header: "Kode Barang", value: "ProductCode" },
      { header: "Komposisi", value: "Composition" },
      { header: "Konstruksi", value: "Construction" },
      { header: "Yarn", value: "Yarn" },
      { header: "Width", value: "Width" },
      { header: "Deskripsi", value: "Description" },
      { header: "Detail Barang", value: "ProductRemark" },
      { header: "Kuantitas", value: "Quantity" },
      { header: "Satuan", value: "SatuanQuantity" },
      { header: "Price", value: "Price" },
      { header: "Satuan", value: "SatuanPrice" },
      { header: "Konversi", value: "Conversion" },
      { header: "Total", value: "Total" },
      { header: "Allowance (%)", value: "Allowance" },
      { header: "Ongkir (%)", value: "ShippingFeePortion" },
      { header: "Jumlah Ongkir", value: "TotalShippingFee" },
      { header: "Kuantitas Budget", value: "BudgetQuantity" },
      { header: "Tujuan Material", value: "MaterialFor" }
    ],
    options: {},
  };

  preSalesContractFilter = {
    IsPosted: true,
    'SCType == "JOB ORDER" || SCType == "SUBCON" || SCType == "TERIMA SUBCON" || SCType == "SUBCON KELUAR"': true,
  }

  constructor(router, bindingEngine, serviceEffeciency, rateService, element, serviceCore) {
    this.router = router;
    this.bindingEngine = bindingEngine;
    this.efficiencyService = serviceEffeciency;
    this.rateService = rateService;
    this.element = element;
    this.serviceCore = serviceCore;
  }

  async bind(context) {
    this.context = context;
    this.data = this.context.data;
    this.error = this.context.error;
    this.selectedSubconType = this.data.SubconType ? this.data.SubconType : "";
    this.selectedSMV_Cutting = this.data.SMV_Cutting ? this.data.SMV_Cutting : 0;
    this.selectedSMV_Sewing = this.data.SMV_Sewing ? this.data.SMV_Sewing : 0;
    this.selectedSMV_Finishing = this.data.SMV_Finishing ? this.data.SMV_Finishing : 0;
    this.quantity = this.data.Quantity ? this.data.Quantity : 1;
    // this.fabricAllowance = this.data.FabricAllowance ? this.data.FabricAllowance : 0;
    // this.accessoriesAllowance = this.data.AccessoriesAllowance ? this.data.AccessoriesAllowance : 0;
    this.data.Risk = this.data.Risk ? this.data.Risk : 5;
    this.imageSrc = this.data.ImageFile = this.isEdit || this.isCopy ? (this.data.ImageFile || "#") : "#";
    this.selectedLeadTime = this.data.LeadTime ? `${this.data.LeadTime} hari` : "";
    this.selectedUnit = this.data.Unit ? this.data.Unit : "";
    this.data.OTL1 = this.data.OTL1 ? this.data.OTL1 : Object.assign({}, this.defaultRate);
    this.data.OTL2 = this.data.OTL2 ? this.data.OTL2 : Object.assign({}, this.defaultRate);
    this.data.ConfirmPrice = this.data.ConfirmPrice ? this.data.ConfirmPrice : 0;
    this.selectedComodity = this.data.Comodity ? this.data.Comodity : "";
    this.data.BuyerCode = this.data.Buyer ? this.data.Buyer.Code : "";

    this.buyerlocal = false;
    if (this.data.Buyer) {
      const buyer = await this.serviceCore.getBuyerId(this.data.Buyer.Id);
      this.buyerlocal = buyer.Type == "Lokal" ? true : false;
    }

    this.data.IsCommissionPortion = this.data.IsCommissionPortion == null ? this.buyerlocal : this.data.IsCommissionPortion;
    this.create = this.context.create;

    if (!this.create) {
      this.selectedBookingOrder = {
        BookingOrderId: this.data.BookingOrderId,
        BookingOrderItemId: this.data.BookingOrderItemId,
        BookingOrderNo: this.data.BookingOrderNo,
        ConfirmDate: this.data.ConfirmDate,
        ConfirmQuantity: this.data.BOQuantity,
      }
    } else {
      this.selectedBookingOrder = null;
    }

    let promises = [];

    let wage;
    if (this.data.Wage) {
      wage = new Promise((resolve, reject) => {
        resolve(this.data.Wage);
      });
      this.data.Wage.Value = this.data.Wage.Value.toLocaleString('en-EN', { minimumFractionDigits: 2 });
    } else {
      this.data.Wage = this.defaultRate;
      wage = this.rateService.search({ filter: "{Name:\"OL\"}" })
        .then(results => {
          let result = results.data[0] ? results.data[0] : this.defaultRate;
          result.Value = numeral(numeral(result.Value).format(rateNumberFormat)).value();
          return result;
        });
      this.data.Wage.Value = this.data.Wage.Value.toLocaleString('en-EN', { minimumFractionDigits: 2 });
    }

    promises.push(wage);

    let THR;
    if (this.data.THR) {
      THR = new Promise((resolve, reject) => {
        resolve(this.data.THR);
      });
    } else {
      this.data.THR = this.defaultRate;
      THR = this.rateService.search({ filter: "{Name:\"THR\"}" })
        .then(results => {
          let result = results.data[0] ? results.data[0] : this.defaultRate;
          result.Value = numeral(numeral(result.Value).format(rateNumberFormat)).value();
          return result;
        });
    }

    promises.push(THR);

    let rate;
    if (this.data.Rate) {
      rate = new Promise((resolve, reject) => {
        resolve(this.data.Rate);
      });
    } else {
      this.data.Rate = this.defaultRate;
      rate = this.rateService.search({ filter: "{Name:\"USD\"}" })
        .then(results => {
          let result = results.data[0] ? results.data[0] : this.defaultRate;
          result.Value = numeral(numeral(result.Value).format(rateNumberFormat)).value();
          return result;
        });
    }

    promises.push(rate);

    let all = await Promise.all(promises);
    this.data.Wage = all[0];
    this.data.Wage.Value = this.data.Wage.Value.toLocaleString('en-EN', { minimumFractionDigits: 2 });
    this.data.THR = all[1];
    this.RateDollar = all[2];
    this.selectedRate = this.data.Rate ? this.data.Rate : "";

    if (this.data.CostCalculationGarment_Materials) {
      this.data.CostCalculationGarment_Materials.forEach(item => {
        item.QuantityOrder = this.data.Quantity;
        // item.FabricAllowance = this.data.FabricAllowance;
        // item.AccessoriesAllowance = this.data.AccessoriesAllowance;
        item.Rate = this.data.Rate;
        item.Allowance = item.Allowance;
        item.SMV_Cutting = this.data.SMV_Cutting;
        item.SMV_Sewing = this.data.SMV_Sewing;
        item.SMV_Finishing = this.data.SMV_Finishing;
        item.THR = this.data.THR;
        item.Wage = this.data.Wage;
        item.SMV_Total = this.data.SMV_Total;
        item.Efficiency = this.data.Efficiency;
        item.CCType = this.data.CCType;
        item.SubconType = this.data.SubconType;
      })
    }

    this.costCalculationGarment_MaterialsInfoUploads.options.CCId = this.data.Id;
    this.costCalculationGarment_MaterialsInfoUploads.options.BuyerCode = this.data.BuyerBrand ? this.data.BuyerBrand.Code : "";
    this.costCalculationGarment_MaterialsInfoUploads.options.IsEditMaterial = this.isEdit;
    this.costCalculationGarment_MaterialsInfoUploads.options.IsCopyCC =  this.isCopy;
    this.costCalculationGarment_MaterialsInfoUploads.options.CCId = this.data.Id;
    this.costCalculationGarment_MaterialsInfoUploads.options.SCId = this.data.PreSCId;
    //this.costCalculationGarment_MaterialsInfoUploads.options.OTLRate = this.data.OTLRate;

    if (this.data.Rate) {
      if (this.data.Rate.Value > 1) {
        this.selectedRate = "USD";
      }
      else if (this.data.Rate.Value == 1) {
        this.selectedRate = "IDR";
      }
    }
  }

  get preSalesContractLoader() {
    return PreSalesContractLoader;
  }

  get bookingOrderLoader() {
    return BookingOrderLoader;
  }

  bookingOrderView = (bookingorder) => {
    return `${bookingorder.BookingOrderNo} - ${bookingorder.ComodityName} - ${bookingorder.ConfirmQuantity} - ${moment(bookingorder.ConfirmDate).format("DD MMM YYYY")}`
  }

  get filter() {
    var filter = {};
    filter = {
      BuyerCode: this.data.BuyerCode,
      SectionCode: this.data.Section,
      ComodityCode: this.data.ComodityCode,
    };

    return filter;
  }

  get sizeRangeLoader() {
    return SizeRangeLoader;
  }

  get comodityLoader() {
    return ComodityLoader;
  }

  comodityView = (comodity) => {
    return `${comodity.Code} - ${comodity.Name}`
  }

  get uomLoader() {
    return UOMLoader;
  }

  get unitLoader() {
    return UnitLoader;
  }

  unitView = (unit) => {
    return `${unit.Code} - ${unit.Name}`
  }

  uomView = (uom) => {
    return uom ? `${uom.Unit}` : '';
  }

  get dataSection() {
    return (this.data.Section || this.data.SectionName) ? `${this.data.Section} - ${this.data.SectionName}` : "-";
  }

  get dataBuyer() {
    return this.data.Buyer ? this.data.Buyer.Name : "-";
  }

  get dataBuyerBrand() {
    return this.data.BuyerBrand ? this.data.BuyerBrand.Name : "-";
  }

  @bindable selectedPreSalesContract;
  async selectedPreSalesContractChanged(newValue, oldValue) {
    if (newValue) {
      this.data.CommissionPortion = 0;
      this.data.CommissionRate = 0;
      this.data.PreSCId = newValue.Id;
      this.data.CCType = newValue.SCType;
      this.data.PreSCNo = newValue.SCNo;
      this.data.Section = newValue.SectionCode;
      const section = await this.serviceCore.getSection(newValue.SectionId);
      this.data.SectionName = section.Name;
      this.data.ApprovalCC = section.ApprovalCC;
      this.data.ApprovalRO = section.ApprovalRO;
      this.data.Buyer = {
        Id: newValue.BuyerAgentId,
        Code: newValue.BuyerAgentCode,
        Name: newValue.BuyerAgentName
      };
      this.data.BuyerCode = this.data.Buyer.Code;
      const buyer = await this.serviceCore.getBuyerId(newValue.BuyerAgentId);
      this.buyerlocal = buyer.Type == "Lokal" ? true : false;
      this.data.BuyerBrand = {
        Id: newValue.BuyerBrandId,
        Code: newValue.BuyerBrandCode,
        Name: newValue.BuyerBrandName
      };
    } else {
      this.data.PreSCId = 0;
      this.data.PreSCNo = null;
      this.data.Section = null;
      this.data.SectionName = null;
      this.data.ApprovalCC = null;
      this.data.ApprovalRO = null;
      this.data.Buyer = null;
      this.data.BuyerBrand = null;
      this.selectedBookingOrder = null;
      this.data.CCType = null;
    }

    if ((oldValue && newValue) || (oldValue && !newValue)) {
      this.data.CostCalculationGarment_Materials.splice(0);
    } else if (this.data.PreSCNoSource && this.data.PreSCNo !== this.data.PreSCNoSource) {
      const materialsFromPRMaster = this.data.CostCalculationGarment_Materials.filter(m => m.PRMasterItemId > 0);
      for (const materialFromPRmaster of materialsFromPRMaster) {
        materialFromPRmaster.IsPRMaster = null;
        materialFromPRmaster.PRMasterId = 0;
        materialFromPRmaster.PRMasterItemId = 0;
        materialFromPRmaster.POMaster = null;
      }
    }
    this.costCalculationGarment_MaterialsInfoUploads.options.BuyerCode = this.data.BuyerBrand ? this.data.BuyerBrand.Code : "";
    this.costCalculationGarment_MaterialsInfoUploads.options.SCId = this.data.PreSCId;
  }

  @bindable selectedBookingOrder;
  async selectedBookingOrderChanged(newValue, oldValue) {
    if (newValue) {
      if (!this.data.Id) {
        this.data.BookingOrderId = newValue.BookingOrderId;
        this.data.BookingOrderItemId = newValue.BookingOrderItemId;
        this.data.BookingOrderNo = newValue.BookingOrderNo;
        this.data.BOQuantity = newValue.ConfirmQuantity;
        this.data.ConfirmDate = newValue.ConfirmDate;
      }
    } else {
      this.data.BookingOrderId = 0;
      this.data.BookingOrderItemId = 0;
      this.data.BookingOrderNo = null;
      this.data.BOQuantity = 0;
      this.data.ConfirmDate = null;
    }
  }

  @bindable selectedComodity = "";
  selectedComodityChanged(newVal) {
    this.data.Comodity = newVal;
    if (newVal) {
      this.data.ComodityId = newVal.Id;
      this.data.ComodityCode = newVal.Code;
      this.data.ComodityName = newVal.Name;
    }
    else {
      this.selectedBookingOrder = null;
    }
    console.log(this.data.ComodityCode);
  }

  @bindable selectedLeadTime = "";
  selectedLeadTimeChanged(newVal) {
    if (newVal === "30 hari") {
      this.data.LeadTime = 30;
    } else {
      this.data.LeadTime = 0;
    }
  }

  @bindable imageUpload;
  @bindable imageSrc;
  imageUploadChanged(newValue) {
    let imageInput = document.getElementById('imageInput');
    let reader = new FileReader();
    reader.onload = event => {
      let base64Image = event.target.result;
      this.imageSrc = this.data.ImageFile = base64Image;
    }
    reader.readAsDataURL(imageInput.files[0]);
  }

  @bindable selectedRate;
  selectedRateChanged(newValue, oldValue) { //condition rule option changed
    if (newValue === "IDR") {
      this.data.Rate = { Id: 0, Value: 1, Name: "IDR", Code: "IDR" };
      if (this.data.CostCalculationGarment_Materials) {
        this.data.CostCalculationGarment_Materials.forEach(item => {
          item.Rate = this.data.Rate;
        });
      }
    } else if (newValue === "USD") {
      this.rateService.search({ filter: "{Name:\"USD\"}" }) // get USD rate value from master.rate
        .then(results => {
          let result = results.data[0] ? results.data[0] : this.defaultRate;
          result.Value = numeral(numeral(result.Value).format(rateNumberFormat)).value();
          this.data.Rate = result;

          if (this.data.CostCalculationGarment_Materials) {
            this.data.CostCalculationGarment_Materials.forEach(item => {
              item.Rate = this.data.Rate;
            });
          }
        });
    }
  }

  @computedFrom("data.Id")
  get isEdit() {
    return (this.data.Id || 0) != 0;
  }

  @computedFrom("error.CostCalculationGarment_MaterialTable")
  get hasError() {
    return (this.error.CostCalculationGarment_MaterialTable ? this.error.CostCalculationGarment_MaterialTable.length : 0) > 0;
  }

  get lineLoader() {
    return lineLoader;
  }

  @bindable quantity;
  async quantityChanged(newValue) {
    this.data.Quantity = newValue;
    this.data.Efficiency = await this.efficiencyService.getEffByQty(this.data.Quantity);
    this.data.Efficiency.Value = this.data.Efficiency.Value.toLocaleString('en-EN', { minimumFractionDigits: 2 });
    let index = this.data.Efficiency.Value ? 100 / this.data.Efficiency.Value.toLocaleString('en-EN', { minimumFractionDigits: 2 }) : 0;
    this.data.Index = numeral(numeral(index).format()).value().toLocaleString('en-EN', { minimumFractionDigits: 2 });
    if (this.data.CostCalculationGarment_Materials) {
      this.data.CostCalculationGarment_Materials.forEach(item => {
        item.QuantityOrder = this.data.Quantity;
        item.Efficiency = this.data.Efficiency;
      })
      this.context.itemsCollection.bind()
    }
  }

  // @bindable fabricAllowance;
  // fabricAllowanceChanged(newValue) {
  //   this.data.FabricAllowance = newValue;
  //   if (this.data.CostCalculationGarment_Materials) {
  //     this.data.CostCalculationGarment_Materials.forEach(item => {
  //       item.FabricAllowance = this.data.FabricAllowance;
  //     })
  //   }
  // }

  // @bindable accessoriesAllowance;
  // accessoriesAllowanceChanged(newValue) {
  //   this.data.AccessoriesAllowance = newValue;
  //   if (this.data.CostCalculationGarment_Materials) {
  //     this.data.CostCalculationGarment_Materials.forEach(item => {
  //       item.AccessoriesAllowance = this.data.AccessoriesAllowance;
  //     })
  //   }
  // }

  @bindable selectedSubconType;
  selectedSubconTypeChanged(newValue) {
    this.data.SubconType = newValue;
    if (this.data.CostCalculationGarment_Materials) {
      this.data.CostCalculationGarment_Materials.forEach((item) => {
        item.SubconType = this.data.SubconType;
      });
      this.context.itemsCollection.bind();
    }
  }

  @bindable selectedSMV_Cutting;
  selectedSMV_CuttingChanged(newValue) {
    this.data.SMV_Cutting = newValue;
    if (this.data.CostCalculationGarment_Materials) {
      this.data.CostCalculationGarment_Materials.forEach(item => {
        item.SMV_Cutting = this.data.SMV_Cutting;
      })
      this.context.itemsCollection.bind()
    }
  }

  @bindable selectedSMV_Sewing;
  selectedSMV_SewingChanged(newValue) {
    this.data.SMV_Sewing = newValue;
    if (this.data.CostCalculationGarment_Materials) {
      this.data.CostCalculationGarment_Materials.forEach(item => {
        item.SMV_Sewing = this.data.SMV_Sewing;
      })
      this.context.itemsCollection.bind()
    }
  }

  @bindable selectedSMV_Finishing;
  selectedSMV_FinishingChanged(newValue) {
    this.data.SMV_Finishing = newValue;
    if (this.data.CostCalculationGarment_Materials) {
      this.data.CostCalculationGarment_Materials.forEach(item => {
        item.SMV_Finishing = this.data.SMV_Finishing;
      })
      this.context.itemsCollection.bind()
    }
  }

  @bindable selectedUnit;
  @bindable yearRate;
  async selectedUnitChanged(newVal) {
    this.data.Unit = newVal;
    this.data.UnitId = newVal.Id;
    this.data.UnitCode = newVal.Code;
    this.data.BuyerName = newVal.Name;
    if (newVal) {
      let UnitCode = newVal.Code;
      let promises = [];

      // DL Section
      // this.yearRate = new Date().getFullYear();
      // const [allExpense] = await Promise.all([
      //   this.serviceCore.searchRateCC({
      //     keyword: this.yearRate.toString()
      //   })
      // ]);

      // const rates = allExpense.data || [];
      // this.data.OTLRate = rates.find(item => item.Code.toUpperCase().includes("OTL"+this.yearRate)) ? rates.find(item => item.Code.toUpperCase().includes("OTL"+this.yearRate)).Rate : 0;
      // this.costCalculationGarment_MaterialsInfoUploads.options.OTLRate = this.data.OTLRate;

      let OTL1 = this.rateService.search({ filter: JSON.stringify({ Name: "OTL 1", UnitCode: UnitCode }) }).then((results) => {
        let result = results.data[0] ? results.data[0] : this.defaultRate;
        result.Value = numeral(numeral(result.Value).format(rateNumberFormat)).value();
        return result;
      });
      promises.push(OTL1);

      let OTL2 = this.rateService.search({ filter: JSON.stringify({ Name: "OTL 2", UnitCode: UnitCode }) }).then((results) => {
        let result = results.data[0] ? results.data[0] : this.defaultRate;
        result.Value = numeral(numeral(result.Value).format(rateNumberFormat)).value();
        return result;
      });
      promises.push(OTL2);

      let results = await Promise.all(promises);

      this.data.OTL1 = results[0];
      this.data.OTL2 = results[1];
      this.data.UnitCode = newVal.Code;
      this.data.UnitId = newVal.Id;
      this.data.UnitName = newVal.Name;
    }
  }

  @computedFrom('data.SMV_Cutting', 'data.SMV_Sewing', 'data.SMV_Finishing')
  get SMV_Total() {
    let SMV_Total = this.data.SMV_Cutting + this.data.SMV_Sewing + this.data.SMV_Finishing;
    SMV_Total = numeral(SMV_Total).format();
    this.data.SMV_Total = numeral(SMV_Total).value();

    if (this.data.CostCalculationGarment_Materials) {
      this.data.CostCalculationGarment_Materials.forEach(item => {
        item.SMV_Finishing = this.data.SMV_Total;
      })
    }

    return SMV_Total;
  }

  @computedFrom('data.CommissionRate', 'data.ConfirmPrice', 'data.Freight', 'data.Insurance', 'data.Rate', 'data.Buyer', 'data.IsCommissionPortion')
  get commissionPortion() {
    let netPrice = (this.data.ConfirmPrice || 0) - (this.data.Insurance || 0) - (this.data.Freight || 0);
    let rateValue = this.data.Rate ? (this.data.Rate.Value || 1) : 1;
    let commissionRateVal = numeral(this.data.CommissionRate).value();

    let CommissionPortion = (netPrice > 0 && rateValue > 0) ? ((commissionRateVal / (netPrice * rateValue)) * 100) : 0;
    CommissionPortion = numeral(CommissionPortion).format();
    this.data.CommissionPortion = numeral(CommissionPortion).value();    
    
    return CommissionPortion;
  }
  
  @computedFrom('data.CommissionPortion', 'data.ConfirmPrice', 'data.Freight', 'data.Insurance', 'data.Rate', 'data.Buyer', 'data.IsCommissionPortion')
  get commissionRate() {
    let netPrice = (this.data.ConfirmPrice || 0) - (this.data.Insurance || 0) - (this.data.Freight || 0);
    let rateValue = this.data.Rate ? (this.data.Rate.Value || 1) : 1;
    let commissionPortionVal = numeral(this.data.CommissionPortion).value();

    let CommissionRate = 
      this.data.IsCommissionPortion ? 
        ((commissionPortionVal || 0) / 100) * netPrice * rateValue :
        this.data.CommissionRate;
        
    CommissionRate = numeral(CommissionRate).format();
    this.data.CommissionRate = numeral(CommissionRate).value();
  
    return CommissionRate;
  }

  @computedFrom('data.OTL1', 'data.SMV_Total', 'data.SubconType')
  get calculatedRateOTL1() {
    let calculatedRateOTL1 = 0;
    if (this.data.CCType == "SUBCON KELUAR") {
      switch (this.data.SubconType) {
        case "SUBCON SEWING":
          calculatedRateOTL1 = this.data.SMV_Total
            ? this.data.OTL1.Value *
            (this.data.SMV_Cutting + this.data.SMV_Finishing)
            : 0;
          break;
        case "SUBCON CUTTING SEWING":
          calculatedRateOTL1 = this.data.SMV_Total
            ? this.data.OTL1.Value * this.data.SMV_Finishing
            : 0;
          break;
        case "SUBCON SEWING FINISHING":
          calculatedRateOTL1 = this.data.SMV_Total
            ? this.data.OTL1.Value * this.data.SMV_Cutting
            : 0;
          break;
      }
    } else {
      calculatedRateOTL1 = this.data.SMV_Total
        ? this.data.OTL1.Value * this.data.SMV_Total * 60
        : 0;
    }

    calculatedRateOTL1 = numeral(calculatedRateOTL1).format();
    this.data.OTL1.CalculatedValue = numeral(calculatedRateOTL1).value();
    return calculatedRateOTL1;
  }

  @computedFrom('data.OTL2', 'data.SMV_Total', 'data.SubconType')
  get calculatedRateOTL2() {
    let calculatedRateOTL2 = 0;

    if (this.data.CCType == "SUBCON KELUAR") {
      switch (this.data.SubconType) {
        case "SUBCON SEWING":
          calculatedRateOTL2 = this.data.SMV_Total
            ? this.data.OTL2.Value *
            (this.data.SMV_Cutting + this.data.SMV_Finishing)
            : 0;
          break;
        case "SUBCON CUTTING SEWING":
          calculatedRateOTL2 = this.data.SMV_Total
            ? this.data.OTL2.Value * this.data.SMV_Finishing
            : 0;
          break;
        case "SUBCON SEWING FINISHING":
          calculatedRateOTL2 = this.data.SMV_Total
            ? this.data.OTL2.Value * this.data.SMV_Cutting
            : 0;
          break;
      }
    } else {
      calculatedRateOTL2 = this.data.SMV_Total
        ? this.data.OTL2.Value * this.data.SMV_Total * 60
        : 0;
    }
    calculatedRateOTL2 = numeral(calculatedRateOTL2).format();
    this.data.OTL2.CalculatedValue = numeral(calculatedRateOTL2).value();
    return calculatedRateOTL2;
  }

  @computedFrom('data.ConfirmPrice', 'data.Insurance', 'data.Freight', 'data.Rate', 'data.CommissionRate')
  get NETFOB() {
    let NETFOB = (this.data.ConfirmPrice - this.data.Insurance - this.data.Freight) * this.data.Rate.Value - this.data.CommissionRate;
    NETFOB = numeral(NETFOB).format();
    this.data.NETFOB = numeral(NETFOB).value();
    return NETFOB;
  }

  get freightCost() {
    let freightCost = 0;
    if (this.data.CostCalculationGarment_Materials) {
      this.data.CostCalculationGarment_Materials.forEach(item => {
        freightCost += item.TotalShippingFee;
      })
    }
    freightCost = numeral(freightCost).format();
    this.data.FreightCost = numeral(freightCost).value();

    return freightCost;
  }

  @computedFrom(
    "data.ConfirmPrice",
    "data.Insurance",
    "data.Freight",
    "data.OTL1.CalculatedValue",
    "data.OTL2.CalculatedValue",
    "data.Rate",
    "data.CommissionRate"
  )
  get NETFOBP() {
    let allMaterialCost = 0;
    if (this.data.CostCalculationGarment_Materials) {
      this.data.CostCalculationGarment_Materials.forEach(item => {
        allMaterialCost += item.Total;
      })
    }
    let subTotal = allMaterialCost !== 0 ? (allMaterialCost + this.data.OTL1.CalculatedValue + this.data.OTL2.CalculatedValue) * (100 + this.data.Risk) / 100 + this.data.FreightCost : 0;
    let NETFOBP = this.data.NETFOB && subTotal !== 0 ? (this.data.NETFOB - subTotal) / subTotal * 100 : 0;
    NETFOBP = numeral(NETFOBP).format();
    this.data.NETFOBP = numeral(NETFOBP).value();
    return NETFOBP;
  }

  enterDelegate(event) {
    if (event.charCode === 13) {
      event.preventDefault();
      return false;
    }
    else
      return true;
  }

  download(id) {
    this.service.downloadTemplateMaterialCC(id);
  }

  downloadErrorExcel(errors) {
    const errorData = errors.map((msg, index) => ({
      No: index + 1,
      Error: msg
    }));
    const worksheet = XLSX.utils.json_to_sheet(errorData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Error Upload");
    XLSX.writeFile(workbook, "Error_Upload.xlsx");
  }

  async handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

      if (jsonData.length === 0) {
        alert("File kosong atau tidak memiliki data.");
        return;
      }

      // Expected header sesuai template
      const expectedHeaders = [
        "CMT",//tidak wajib
        "PR MASTER",//tidak wajib
        "PO GUDANG",//tidak wajib
        "Kode Barang",
        "Keterangan",
        "Detil Barang",
        "Usage per pcs",
        "Satuan Barang",
        "Rincian qty",//tidak wajib //belum ada kolomnya
        "Harga",
        "Satuan beli",
        "Konversi",
        "Allowance %",//sudah ada diheader?
        "Ongkir %",
        "Remark RO"
      ];

      let actualHeaders = Object.keys(jsonData[0]);
      console.log(actualHeaders);
      console.log(expectedHeaders);
      for (let header of expectedHeaders) {
        if (!actualHeaders.includes(header)) {
          alert(`Template tidak sesuai.`);
          return;
        }
      }

      const cleanData = jsonData.map(row => {
        const cleanedRow = {};
        expectedHeaders.forEach(header => {
          cleanedRow[header] = row.hasOwnProperty(header) ? row[header] : "";
        });

        return cleanedRow;
      });

      jsonData.length = 0;
      jsonData.push(
        ...cleanData.filter(row =>
          Object.values(row).some(val =>
            val !== null &&
            val !== undefined &&
            !(typeof val === "string" && val.trim() === "")
          )
        )
      );

      const mandatoryColumns = [
        "Kode Barang",
        "Keterangan",
        "Usage per pcs",
        "Satuan Barang",
        "Harga",
        "Satuan beli",
        "Konversi",
        "Remark RO"
      ];
      const processKodeBarang = ["PRCSEW", "PRCFIN", "PRCCUT", "PR-PS0000001", "PR-PF0000001", "PR-PC0000001", "PR-P00000001", "PRC"];
      const skipIfProcess = ["Satuan Barang", "Harga", "Satuan beli", "Konversi", "Remark RO"];
      // Validasi kolom wajib tidak boleh kosong
      const errors = [];
      jsonData.forEach((row, rowIndex) => {
        const kodeBarang = (row["Kode Barang"] || "").toString().trim().toUpperCase();
        const isProcess = processKodeBarang.includes(kodeBarang);
        mandatoryColumns.forEach(col => {
          if (isProcess && skipIfProcess.includes(col)) return;

          const val = row[col];

          // Cek wajib terisi, tapi 0 harus dianggap valid
          const isEmpty =
            val === null ||
            val === undefined ||
            (typeof val === "string" && val.trim() === "");

          if (isEmpty) {
            errors.push(`Kolom "${col}" pada baris ${rowIndex + 2} tidak boleh kosong`);
          }
        });

        // Validasi Allowance untuk Process
        const allowanceValue = row["Allowance %"];

        const hasAllowance =
          allowanceValue !== null &&
          allowanceValue !== undefined &&
          allowanceValue !== "" &&
          !isNaN(Number(allowanceValue)) &&
          Number(allowanceValue) !== 0;

        if (isProcess && hasAllowance) {
          errors.push(
            `Baris ${rowIndex + 2}: Allowance % tidak boleh diisi untuk kode barang process (${kodeBarang})`
          );
        }

        const doItemValue = (row["PO Gudang"] || "").toString().trim().toLowerCase();
        const hasDOItem = row["PO Gudang"] === true || ["1", "true", "ya", "yes", "iya", "benar", "po gudang"].includes(doItemValue);

        // Validasi DOItem
        if (isProcess && hasDOItem) {
          errors.push(
            `Baris ${rowIndex + 2}: Jika barang PROSES maka tidak menggunakan PO Gudang`
          );
        }

        // Validasi CMT
        const cmtValue = (row["CMT"] || "").toString().trim().toLowerCase();
        const isCMT = row["CMT"] === true || ["1", "true", "ya", "yes", "iya", "benar", "cmt"].includes(cmtValue);

        // if (isCMT && !kodeBarang.toUpperCase().startsWith("CI-") && !kodeBarang.toUpperCase().startsWith("CL-")) {
        //   errors.push(
        //     `Baris ${rowIndex + 2}: Jika barang CMT maka gunakan kode barang CMT`
        //   );
        // }
      });

      if (errors.length > 0) {
        if (confirm("Terdapat data kosong, download file error?")) {
          this.downloadErrorExcel(errors);
        }

        return;
      }

      this.previewData = jsonData;
      this.headers = actualHeaders;
      await this.pushDataExcel(this.previewData);
    };

    document.getElementById("fileCsv").value = null;
    reader.readAsArrayBuffer(file);
  }

  async pushDataExcel(value) {
    if (!Array.isArray(value) || value.length === 0) {
      alert("Tidak ada data Excel yang dibaca.");
      document.getElementById("fileCsv").value = "";
      return;
    }

    this.errorUpload = [];
    this.error = {};

    this.data.CostCalculationGarment_Materials = [];
    this.error.CostCalculationGarment_Materials = [];

    const payload = value.map((row, index) => ({
      IsAddPRMaster: row["PR MASTER"] != null && (String(row["PR MASTER"]).trim() === "1" ||
        String(row["PR MASTER"]).trim().toLowerCase() === "true" ||
        String(row["PR MASTER"]).trim().toLowerCase() == "ya") ||
        String(row["PR MASTER"]).trim().toLowerCase() === "yes" ||
        String(row["PR MASTER"]).trim().toLowerCase() === "iya" ||
        String(row["PR MASTER"]).trim().toLowerCase() === "benar" ||
        String(row["PR MASTER"]).trim().toLowerCase() === "prmaster",
      IsAddPOWarehouse: row["PO GUDANG"] != null && (String(row["PO GUDANG"]).trim() === "1" ||
        String(row["PO GUDANG"]).trim().toLowerCase() === "true" ||
        String(row["PO GUDANG"]).trim().toLowerCase() == "ya") ||
        String(row["PO GUDANG"]).trim().toLowerCase() === "yes" ||
        String(row["PO GUDANG"]).trim().toLowerCase() === "iya" ||
        String(row["PO GUDANG"]).trim().toLowerCase() === "benar" ||
        String(row["PO GUDANG"]).trim().toLowerCase() === "po gudang",
      isFabricCM: row["CMT"] != null && (String(row["CMT"]).trim() === "1" ||
        String(row["CMT"]).trim().toLowerCase() === "true" ||
        String(row["CMT"]).trim().toLowerCase() == "ya") ||
        String(row["CMT"]).trim().toLowerCase() === "yes" ||
        String(row["CMT"]).trim().toLowerCase() === "iya" ||
        String(row["CMT"]).trim().toLowerCase() === "benar" ||
        String(row["CMT"]).trim().toLowerCase() === "cmt",
      KodeBarang: (row["Kode Barang"] || "").toString().trim(),
      SatuanBeli: (row["Satuan beli"] || "").toString().trim(),
      SatuanBarang: (row["Satuan Barang"] || "").toString().trim(),
      Description: (row["Keterangan"] || "").toString(),
      ProductRemark: row["Detil Barang"] && row["Detil Barang"].toString().trim() !== "" ? row["Detil Barang"].toString() : "-",
      QuantityBreakdown: parseFloat(row["Rincian qty"]) == 0 ? this.data.Quantity : parseFloat(row["Rincian qty"]),
      Quantity: parseFloat(row["Usage per pcs"]) || 0,
      Price: parseFloat(row["Harga"]) || 0,
      Conversion: parseFloat(row["Konversi"]) || 0,
      ShippingFeePortion: parseFloat(row["Ongkir %"]) || 0,
      Information: (row["Remark RO"] || "").toString(),
      MaterialIndex: index,
      QuantityOrder: this.data.Quantity || 0,
      Allowance: parseFloat(row["Allowance %"]) || 0,
      Rate: this.data.Rate || 0,
      SMV_Cutting: this.data.SMV_Cutting || 0,
      SMV_Sewing: this.data.SMV_Sewing || 0,
      SMV_Finishing: this.data.SMV_Finishing || 0,
      THR: this.data.THR || 0,
      Wage: this.data.Wage || 0,
      SMV_Total: this.data.SMV_Total || 0,
      Efficiency: this.data.Efficiency || 0,
      CCType: this.data.CCType,
      SubconType: this.data.SubconType,
      IsFromUpload: true
    }));

    let resultData = [];

    try {
      resultData = await this.serviceCore.getMaterialFromUpload(payload);
    } catch (error) {
      alert("Gagal mengambil data Product dan UOM. Periksa koneksi Anda.");
      return;
    }

    const materials = Array.isArray(resultData) ? resultData : [];
    const allMaterials = [];

    for (const item of materials) {
      const hasProduct = !!item.Product || item.Product !== null;
      const material = 
        hasProduct ? {
          IsAddPRMaster: item.IsAddPRMaster,
          IsAddPOWarehouse: item.IsAddPOWarehouse,
          DOItemId: 0,
          RemainingQuantity: 0,
          isFabricCM: item.isFabricCM || false,
          Category: item.Category || {},
          Product: item.Product || {},
          Description: item.Description,
          ProductRemark: item.ProductRemark,
          QuantityBreakdown: item.QuantityBreakdown || 0,
          Quantity: item.Quantity || 0,
          UOMQuantity: item.UOMQuantity || null,
          Price: item.Price || 0,
          Conversion: item.Conversion || 0,
          ShippingFeePortion: item.ShippingFeePortion || 0,
          Information: item.Information,
          UOMPrice: item.UOMPrice || null,
          MaterialIndex: item.MaterialIndex || 0,
          QuantityOrder: item.QuantityOrder || 0,
          Allowance: item.Allowance || 0,
          Rate: item.Rate || 0,
          SMV_Cutting: item.SMV_Cutting || 0,
          SMV_Sewing: item.SMV_Sewing || 0,
          SMV_Finishing: item.SMV_Finishing || 0,
          THR: item.THR || 0,
          Wage: item.Wage || 0,
          SMV_Total: item.SMV_Total || 0,
          Efficiency: item.Efficiency || 0,
          CCType: item.CCType,
          SubconType: item.SubconType,
          IsFromUpload: item.IsFromUpload,
          DOItemId: 0,
          MaterialFor: 'CUTTING'
        } : {
          IsAddPRMaster: item.IsAddPRMaster,
          IsAddPOWarehouse: item.IsAddPOWarehouse,
          MaterialIndex: item.MaterialIndex,
          Product: {
            Code: item.KodeBarang || "Tidak ditemukan",
            IsError: true,
            ErrorMessage: `Tidak ditemukan barang dengan kode ${item.KodeBarang}`
          },
          HasError: true,
          IsFromUpload: item.IsFromUpload
        };

      if (material && material.isFabricCM) {
        material.ShippingFeePortion = 0;
      }
      allMaterials.push(material);
    }

    this.data.CostCalculationGarment_Materials = allMaterials;
    this.data.FabricAllowance = allMaterials
      .filter(x =>
        (((x.Category || {}).name || (x.Category || {}).Name || "").toUpperCase() === "FABRIC")
      )
      .reduce((a, b) => a + Number(b.Allowance || 0), 0);
    this.data.AccessoriesAllowance = allMaterials
      .filter(x =>
        (((x.Category || {}).name || (x.Category || {}).Name || "").toUpperCase() !== "FABRIC")
      )
      .reduce((a, b) => a + Number(b.Allowance || 0), 0);
    this.context.itemsCollection.bind();
  }

  viewData() {
    this.viewDataTable = !this.viewDataTable;
    if (this.viewDataTable && this.previewData.length === 0) {
      alert("Tidak ada data Excel yang dibaca.");
      this.viewDataTable = false;
    }
  }
}
