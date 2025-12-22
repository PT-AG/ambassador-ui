import { inject, bindable, computedFrom } from 'aurelia-framework';
import { SalesService } from "../service";
var CostCalculationLoader = require("../../../../loader/cost-calculation-garment-loader");
var UomLoader = require("../../../../loader/uom-loader");
var UnitLoader = require("../../../../loader/unit-loader");

@inject(SalesService)
export class Item {
    @bindable selectedRO;
    @bindable avG_GW;
    @bindable avG_NW;

    constructor(salesService) {
        this.salesService = salesService;
    }

    get filter() {
        let section = {};
        if (this.context.context.options.header.items && this.context.context.options.header.items.length > 0) {
            section = (this.context.context.options.header.items.find(i => i.section && (i.section.code || i.section.Code)) || {}).section || {};
        }

        var filter = {
            BuyerCode: this.data.BuyerCode,
            //Section: section.code || section.Code,
            "SCGarmentId!=null": true
        };
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
        return CostCalculationLoader;
    }

    roView = (costCal) => {
        return `${costCal.RO_Number}`
    }

    get uomLoader() {
        return UomLoader;
    }

    uomView = (uom) => {
        return `${uom.Unit || uom.unit}`
    }

    get unitLoader() {
        return UnitLoader;
    }

    get unitFilter() {
        return { "(Code == \"C2A\" || Code == \"C2B\" || Code == \"C2C\" || Code == \"C1A\" || Code == \"C1B\")": true };
    }

    unitView = (unit) => {
        return `${unit.Code || unit.code}`
    }

    toggle() {
        if (!this.isShowing)
            this.isShowing = true;
        else
            this.isShowing = !this.isShowing;
    }

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
            item : this.data,
            sizes : this.data.sizes
        };
        if (this.data.roNo) {
            this.selectedRO = {
                RO_Number: this.data.RONo || this.data.roNo
            };
        }

        this.isShowing = false;
        if (this.error && this.error.Details && this.error.Details.length > 0) {
            this.isShowing = true;
        }

        this.avG_GW = this.data.avG_GW;
        this.avG_NW = this.data.avG_NW;
        if (this.data.detailRows) {
          this.buildDetailsColumns();
        }
    }

    selectedROChanged(newValue) {
        if (newValue) {
            this.salesService.getCostCalculationById(newValue.Id)
                .then(result => {
                    this.salesService.getSalesContractById(result.SCGarmentId)
                        .then(sc => {
                            this.salesService.getPreSalesContractById(result.PreSCId)
                                .then(psc => {
                                    this.data.roNo = result.RO_Number;
                                    this.data.article = result.Article;
                                    this.data.marketingName = result.MarketingName;
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
                                    this.data.valas = "USD";
                                    this.data.quantity = result.Quantity;
                                    this.data.scNo = sc.SalesContractNo;
                                    //this.data.amount=sc.Amount;
                                    this.data.price = sc.Price;
                                    this.data.priceRO = sc.Price;
                                    this.data.comodity = result.Comodity;
                                    this.data.amount = sc.Amount;
                                });
                        })
                });
        }
    }

    sumSubTotal(opt) {
      let result = 0;
      const newDetails = this.data.details.map(d => {
        return {
          carton1: d.carton1,
          carton2: d.carton2,
          cartonQuantity: d.cartonQuantity,
          grossWeight: d.grossWeight,
          netWeight: d.netWeight,
          netNetWeight: d.netNetWeight,
          index: d.index
        };
      }).filter((value, index, self) => self.findIndex(f => value.carton1 == f.carton1 && value.carton2 == f.carton2 && value.index == f.index) === index);
      for (const detail of newDetails) {
        const cartonExist = false;
        const indexItem = this.context.context.options.header.items.indexOf(this.data);
        if (indexItem > 0) {
          for (let i = 0; i < indexItem; i++) {
            const item = this.context.context.options.header.items[i];
            for (const prevDetail of item.details) {
              if (detail.carton1 == prevDetail.carton1 && detail.carton2 == prevDetail.carton2 && detail.index == prevDetail.index) {
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

    avG_GWChanged(newValue) {
        this.data.avG_GW = newValue;
        this.updateGrossWeight();
    }

    updateGrossWeight() {
        this.context.context.options.header.grossWeight = this.context.context.options.header.items.reduce((acc, cur) => acc += cur.avG_GW, 0);
    }

    avG_NWChanged(newValue) {
        this.data.avG_NW = newValue;
        this.updateNettWeight();
    }

    updateNettWeight() {
        this.context.context.options.header.nettWeight = this.context.context.options.header.items.reduce((acc, cur) => acc += cur.avG_NW, 0);
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
        const newDetails = this.data.details.map(d => {
          return {
            carton1: d.carton1,
            carton2: d.carton2,
            cartonQuantity: d.cartonQuantity,
            grossWeight: d.grossWeight,
            netWeight: d.netWeight,
            netNetWeight: d.netNetWeight,
            index: d.index
          };
        }).filter((value, i, self) => self.findIndex(f => value.carton1 == f.carton1 && value.carton2 == f.carton2 && value.index == f.index) === i);
        for (var detail of newDetails) {
          const cartonExist = false;
          const indexItem = this.context.context.options.header.items.indexOf(this.data);
          if (indexItem > 0) {
            for (let i = 0; i < indexItem; i++) {
              const item = this.context.context.options.header.items[i];
              for (const prevDetail of item.details) {
                if (detail.carton1 == prevDetail.carton1 && detail.carton2 == prevDetail.carton2 && detail.index == prevDetail.index) {
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
            this.data.amount = this.data.quantity * this.data.price
        }
        return this.data.amount;
    }

    get subGrossWeight() {
      return this.sumSubTotal(0);
    }
  
    get subNetWeight() {
      return this.sumSubTotal(1);
    }
  
    get subNetNetWeight() {
      return this.sumSubTotal(2);
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
}
