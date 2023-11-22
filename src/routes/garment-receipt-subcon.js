module.exports = [
  //Transaksi
  {
    route: '/merchandiser/garment-pre-sales-contract-by-user',
    name: 'garment-pre-sales-contract-by-user',
    moduleId: './modules/merchandiser/garment-pre-sales-contract/index',
    nav: true,
    title: "Surat Jalan Subcon",
    auth: true,
    settings: {
      group: "g-receipt-subcon",
      subGroup: "transaksi",
     // permission: { X1: 1 },
      permission:{"V1":1},
      iconClass: "fa fa-calculator",
      byUser: true
    },
  },
  {
    route: '/merchandiser/garment-pre-sales-contract-by-user',
    name: 'garment-pre-sales-contract-by-user',
    moduleId: './modules/merchandiser/garment-pre-sales-contract/index',
    nav: true,
    title: "Bon Terima Unit",
    auth: true,
    settings: {
      group: "g-receipt-subcon",
      subGroup: "transaksi",
     // permission: { X1: 1 },
      permission:{"V2":1},
      iconClass: "fa fa-calculator",
      byUser: true
    },
  },
  {
    route: '/merchandiser/garment-pre-sales-contract-by-user',
    name: 'garment-pre-sales-contract-by-user',
    moduleId: './modules/merchandiser/garment-pre-sales-contract/index',
    nav: true,
    title: "Bon Terima Unit (Semua User)",
    auth: true,
    settings: {
      group: "g-receipt-subcon",
      subGroup: "transaksi",
     // permission: { X1: 1 },
      permission:{"V3":1},
      iconClass: "fa fa-calculator",
      byUser: true
    },
  },
  {
    route: '/merchandiser/garment-pre-sales-contract-by-user',
    name: 'garment-pre-sales-contract-by-user',
    moduleId: './modules/merchandiser/garment-pre-sales-contract/index',
    nav: true,
    title: "Unit Delivery Order",
    auth: true,
    settings: {
      group: "g-receipt-subcon",
      subGroup: "transaksi",
     // permission: { X1: 1 },
      permission:{"V4":1},
      iconClass: "fa fa-calculator",
      byUser: true
    },
  },
  {
    route: '/merchandiser/garment-pre-sales-contract-by-user',
    name: 'garment-pre-sales-contract-by-user',
    moduleId: './modules/merchandiser/garment-pre-sales-contract/index',
    nav: true,
    title: "Unit Delivery Order (Semua User)",
    auth: true,
    settings: {
      group: "g-receipt-subcon",
      subGroup: "transaksi",
     // permission: { X1: 1 },
      permission:{"V5":1},
      iconClass: "fa fa-calculator",
      byUser: true
    },
  },
  {
    route: '/merchandiser/garment-pre-sales-contract-by-user',
    name: 'garment-pre-sales-contract-by-user',
    moduleId: './modules/merchandiser/garment-pre-sales-contract/index',
    nav: true,
    title: "Bon Pengeluaran Unit",
    auth: true,
    settings: {
      group: "g-receipt-subcon",
      subGroup: "transaksi",
     // permission: { X1: 1 },
      permission:{"V6":1},
      iconClass: "fa fa-calculator",
      byUser: true
    },
  },
];
