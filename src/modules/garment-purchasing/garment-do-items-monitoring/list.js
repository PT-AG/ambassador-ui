import { inject, bindable } from 'aurelia-framework';
import { Service } from "./service";
import { Router } from 'aurelia-router';
import moment from 'moment';

var URNLoader = require("../../../loader/garment-unit-receipt-note-loader");

const UNIT_CODE_MAP = {
  "AMBASSADOR GARMINDO 1": "AG1",
  "AMBASSADOR GARMINDO 2": "AG2",
  "AMBASSADOR GARMINDO": "AG",
};

const formatLot = value =>
  value && value.toString().trim() !== "" && value.toString().trim() !== "-" && value !== 0 && value !== "0"
    ? value
    : "-";

const formatBatch = value =>
  value ? moment.parseZone(value).utcOffset(7).format("YYYY-MM-DD") : "-";

@inject(Router, Service)
export class List {
  context = ["Kartu Stelling"];

  columns = [
    { field: "PackageNo", title: "No Package" },
    { field: "ProductCode", title: "Kode Barang" },
    { field: "POSerialNumber", title: "Nomor PO" },
    { field: "RO", title: "Nomor RO" },
    { field: "URNNo", title: "No Bon Terima" },
    { field: "UnitName", title: "Nama Unit" },
    { field: "ProductName", title: "Nama Barang" },
    { field: "RemainingQuantity", title: "Quantity", align: "right" },
    { field: "SmallUomUnit", title: "Satuan" },
    { field: "Colour", title: "Warna" },
    { field: "Width", title: "Lebar" },
    { field: "Lot", title: "Lot", formatter: formatLot },
    { field: "Batch", title: "Batch", formatter: formatBatch },
    { field: "HandlingUnit", title: "Handling Unit" },
    { field: "Rack", title: "Rak" },
    { field: "Level", title: "Level" },
    { field: "Box", title: "Box" },
    { field: "Area", title: "Area" },
    { field: "UnitDO", title: "Pending" }
  ];

  category = [
    { key: null, value: '' },
    { key: "BB", value: 'BAHAN BAKU' },
    { key: "BE", value: 'BAHAN EMBALANCE' },
    { key: "BP", value: 'BAHAN PENDUKUNG' }
  ];

  @bindable UnitItem;
  UnitItems = ['', 'AMBASSADOR GARMINDO'];

  get urnLoader() {
    return URNLoader;
  }

  constructor(router, service) {
    this.service = service;
    this.router = router;
    this.savedFilters = this.savedFilters || {};
  }

  async activate(params) {
    if (params && params.filter) {
      this.savedFilters = params.filter;
      this.flag = true;
    }
  }

  tableOptions = {
    showColumns: false,
    search: false,
    showToggle: false,
    sortable: false,
  };

  buildFilterParams() {
    const saved = this.savedFilters || {};
    const urnValue = this.urn ? (this.urn.URNNo || this.urn) : saved.urn;

    return {
      po: this.po || saved.po || "",
      unitcode: this.unit || saved.unitcode || "",
      productcode: this.code || saved.productcode || "",
      ctg: (this.categoryKey && this.categoryKey.key) || saved.ctg || null,
      urn: urnValue || null,
    };
  }

  loader = () => {
    const params = this.buildFilterParams();
    this.savedFilters = params;

    if (!this.flag) {
      return { data: [] };
    }

    return this.service.search(params).then((result) => {
      for (const _data of result.data) {
        const unitDO = (_data.UnitDOs || [])
          .map(unit => `<li>
            No : ${unit.UnitDONo}</br>
            Pemohon : ${unit.CreatedBy}</br>
            Quantity : ${unit.DOQuantity}
            </li>`)
          .filter((elem, index, self) => index === self.indexOf(elem));

        _data.UnitDO = `<ul>${unitDO.join('')}</ul>`;
      }

      return { data: result.data };
    });
  }

  search() {
    this.error = {};
    this.flag = true;
    this.tableList.refresh();
  }

  contextClickCallback(event) {
    const { name, data } = event.detail;

    if (name === "Kartu Stelling") {
      this.router.navigateToRoute('stelling', { id: data.Id, filter: this.savedFilters });
    }
  }

  UnitItemChanged(newValue) {
    this.unit = UNIT_CODE_MAP[newValue] || "";
    if (!this.unit) {
      this.unitname = "";
    }
  }

  ExportToExcel() {
    this.service.generateExcel(this.buildFilterParams());
  }

  reset() {
    this.po = null;
    this.unit = null;
    this.code = null;
    this.urn = null;
    this.data = [];
    this.categoryKey = null;
    this.flag = false;
    this.tableList.refresh();
    this.savedFilters = {};
  }
}
