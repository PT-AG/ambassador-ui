module.exports = [
  {
    route: '/garment-subcon/subcon-contract',
    name: 'subcon-contract',
    moduleId: './modules/garment-subcon/garment-subcon-contract/index',
    nav: true,
    title: 'Subcon Contract',
    auth: true,
    settings: {
      group: "g-subcon",
      subGroup: "kontrak",
      //permission: { "C9": 1, "AG2": 1, "PDU":1 },
      iconClass: 'fa fa-dashboard'
    }
  },
  {
    route: '/garment-subcon/service-subcon-cutting',
    name: 'service-subcon-cutting',
    moduleId: './modules/garment-subcon/garment-service-subcon-cutting/index',
    nav: true,
    title: 'Subcon Jasa - Komponen',
    auth: true,
    settings: {
      group: "g-subcon",
      subGroup: "packing list subcon",
      permission:{"Q1":1},
      // permission: { "C9": 1, "AG2": 1, "PDU":1 },
      iconClass: 'fa fa-dashboard'
    }
  },
  {
    route: '/garment-subcon/service-subcon-sewing',
    name: 'subcon-sewing',
    moduleId: './modules/garment-subcon/garment-service-subcon-sewing/index',
    nav: true,
    title: 'Subcon Jasa - Garment Wash',
    auth: true,
    settings: {
      group: "g-subcon",
      subGroup: "packing list subcon",
      permission:{"Q2":1},
      // permission: { "C9": 1, "AG2": 1, "PDU":1 },
      iconClass: 'fa fa-dashboard'
    }
  },
  {
    route: '/garment-subcon/service-subcon-shrinkage-panel',
    name: 'service-subcon-shrinkage-panel',
    moduleId: './modules/garment-subcon/garment-service-subcon-shrinkage-panel/index',
    nav: true,
    title: 'Subcon BB - Shrinkage / Panel',
    auth: true,
    settings: {
      group: "g-subcon",
      subGroup: "packing list subcon",
      permission:{"Q3":1},
      // permission: { "C9": 1, "AG2": 1, "PDU":1 },
      iconClass: 'fa fa-dashboard'
    }
  },
  {
    route: '/garment-subcon/fabric-wash',
    name: 'subcon-fabric-wash',
    moduleId: './modules/garment-subcon/garment-service-fabric-wash/index',
    nav: true,
    title: 'Subcon BB - Fabric Wash/Print',
    auth: true,
    settings: {
      group: "g-subcon",
      subGroup: "packing list subcon",
      permission:{"Q4":1},
      // permission: { "C9": 1, "AG2": 1, "PDU":1 },
      iconClass: 'fa fa-dashboard'
    }
  },
  {
    route: '/garment-subcon/subcon-delivery-letter-out',
    name: 'subcon-sewing',
    moduleId: './modules/garment-subcon/garment-subcon-delivery-letter-out/index',
    nav: true,
    title: 'Surat Jalan Subcon - Keluar',
    auth: true,
    settings: {
      group: "g-subcon",
      subGroup: "surat jalan subcon",
      permission:{"Q5":1},
      // permission: { "C9": 1, "AG2": 1, "PDU":1 },
      iconClass: 'fa fa-dashboard'
    }
  },
  {
    route: '/garment-subcon/subcon-customs-in',
    name: 'subcon-customs-in',
    moduleId: './modules/garment-subcon/garment-subcon-customs-in/index',
    nav: true,
    title: 'BC Masuk',
    auth: true,
    settings: {
      group: "g-subcon",
      subGroup: "bc subcon",
      //permission: { "C9": 1, "AG2": 1, "PDU":1 },
      iconClass: 'fa fa-dashboard'
    }
  },
  {
    route: '/garment-subcon/subcon-customs-out',
    name: 'subcon-sewing',
    moduleId: './modules/garment-subcon/customs-out/index',
    nav: true,
    title: 'BC Keluar',
    auth: true,
    settings: {
      group: "g-subcon",
      subGroup: "bc subcon",
      //permission: { "C9": 1, "AG2": 1, "PDU":1 },
      iconClass: 'fa fa-dashboard'
    }
  },

  {
    route: '/garment-subcon/garment-realization-subcon',
    name: 'garment-realization-subcon',
    moduleId: './modules/garment-subcon/report/garment-realization-subcon/index',
    nav: true,
    title: 'Realisasi Pengeluaran Subcon',
    auth: true,
    settings: {
      group: "g-subcon",
      subGroup: "laporan",
      //permission: { "C9": 1, "AG2": 1, "PDU":1 },
      iconClass: 'fa fa-dashboard'
    }
  },

  {
    route: '/garment-subcon/report/garment-subcon-contract-report',
    name: 'garment-subcon-contract-report',
    moduleId: './modules/garment-subcon/report/garment-subcon-contract-report/index',
    nav: true,
    title: 'Laporan Rekap Subkon Kontrak',
    auth: true,
    settings: {
      group: "g-subcon",
      subGroup: "laporan",
      //permission: { "C9": 1, "AG2": 1, "PDU":1 },
      iconClass: 'fa fa-dashboard'
    }
  },


]
