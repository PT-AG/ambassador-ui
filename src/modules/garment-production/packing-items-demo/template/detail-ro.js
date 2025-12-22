import { inject, bindable, computedFrom } from "aurelia-framework";
import {
  SalesService,
  GarmentProductionService,
  CoreService,
} from "../service";
var CostCalculationLoader = require("../../../../loader/cost-calculation-garment-loader");
var UomLoader = require("../../../../loader/uom-loader");
var UnitLoader = require("../../../../loader/unit-loader");
var SampleRequestLoader = require("../../../../loader/garment-sample-request-loader");

@inject(SalesService, GarmentProductionService, CoreService)
export class Item {
  @bindable selectedRO;
  @bindable uom;
  @bindable detail;

  constructor(salesService, garmentProductionService, coreService) {
    this.salesService = salesService;
    this.garmentProductionService = garmentProductionService;
    this.coreService = coreService;
  }

  getTotalSize(size) {
    let total = 0;
    for (let color of this.detail.Colors) {
      let obj = color.Sizes.find((s) => s.Size.toUpperCase() === size);
      if (obj) total += obj.Quatity;
    }
    return total;
  }
  buildDetailsColumns() {
    let dynamicSizeColumns = this.data.sizes.map((sz) => ({
      header: sz,
      value: sz,
    }));

    this.plColumns = [
      { header: "STYLE / COLOR", value: "color" },
      { header: "NOMOR", value: "nomor" },

      // ======== Dynamic Size Columns ========
      ...dynamicSizeColumns,

      { header: "TOTAL PCS", value: "qtyCtn" },
      { header: "CTN", value: "cartons" },
      { header: "TOTAL", value: "cartons" },
      { header: "GW", value: "gw" },
      { header: "NW", value: "nw" },
      { header: "NNW", value: "nnw" },
    ];
  }
  createEmptySizeMap() {
    let map = {};
    this.data.sizes.forEach((sz) => (map[sz.toUpperCase()] = 0));
    return map;
  }

  addFullCartonRow(colorName, sizeName, fullCtn, start, end) {
    let row = {
      color: colorName,
      start,
      end,
      cartons: fullCtn,
      qtyDisplay: this.data.ctnQty,
      qtyCtn: this.data.ctnQty * fullCtn,
      ...this.createEmptySizeMap(),
      gw: 0,
      nw: 0,
      nnw: 0,
    };

    row[sizeName] = this.data.ctnQty;

    this.data.detailRows.push(row);
  }

  addRemainderRow(colorName, start, end, sizeMap, qtyTotal) {
    let row = {
      color: colorName,
      start,
      end,
      cartons: 1,
      qtyDisplay: qtyTotal,
      qtyCtn: qtyTotal,
      ...this.createEmptySizeMap(),
      gw: 0,
      nw: 0,
      nnw: 0,
    };

    Object.keys(sizeMap).forEach((sz) => {
      row[sz] = sizeMap[sz];
    });

    this.data.detailRows.push(row);
  }

  combineRemainders(startNo) {
    let buffer = [];
    let total = 0;

    for (let r of this.remainders) {
      buffer.push({ ...r });
      total += r.remainder;

      while (total >= this.data.ctnQty) {
        let need = this.data.ctnQty;
        let tmpSize = {};

        while (need > 0 && buffer.length > 0) {
          let item = buffer[0];
          let useQty = Math.min(item.remainder, need);

          if (!tmpSize[item.size]) tmpSize[item.size] = 0;
          tmpSize[item.size] += useQty;

          item.remainder -= useQty;
          need -= useQty;

          if (item.remainder === 0) buffer.shift();
        }

        this.addRemainderRow(
          buffer.length > 1 ? "Gabungan" : r.color,
          startNo,
          startNo,
          tmpSize,
          this.data.ctnQty
        );

        total -= this.data.ctnQty;
        startNo++;
      }
    }

    // Sisa terakhir < isiCarton
    if (total > 0) {
      let tmpSize = {};
      buffer.forEach((x) => {
        tmpSize[x.size] = (tmpSize[x.size] || 0) + x.remainder;
      });

      this.addRemainderRow(
        buffer.length > 1 ? "Gabungan" : buffer[0].color,
        startNo,
        startNo,
        tmpSize,
        total
      );
    }
  }

  generateCartonLayout() {
    this.data.detailRows = [];
    this.remainders = [];

    let currentStart = 1;

    for (let color of this.detail.Colors) {
      for (let s of color.Sizes) {
        let qty = s.Quatity;

        if (qty < this.data.ctnQty) {
          this.remainders.push({
            color: color.Color,
            size: s.Size.toUpperCase(),
            remainder: qty,
          });
          continue;
        }

        let fullCtn = Math.floor(qty / this.data.ctnQty);
        let start = currentStart;
        let end = currentStart + fullCtn - 1;

        this.addFullCartonRow(
          color.Color,
          s.Size.toUpperCase(),
          fullCtn,
          start,
          end
        );

        currentStart = end + 1;

        let rem = qty % this.data.ctnQty;
        if (rem > 0) {
          this.remainders.push({
            color: color.Color,
            size: s.Size.toUpperCase(),
            remainder: rem,
          });
        }
      }
    }

    this.combineRemainders(currentStart);
  }

  extractSizes() {
    const sizes = new Set();
    for (let color of this.detail.Colors) {
      for (let s of color.Sizes) {
        sizes.add(s.Size.toUpperCase());
      }
    }
    return Array.from(sizes); // Convert ke array
  }

  async generateTemplate() {
    if (this.data.roNo) {
      let ro = await this.salesService.getROGarment({
        keyword: this.data.roNo,
      });
      console.log(ro.data[0]);
      this.detail = ro.data[0];
    }
    this.data.sizes = this.extractSizes();
    this.itemOptions.sizes = this.data.sizes;
    this.buildDetailsColumns();
    this.generateCartonLayout();
  }

  roTypeOptions = ["RO JOB", "RO SAMPLE"];
  get filter() {
    var filter = {};
    let section = this.context.context.options.header.section || {};
    if (this.data.roType == "RO JOB") {
      if (section.code === "C") {
        filter = {
          Section: section.code || section.Code,
          "SCGarmentId!=null": true,
        };
      } else {
        filter = {
          BuyerCode: this.data.BuyerCode,
          Section: section.code || section.Code,
          "SCGarmentId!=null": true,
        };
      }
    } else {
      filter = {
        BuyerCode: this.data.BuyerCode,
        SectionCode: section.code || section.Code,
      };
    }
    return filter;
  }

  detailsColumns = [
    { header: "Index" },
    { header: "Carton 1" },
    { header: "Carton 2" },
    { header: "Style" },
    { header: "Colour" },
    { header: "Jml Carton" },
    { header: "Qty" },
    { header: "Total Qty" },
    { header: "GW" },
    { header: "NW" },
    { header: "NNW" },
    { header: "" },
  ];

  get roLoader() {
    if (this.data.roType == "RO SAMPLE") {
      return SampleRequestLoader;
    } else {
      return CostCalculationLoader;
    }
  }
  roView = (ro) => {
    if (this.data.roType == "RO SAMPLE") return `${ro.RONoSample}`;
    else return `${ro.RO_Number}`;
  };

  get uomLoader() {
    return UomLoader;
  }

  uomView = (uom) => {
    return `${uom.Unit || uom.unit}`;
  };

  get unitLoader() {
    return UnitLoader;
  }

  get unitFilter() {
    return {
      '(Code == "C2A" || Code == "C2B" || Code == "C2C" || Code == "C1A" || Code == "C1B")': true,
    };
  }

  unitView = (unit) => {
    return `${unit.Code || unit.code}`;
  };

  activate(context) {
    this.context = context;
    this.data = context.data;
    this.error = context.error;
    this.options = context.options;
    this.readOnly = this.options.readOnly;
    this.isCreate = context.context.options.isCreate;
    this.isEdit = context.context.options.isEdit;
    this.itemOptions = {
      error: this.error,
      isCreate: this.isCreate,
      readOnly: this.readOnly,
      isEdit: this.isEdit,
      header: context.context.options.header,
      item: this.data,
      sizes: this.data.sizes,
    };
    if (this.data.roNo) {
      this.selectedRO = {
        RO_Number: this.data.RONo || this.data.roNo,
        RONoSample: this.data.RONo || this.data.roNo,
      };
      this.uom = this.data.uom;
    }

    this.isShowing = false;
    if (this.error && this.error.Details && this.error.Details.length > 0) {
      this.isShowing = true;
    }

    if (this.data.detailRows) {
      this.buildDetailsColumns();
    }
  }

  selectedROChanged(newValue) {
    if (newValue) {
      if (this.data.roType == "RO JOB") {
        this.salesService.getCostCalculationById(newValue.Id).then((result) => {
          // this.salesService.getSalesContractById(result.SCGarmentId)
          this.salesService
            .getSalesContractByRO(result.RO_Number)
            .then((sc) => {
              this.salesService
                .getPreSalesContractById(result.PreSCId)
                .then((psc) => {
                  this.data.roNo = result.RO_Number;
                  this.data.article = result.Article;
                  this.data.buyerAgent = result.Buyer;
                  this.data.buyerBrand = result.BuyerBrand;
                  this.data.sectionName = result.SectionName;
                  this.data.section = {
                    id: psc.SectionId,
                    code: result.Section,
                  };
                  this.data.comodityDescription = (result.Comodity || {}).Name;
                  this.data.unit = result.Unit;
                  this.data.uom = result.UOM;
                  this.uom = result.UOM;
                  this.data.valas = result.Section == "MD01" ? "IDR" : "USD";
                  this.data.quantity = result.Quantity;
                  this.data.scNo = sc.SalesContractNo;
                  //console.log(sc)
                  //this.data.amount=sc.Amount;
                  let avgPrice = 0;
                  // if (sc.Price == 0) {
                  //   avgPrice = sc.Items.reduce((acc, cur) => acc += cur.Price, 0) / sc.Items.length;
                  // } else {
                  //   avgPrice = sc.Price;
                  // }
                  if (sc.Price == 0) {
                    if (sc.SalesContractROs[0].Items.length > 0)
                      avgPrice =
                        sc.SalesContractROs[0].Items.reduce(
                          (acc, cur) => (acc += cur.Price),
                          0
                        ) / sc.SalesContractROs[0].Items.length;
                    else
                      avgPrice = sc.SalesContractROs.find(
                        (a) => a.RONumber == result.RO_Number
                      ).Price;
                  } else {
                    avgPrice = sc.SalesContractROs[0].Price;
                  }
                  this.data.price = avgPrice;
                  this.data.priceRO = avgPrice;
                  this.data.comodity = result.Comodity;
                  //this.data.amount = sc.Amount;
                  this.data.amount = sc.SalesContractROs[0].Amount;

                  console.log(avgPrice);

                  this.context.context.options.header.section =
                    this.data.section;
                });
            });
        });
      } else {
        this.garmentProductionService
          .getSampleRequestById(newValue.Id)
          .then(async (result) => {
            this.data.roNo = result.RONoSample;
            this.data.article = result.SampleProducts.map((x) => x.Style).join(
              ","
            );
            this.data.buyerBrand = result.Buyer;
            var units = await this.coreService.getSampleUnit({
              size: 1,
              keyword: "SMP1",
              filter: JSON.stringify({ Code: "SMP1" }),
            });
            this.data.unit = units.data[0];

            let uomResult = await this.coreService.getUom({
              size: 1,
              keyword: "PCS",
              filter: JSON.stringify({ Unit: "PCS" }),
            });
            this.data.uom = uomResult.data[0];
            this.uom = uomResult.data[0];
            this.data.valas = "USD";
            this.data.quantity = result.SampleProducts.reduce(
              (acc, cur) => (acc += cur.Quantity),
              0
            );
            this.data.scNo = result.SampleRequestNo;
            this.data.comodityDescription = (result.Comodity || {}).Name;
            //this.data.amount=sc.Amount;
            this.data.price = 0;
            this.data.priceRO = 0;
            this.data.comodity = result.Comodity;
            this.data.amount = 0;
            //this.data.section=result.Section;
            this.data.section = {
              id: (result.Section || {}).Id,
              code: (result.Section || {}).Code,
            };
            this.data.sectionName = "-";

            this.context.context.options.header.section = this.data.section;
          });
      }
    }
  }

  sumSubTotal(opt) {
    let result = 0;
    const newDetails = this.data.details
      .map((d) => {
        return {
          carton1: d.carton1,
          carton2: d.carton2,
          cartonQuantity: d.cartonQuantity,
          grossWeight: d.grossWeight,
          netWeight: d.netWeight,
          netNetWeight: d.netNetWeight,
          index: d.index,
        };
      })
      .filter(
        (value, i, self) =>
          self.findIndex(
            (f) =>
              value.carton1 == f.carton1 &&
              value.carton2 == f.carton2 &&
              value.index == f.index
          ) === i
      );
    for (const detail of newDetails) {
      const cartonExist = false;
      const indexItem = this.context.context.options.header.items.indexOf(
        this.data
      );
      if (indexItem > 0) {
        for (let i = 0; i < indexItem; i++) {
          const item = this.context.context.options.header.items[i];
          for (const prevDetail of item.details) {
            if (
              detail.carton1 == prevDetail.carton1 &&
              detail.carton2 == prevDetail.carton2 &&
              detail.index == prevDetail.index
            ) {
              cartonExist = true;
              break;
            }
          }
        }
      }
      if (!cartonExist) {
        switch (opt) {
          case 0:
            result += detail.grossWeight * detail.cartonQuantity;
            break;
          case 1:
            result += detail.netWeight * detail.cartonQuantity;
            break;
          case 2:
            result += detail.netNetWeight * detail.cartonQuantity;
            break;
        }
      }
    }
    return result;
  }

  get subGrossWeight() {
    return this.sumSubTotal(0);
    //return (this.data.details || []).reduce((acc, cur) => acc += (cur.grossWeight * cur.cartonQuantity), 0);
  }

  get subNetWeight() {
    return this.sumSubTotal(1);
    // return (this.data.details || []).reduce((acc, cur) => acc += cur.netWeight, 0);
  }

  get subNetNetWeight() {
    return this.sumSubTotal(2);
    //  return (this.data.details || []).reduce((acc, cur) => acc += cur.netNetWeight, 0);
  }

  get addDetails() {
    return (event) => {
      const i = this.context.context.items.indexOf(this.context);
      let lastIndex;

      let lastDetail;
      if (this.data.details.length > 0) {
        lastDetail = this.data.details[this.data.details.length - 1];
        lastIndex = this.data.details[this.data.details.length - 1].index;
      } else if (i > 0) {
        const lastItem = this.context.context.items[i - 1];
        lastDetail = lastItem.data.details[lastItem.data.details.length - 1];
      }

      this.data.details.push({
        carton1: lastDetail ? lastDetail.carton2 + 1 : 0,
        index: lastIndex ? lastIndex : 1,
        style: lastDetail ? lastDetail.style : "",
        colour: lastDetail ? lastDetail.colour : "",
        sizes: [],
      });
    };
  }

  get removeDetails() {
    return (event) => {
      this.error = null;
      this.updateTotalSummary();
      this.updateMeasurements();
    };
  }

  updateMeasurements() {
    let measurementCartons = [];
    for (const item of this.context.context.options.header.items) {
      for (const detail of item.details || []) {
        let measurement = measurementCartons.find(
          (m) =>
            m.length == detail.length &&
            m.width == detail.width &&
            m.height == detail.height &&
            m.carton1 == detail.carton1 &&
            m.carton2 == detail.carton2
        );
        if (!measurement) {
          measurementCartons.push({
            carton1: detail.carton1,
            carton2: detail.carton2,
            length: detail.length,
            width: detail.width,
            height: detail.height,
            cartonsQuantity: detail.cartonQuantity,
          });
        }
      }
    }
    let measurements = [];
    for (const measurementCarton of measurementCartons) {
      let measurement = measurements.find(
        (m) =>
          m.length == measurementCarton.length &&
          m.width == measurementCarton.width &&
          m.height == measurementCarton.height
      );
      if (measurement) {
        measurement.cartonsQuantity += measurementCarton.cartonsQuantity;
      } else {
        measurements.push(Object.assign({}, measurementCarton));
      }
    }

    this.context.context.options.header.measurements =
      this.context.context.options.header.measurements || [];
    this.context.context.options.header.measurements.splice(0);

    for (const mt of measurements) {
      let measurement = (
        this.context.context.options.header.measurementsTemp || []
      ).find(
        (m) =>
          m.length == mt.length && m.width == mt.width && m.height == mt.height
      );
      if (measurement) {
        measurement.cartonsQuantity = mt.cartonsQuantity;
        this.context.context.options.header.measurements.push(measurement);
      } else {
        this.context.context.options.header.measurements.push(mt);
      }
    }

    this.context.context.options.header.measurements.forEach(
      (m, i) => (m.MeasurementIndex = i)
    );
  }

  get totalQty() {
    let qty = 0;
    if (this.data.details) {
      for (var detail of this.data.details) {
        if (detail.cartonQuantity && detail.quantityPCS) {
          qty += detail.cartonQuantity * detail.quantityPCS;
        }
      }
    }
    return qty;
  }

  get totalCtn() {
    let qty = 0;
    if (this.data.details) {
      const newDetails = this.data.details
        .map((d) => {
          return {
            carton1: d.carton1,
            carton2: d.carton2,
            cartonQuantity: d.cartonQuantity,
            grossWeight: d.grossWeight,
            netWeight: d.netWeight,
            netNetWeight: d.netNetWeight,
            index: d.index,
          };
        })
        .filter(
          (value, i, self) =>
            self.findIndex(
              (f) =>
                value.carton1 == f.carton1 &&
                value.carton2 == f.carton2 &&
                value.index == f.index
            ) === i
        );
      for (var detail of newDetails) {
        const cartonExist = false;
        const indexItem = this.context.context.options.header.items.indexOf(
          this.data
        );
        if (indexItem > 0) {
          for (let i = 0; i < indexItem; i++) {
            const item = this.context.context.options.header.items[i];
            for (const prevDetail of item.details) {
              if (
                detail.carton1 == prevDetail.carton1 &&
                detail.carton2 == prevDetail.carton2 &&
                detail.index == prevDetail.index
              ) {
                cartonExist = true;
                break;
              }
            }
          }
        }
        if (!cartonExist) {
          qty += detail.cartonQuantity;
        }
      }
    }
    return qty;
  }

  get amount() {
    this.data.amount = 0;
    if (this.data.quantity && this.data.price) {
      this.data.amount = this.data.quantity * this.data.price;
    }
    return this.data.amount;
  }

  updateTotalSummary() {
    this.context.context.options.header.grossWeight = 0;
    this.context.context.options.header.nettWeight = 0;
    this.context.context.options.header.netNetWeight = 0;

    this.data.subGrossWeight = this.sumSubTotal(0);
    this.data.subNetWeight = this.sumSubTotal(1);
    this.data.subNetNetWeight = this.sumSubTotal(2);

    for (const item of this.context.context.options.header.items) {
      this.context.context.options.header.grossWeight +=
        item.subGrossWeight || 0;
      this.context.context.options.header.nettWeight += item.subNetWeight || 0;
      this.context.context.options.header.netNetWeight +=
        item.subNetNetWeight || 0;
    }
  }

  // indexChanged(newValue) {
  //   this.data.details[this.data.details.length - 1].index = newValue;
  // }

  uomChanged(newValue) {
    if (newValue) {
      this.data.uom = newValue;
      this.uom = newValue;
    }
  }

  roTypeChanged(e) {
    let type = e.detail ? e.detail : "";

    if (type) {
      this.data.roType = type;
    }
  }
}
