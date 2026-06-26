import {
  inject, bindable
} from 'aurelia-framework';
import {
  Service
} from "./service";
import {
  Router
} from 'aurelia-router';
import moment from 'moment';

@inject(Router, Service)
export class List {
  context = ["Update Racking", "Kartu Stelling", "Cetak Barcode"];

  columns = [
    { field: "ProductCode", title: "Kode Barang" },
    { field: "POSerialNumber", title: "Nomor PO" },
    { field: "RO", title: "Nomor RO" },
    { field: "UnitName", title: "Nama Unit" },
    { field: "ProductName", title: "Nama Barang" },
    { field: "RemainingQuantity", title: "Quantity", align: "right" },
    { field: "SmallUomUnit", title: "Satuan" },
    { field: "Colour", title: "Warna" },
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
  //KategoriItems= ['','BAHAN BAKU','BAHAN EMBALANCE','BAHAN PENDUKUNG']

  @bindable UnitItem;
  //UnitItems = ['', 'AMBASSADOR GARMINDO 1', 'AMBASSADOR GARMINDO 2']
  UnitItems = ['','AMBASSADOR GARMINDO'];
  unit = "AG";

  constructor(router, service) {
    this.service = service;
    this.router = router;
    this.savedFilters = this.savedFilters || {};
  }

  async activate(params) {
    if (params && params.filter) {
      this.savedFilters = params.filter;
      this.flag=true;
    }
  }

  tableOptions = {
    showColumns: false,
    search: false,
    showToggle: false,
    sortable: false,
  };

  

  loader = (info) => {
    var params = {
      po: this.po ? this.po :this.savedFilters.po ? this.savedFilters.po : "",
      unitcode: this.unit ? this.unit :this.savedFilters.unitcode ? this.savedFilters.unitcode : "",
      productcode: this.code ? this.code :this.savedFilters.productcode ? this.savedFilters.productcode : "",
      ctg:this.categoryKey?this.categoryKey.key:this.savedFilters.ctg?this.savedFilters.ctg:null
    };
    this.savedFilters = params;
    return this.flag ? this.service.search(params)
      .then((result) => {
        for (var _data of result.data) {
          var unitDO = _data.UnitDOs.map(function (unit) {
            return `<li>
            No : ${unit.UnitDONo}</br>
            Pemohon : ${unit.CreatedBy}</br>
            Quantity : ${unit.DOQuantity}
            </li>`;
          });

          unitDO = unitDO.filter(function (elem, index, self) {
            return index == self.indexOf(elem);
          })

          _data.UnitDO = `<ul>${unitDO.join('')}</ul>`;
        }

        return {
          data: result.data
        };
      }) : { data: [] };
  }

  search() {
    this.error = {};
    this.flag = true;
    this.tableList.refresh();
  }

  contextClickCallback(event) {
    var arg = event.detail;
    var data = arg.data;

    switch (arg.name) {
      case "Update Racking":
        if (data.RemainingQuantity > 0) {
          this.router.navigateToRoute('edit', { id: data.Id, filter: this.savedFilters });
        } else {
          alert("Maaf, Quantity 0 hanya bisa melihat Kartu Stelling");
        } break;
      case "Kartu Stelling":
        this.router.navigateToRoute('stelling', { id: data.Id , filter: this.savedFilters });
        break;
      case "Cetak Barcode":
        this.service.getBarcodeById(data.Id)
          .then((result) => { })
          .catch((e) => { });
        break;
    }
  }

  UnitItemChanged(newvalue) {
    if (newvalue) {
      if (newvalue === "AMBASSADOR GARMINDO 1") {
        this.unit = "AG1";
      } else if (newvalue === "AMBASSADOR GARMINDO 2") {
        this.unit = "AG2";
      } else if (newvalue === "AMBASSADOR GARMINDO") {
        this.unit = "AG";
      } else {
        this.unit = "";
        this.unitname = "";
      }
    } else {
      this.unit = "";
      this.unitname = "";
    }
  }

  ExportToExcel() {
    var params = {
      po: this.po ? this.po :this.savedFilters.po ? this.savedFilters.po : "",
      unitcode: this.unit ? this.unit :this.savedFilters.unitcode ? this.savedFilters.unitcode : "",
      productcode: this.code ? this.code :this.savedFilters.productcode ? this.savedFilters.productcode : "",
      ctg:this.categoryKey?this.categoryKey.key:this.savedFilters.ctg?this.savedFilters.ctg:null
    };

    this.service.generateExcel(params);
  }

  reset() {
    this.po = null;
    this.unit = "AG";
    this.code = null;
    this.data = [];
    this.categoryKey=null;
    this.flag = false;
    this.tableList.refresh();
    this.savedFilters = {};
  }
}
