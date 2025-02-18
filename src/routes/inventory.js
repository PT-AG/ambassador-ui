module.exports = [
  {
    route: "inventory/balance-stock-date-master",
    name: "inventory/balance-stock-date-master",
    moduleId: "modules/inventory/balance-stock-date-master/index",
    nav: true,
    title: "Master Tanggal Stock Opname",
    auth: true,
    settings: {
      group: "Inventory",
      // permission: { "C9": 1, "PG": 1, "PDU":1 },
      permission: { G1: 1 },
      subGroup: "gudang sisa garment",
      iconClass: "fa fa-dashboard",
    },
  },
  {
    route: "inventory/garment/leftover-warehouse/receipt/fabric",
    name: "inventory/garment/leftover-warehouse/receipt/fabric",
    moduleId:
      "modules/inventory/garment-leftover-warehouse/receipt/fabric/index",
    nav: true,
    title: "Penerimaan Gudang Sisa - FABRIC",
    auth: true,
    settings: {
      group: "Inventory",
      // permission: { "C9": 1, "PG": 1, "PDU":1 },
      permission: { G2: 1 },
      subGroup: "gudang sisa garment",
      iconClass: "fa fa-dashboard",
    },
  },
  {
    route: "inventory/garment/leftover-warehouse/receipt/accessories",
    name: "inventory/garment/leftover-warehouse/receipt/accessories",
    moduleId:
      "modules/inventory/garment-leftover-warehouse/receipt/accessories/index",
    nav: true,
    title: "Penerimaan Gudang Sisa - ACCESSORIES",
    auth: true,
    settings: {
      group: "Inventory",
      // permission: { "C9": 1, "PG": 1, "PDU":1 },
      permission: { G3: 1 },
      subGroup: "gudang sisa garment",
      iconClass: "fa fa-dashboard",
    },
  },
  {
    route: "inventory/garment/leftover-warehouse/receipt/finished-good",
    name: "inventory/garment/leftover-warehouse/receipt/finished-good",
    moduleId:
      "modules/inventory/garment-leftover-warehouse/receipt/finished-good/index",
    nav: true,
    title: "Penerimaan Gudang Sisa - BARANG JADI",
    auth: true,
    settings: {
      group: "Inventory",
      // permission: { "C9": 1, "PG": 1, "PDU":1 },
      permission: { G4: 1 },
      subGroup: "gudang sisa garment",
      iconClass: "fa fa-dashboard",
    },
  },
  {
    route: "inventory/garment/leftover-warehouse/receipt/aval",
    name: "inventory/garment/leftover-warehouse/receipt/aval",
    moduleId: "modules/inventory/garment-leftover-warehouse/receipt/aval/index",
    nav: true,
    title: "Penerimaan Gudang Sisa - AVAL",
    auth: true,
    settings: {
      group: "Inventory",
      // permission: { "C9": 1, "PG": 1, "PDU":1 },
      permission: { G5: 1 },
      subGroup: "gudang sisa garment",
      iconClass: "fa fa-dashboard",
    },
  },
  // {
  //     route: 'inventory/reports/inventory-dystuff-report',
  //     name: 'inventory/reports/inventory-dystuff-report',
  //     moduleId: './modules/inventory/reports/inventory-dystuff-report/index',
  //     nav: true,
  //     title: 'Laporan Stock Gudang Dyeing Printing',
  //     auth: true,
  //     settings: {
  //         group: "Inventory",
  //         permission: { "*": 1 },
  //         iconClass: 'fa fa-dashboard'
  //     }
  // },
  {
    route: "inventory/garment/leftover-warehouse/expenditure/fabric",
    name: "inventory/garment/leftover-warehouse/expenditure/fabric",
    moduleId:
      "modules/inventory/garment-leftover-warehouse/expenditure/fabric/index",
    nav: true,
    title: "Pengeluaran Gudang Sisa - FABRIC",
    auth: true,
    settings: {
      group: "Inventory",
      // permission: { "C9": 1, "PG": 1, "PDU":1 },
      permission: { G6: 1 },
      subGroup: "gudang sisa garment",
      iconClass: "fa fa-dashboard",
    },
  },
  {
    route: "inventory/garment/leftover-warehouse/expenditure/accessories",
    name: "inventory/garment/leftover-warehouse/expenditure/accessories",
    moduleId:
      "modules/inventory/garment-leftover-warehouse/expenditure/accessories/index",
    nav: true,
    title: "Pengeluaran Gudang Sisa - ACCESSORIES",
    auth: true,
    settings: {
      group: "Inventory",
      // permission: { "C9": 1, "PG": 1, "PDU":1 },
      permission: { G7: 1 },
      subGroup: "gudang sisa garment",
      iconClass: "fa fa-dashboard",
    },
  },
  {
    route: "inventory/garment/leftover-warehouse/expenditure/finished-good",
    name: "inventory/garment/leftover-warehouse/expenditure/finished-good",
    moduleId:
      "modules/inventory/garment-leftover-warehouse/expenditure/finished-good/index",
    nav: true,
    title: "Pengeluaran Gudang Sisa - BARANG JADI",
    auth: true,
    settings: {
      group: "Inventory",
      // permission: { "C9": 1, "PG": 1, "PDU":1 },
      permission: { G8: 1 },
      subGroup: "gudang sisa garment",
      iconClass: "fa fa-dashboard",
    },
  },
  {
    route: "inventory/garment/leftover-warehouse/expenditure/aval",
    name: "inventory/garment/leftover-warehouse/expenditure/aval",
    moduleId:
      "modules/inventory/garment-leftover-warehouse/expenditure/aval/index",
    nav: true,
    title: "Pengeluaran Gudang Sisa - AVAL",
    auth: true,
    settings: {
      group: "Inventory",
      // permission: { "C9": 1, "PG": 1, "PDU":1 },
      permission: { G9: 1 },
      subGroup: "gudang sisa garment",
      iconClass: "fa fa-dashboard",
    },
  },
  {
    route: "inventory/garment/leftover-warehouse/customs-out",
    name: "inventory/garment/leftover-warehouse/customs-out",
    moduleId: "modules/inventory/customs-out/index",
    nav: true,
    title: "BC Keluar",
    auth: true,
    settings: {
      group: "Inventory",
      permission: { G27: 1 },
      subGroup: "gudang sisa garment",
      iconClass: "fa fa-dashboard",
    },
  },
  {
    route: "inventory/garment/leftover-warehouse/master/comodity",
    name: "inventory/garment/leftover-warehouse/master/comodity",
    moduleId:
      "modules/inventory/garment-leftover-warehouse/master/comodity/index",
    nav: true,
    title: "Master Komoditi Gudang Sisa",
    auth: true,
    settings: {
      group: "Inventory",
      permission: { G10: 1 },
      // permission: { "C9": 1, "B1": 1, "PG": 1, "PDU":1 },
      subGroup: "gudang sisa garment",
      iconClass: "fa fa-dashboard",
    },
  },
  {
    route: "inventory/garment/leftover-warehouse/master/buyer",
    name: "inventory/garment/leftover-warehouse/master/buyer",
    moduleId:
      "modules/inventory/garment-leftover-warehouse/master/garment-leftover-warehouse-buyer/index",
    nav: true,
    title: "Buyer Gudang Sisa Garment",
    auth: true,
    settings: {
      group: "Inventory",
      permission: { G11: 1 },
      // permission: { "C9": 1, "B1": 1, "PG": 1, "PDU":1 },
      subGroup: "gudang sisa garment",
      iconClass: "fa fa-dashboard",
    },
  },
  {
    route: "inventory/garment/leftover-warehouse/report/receipt-monitoring",
    name: "inventory/garment/leftover-warehouse/report/receipt-monitoring",
    moduleId:
      "modules/inventory/garment-leftover-warehouse/receipt/report/fabric-accessories/index",
    nav: true,
    title: "Report Penerimaan Gudang Sisa Fabric dan Accessories",
    auth: true,
    settings: {
      group: "Inventory",
      permission: { G12: 1 },
      // permission: { C9: 1, "PG": 1, "PDU":1 },
      subGroup: "gudang sisa garment",
      iconClass: "fa fa-dashboard",
    },
  },
  {
    route:
      "inventory/garment/leftover-warehouse/report/expenditure-finished-goods",
    name: "inventory/garment/leftover-warehouse/report/expenditure-finished-goods",
    moduleId:
      "modules/inventory/garment-leftover-warehouse/receipt/report/finished-good/index",
    nav: true,
    title: "Report Penerimaan Gudang Sisa - Barang Jadi",
    auth: true,
    settings: {
      group: "Inventory",
      permission: { G13: 1 },
      // permission: { C9: 1, "PG": 1, "PDU":1 },
      subGroup: "gudang sisa garment",
      iconClass: "fa fa-dashboard",
    },
  },
  {
    route:
      "inventory/garment/leftover-warehouse/report/aval-receipt-monitoring",
    name: "inventory/garment/leftover-warehouse/report/aval-receipt-monitoring",
    moduleId:
      "modules/inventory/garment-leftover-warehouse/receipt/report/aval/index",
    nav: true,
    title: "Report Penerimaan Gudang Sisa Aval",
    auth: true,
    settings: {
      group: "Inventory",
      permission: { G14: 1 },
      // permission: { C9: 1, "PG": 1 , "PDU":1},
      subGroup: "gudang sisa garment",
      iconClass: "fa fa-dashboard",
    },
  },
  {
    route:
      "inventory/garment/leftover-warehouse/reports/expenditure-leftover-report",
    name: "inventory/garment/leftover-warehouse/reports/expenditure-leftover-report",
    moduleId:
      "modules/inventory/garment-leftover-warehouse/reports/expenditure-leftover-report/index",
    nav: true,
    title: "Report Pengeluaran Gudang Sisa - Fabric dan Accessories",
    auth: true,
    settings: {
      group: "Inventory",
      permission: { G15: 1 },
      // permission: { "C9": 1, "PG": 1, "PDU":1 },
      subGroup: "gudang sisa garment",
      iconClass: "fa fa-dashboard",
    },
  },
  {
    route:
      "inventory/garment/leftover-warehouse/expenditure/report/finished-good",
    name: "inventory/garment/leftover-warehouse/expenditure/report/finished-good",
    moduleId:
      "modules/inventory/garment-leftover-warehouse/expenditure/report/finished-good/index",
    nav: true,
    title: "Report Pengeluaran Gudang Sisa - Barang Jadi",
    auth: true,
    settings: {
      group: "Inventory",
      permission: { G16: 1 },
      // permission: { C9: 1, "PG": 1, "PDU":1 },
      subGroup: "gudang sisa garment",
      iconClass: "fa fa-dashboard",
    },
  },
  {
    route: "inventory/garment/leftover-warehouse/expenditure/report/aval",
    name: "inventory/garment/leftover-warehouse/expenditure/report/aval",
    moduleId:
      "modules/inventory/garment-leftover-warehouse/expenditure/report/aval/index",
    nav: true,
    title: "Report Pengeluaran Gudang Sisa - Aval",
    auth: true,
    settings: {
      group: "Inventory",
      // permission: { C9: 1, "PG": 1, "PDU":1 },
      permission: { G17: 1 },
      subGroup: "gudang sisa garment",
      iconClass: "fa fa-dashboard",
    },
  },
  {
    route: "inventory/garment/leftover-warehouse/balance-stock/report/fabric",
    name: "inventory/garment/leftover-warehouse/balance-stock/report/fabric",
    moduleId:
      "modules/inventory/garment-leftover-warehouse/balance-stock/report/fabric/index",
    nav: true,
    title: "Report Stock Gudang Sisa - FABRIC",
    auth: true,
    settings: {
      group: "Inventory",
      permission: { G18: 1 },
      // permission: { C9: 1, "PG": 1, "PDU":1 },
      subGroup: "gudang sisa garment",
      iconClass: "fa fa-dashboard",
    },
  },
  {
    route: "inventory/garment/leftover-warehouse/balance-stock/report/acc",
    name: "inventory/garment/leftover-warehouse/balance-stock/report/acc",
    moduleId:
      "modules/inventory/garment-leftover-warehouse/balance-stock/report/acc/index",
    nav: true,
    title: "Report Stock Gudang Sisa - ACCESSORIES",
    auth: true,
    settings: {
      group: "Inventory",
      permission: { G19: 1 },
      // permission: { C9: 1, "PG": 1, "PDU":1 },
      subGroup: "gudang sisa garment",
      iconClass: "fa fa-dashboard",
    },
  },
  {
    route:
      "inventory/garment/leftover-warehouse/balance-stock/report/finished-good",
    name: "inventory/garment/leftover-warehouse/balance-stock/report/finished-good",
    moduleId:
      "modules/inventory/garment-leftover-warehouse/balance-stock/report/finished-good/index",
    nav: true,
    title: "Report Stock Gudang Sisa - Barang Jadi",
    auth: true,
    settings: {
      group: "Inventory",
      permission: { G20: 1 },
      // permission: { C9: 1, "PG": 1, "PDU":1 },
      subGroup: "gudang sisa garment",
      iconClass: "fa fa-dashboard",
    },
  },
  {
    route: "inventory/garment/leftover-warehouse/balance-stock/report/aval",
    name: "inventory/garment/leftover-warehouse/balance-stock/report/aval",
    moduleId:
      "modules/inventory/garment-leftover-warehouse/balance-stock/report/aval/index",
    nav: true,
    title: "Report Stock Gudang Sisa - Aval",
    auth: true,
    settings: {
      group: "Inventory",
      permission: { G21: 1 },
      // permission: { C9: 1, "PG": 1, "PDU":1 },
      subGroup: "gudang sisa garment",
      iconClass: "fa fa-dashboard",
    },
  },
  {
    route: "inventory/garment/leftover-warehouse/balance-stock",
    name: "inventory/garment/leftover-warehouse/balance-stock",
    moduleId:
      "modules/inventory/garment-leftover-warehouse/balance-stock/index",
    nav: true,
    title: "Balance Stok Gudang Sisa",
    auth: true,
    settings: {
      group: "Inventory",
      permission: { G22: 1 },
      // permission: { C9: 1, "PG": 1, "PDU":1 },
      subGroup: "gudang sisa garment",
      iconClass: "fa fa-dashboard",
    },
  },

  {
    route:
      "inventory/garment/leftover-warehouse/balance-stock/reports/bookkeeping/recap-stock",
    name: "inventory/garment/leftover-warehouse/balance-stock/reports/bookkeeping/recap-stock",
    moduleId:
      "modules/inventory/garment-leftover-warehouse/reports/bookkeeping/recap-stock/index",
    nav: true,
    title: "Report Rekap Persediaan Gudang Sisa",
    auth: true,
    settings: {
      group: "Inventory",
      permission: { G23: 1 },
      // permission: { C9: 1, "PG": 1, "PDU":1 },
      subGroup: "gudang sisa garment",
      iconClass: "fa fa-dashboard",
    },
  },
  {
    route:
      "inventory/garment/leftover-warehouse/reports/bookkeeping/flow-stock",
    name: "inventory/garment/leftover-warehouse/reports/bookkeeping/flow-stock",
    moduleId:
      "modules/inventory/garment-leftover-warehouse/reports/bookkeeping/flow-stock/index",
    nav: true,
    title: "Report FLow Persediaan Gudang Sisa",
    auth: true,
    settings: {
      group: "Inventory",
      permission: { G24: 1 },
      // permission: { C9: 1, "PG": 1, "PDU":1 },
      subGroup: "gudang sisa garment",
      iconClass: "fa fa-dashboard",
    },
  },
  {
    route:
      "inventory/garment/leftover-warehouse/balance-stock/reports/bookkeeping/detail",
    name: "inventory/garment/leftover-warehouse/balance-stock/reports/bookkeeping/detail",
    moduleId:
      "modules/inventory/garment-leftover-warehouse/reports/bookkeeping/detail/index",
    nav: true,
    title: "Report Detail Persediaan Gudang Sisa",
    auth: true,
    settings: {
      group: "Inventory",
      permission: { G25: 1 },
      // permission: { C9: 1, "PG": 1, "PDU":1 },
      subGroup: "gudang sisa garment",
      iconClass: "fa fa-dashboard",
    },
  },
  {
    route:
      "inventory/garment/leftover-warehouse/reports/bookkeeping/bookkeeping-stock",
    name: "inventory/garment/leftover-warehouse/reports/bookkeeping/bookkeeping-stock",
    moduleId:
      "modules/inventory/garment-leftover-warehouse/reports/bookkeeping/bookkeeping-stock/index",
    nav: true,
    title: "Report Stock Gudang Sisa",
    auth: true,
    settings: {
      group: "Inventory",
      permission: { G26: 1 },
      // permission: { C9: 1, "PG": 1, "PDU":1 },
      subGroup: "gudang sisa garment",
      iconClass: "fa fa-dashboard",
    },
  },
];
