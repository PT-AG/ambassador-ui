module.exports = [
    {
        route: '/merchandiser/garment-pre-sales-contract-by-user',
        name: 'garment-pre-sales-contract-by-user',
        moduleId: './modules/merchandiser/garment-pre-sales-contract/index',
        nav: true,
        title: 'Pre Sales Contract - Garment',
        auth: true,
        settings: {
            group: "merchandiser",
            subGroup: "transaksi",
            // permission: { "PGA": 2, "PDU": 1, "C9": 1 },
            permission:{"L1":1},
            iconClass: 'fa fa-calculator',
            byUser: true
        }
    },
    {
        route: '/merchandiser/garment-pre-sales-contract',
        name: 'garment-pre-sales-contract',
        moduleId: './modules/merchandiser/garment-pre-sales-contract/index',
        nav: true,
        title: 'Pre Sales Contract - Garment (Semua User)',
        auth: true,
        settings: {
            group: "merchandiser",
            subGroup: "transaksi",
            permission:{"L2":1}, 
            // permission: { "PGA": 2, "PDU": 1, "C9": 1 },
            iconClass: 'fa fa-calculator',
            byUser: false
        }
    },
    {
        route: '/merchandiser/monitoring-pre-sales-contract',
        name: 'monitoring-pre-sales-contract',
        moduleId: './modules/merchandiser/report/monitoring-pre-sales-contract/index',
        nav: true,
        title: 'Monitoring Pre Sales Contract',
        auth: true,
        settings: {
            group: "merchandiser",
            subGroup: "monitoring",
            permission:{"L12":1},
            // permission: { "PGA": 2, "PDU": 1, "C9": 1 },
            iconClass: 'fa fa-dashboard'
        }
    },
    {
        route: '/merchandiser/garment-purchase-request-master-by-user',
        name: 'purchase-request-master-by-user',
        moduleId: './modules/merchandiser/garment-purchase-request-master/index',
        nav: true,
        title: 'PR Master',
        auth: true,
        settings: {
            group: "merchandiser",
            subGroup: "transaksi",
            permission:{"L3":1},
            // permission: { "PGA": 2, "C9": 1, "PDU": 1 },
            iconClass: 'fa fa-calculator',
            byUser: true
        }
    },
    {
        route: '/merchandiser/garment-purchase-request-master',
        name: 'purchase-request-master',
        moduleId: './modules/merchandiser/garment-purchase-request-master/index',
        nav: true,
        title: 'PR Master (Semua User)',
        auth: true,
        settings: {
            group: "merchandiser",
            subGroup: "transaksi",
            permission:{"L4":1},
            // permission: { "PGA": 2, "C9": 1, "PDU": 1 },
            iconClass: 'fa fa-calculator',
            byUser: false
        }
    },
    {
        route: '/merchandiser/approve-pr-master/kabag-md',
        name: 'approve-purchase-request-master',
        moduleId: './modules/merchandiser/approve-pr-master/index',
        nav: true,
        title: 'Approval PR Master - Kasie MD',
        auth: true,
        settings: {
            group: "merchandiser",
            subGroup: "approval",
            permission:{"L30":1},
            // permission: { "PGA": 3, "C9": 1, "PDU": 1 },
            iconClass: 'fa fa-calculator',
            type: "MD1"
        }
    },
    {
        route: '/merchandiser/approve-pr-master/kadiv-md',
        name: 'approve-purchase-request-master',
        moduleId: './modules/merchandiser/approve-pr-master/index',
        nav: true,
        title: 'Approval PR Master - Kabag/Kasie Penjualan',
        auth: true,
        settings: {
            group: "merchandiser",
            subGroup: "approval",
            permission:{"L31":1},
            // permission: { "KM": 3, "C9": 1, "PDU": 1 },
            iconClass: 'fa fa-calculator',
            type: "MD2"
        }
    },
    {
        route: '/merchandiser/approve-pr-master/purchasing',
        name: 'approve-purchase-request-master',
        moduleId: './modules/merchandiser/approve-pr-master/index',
        nav: true,
        title: 'Approval PR Master - Kabag/Kasie Purchasing',
        auth: true,
        settings: {
            group: "merchandiser",
            subGroup: "approval",
            permission:{"L32":1},
            // permission: { "PG": 3, "C9": 1, "PDU": 1 },
            iconClass: 'fa fa-calculator',
            type: "Purchasing"
        }
    },
    {
        route: '/merchandiser/cost-calculation-by-user',
        name: 'cost-calculation-by-user',
        moduleId: './modules/merchandiser/cost-calculation/index',
        nav: true,
        title: 'Cost Calculation Garment',
        auth: true,
        settings: {
            group: "merchandiser",
            subGroup: "transaksi",
            permission:{"L5":1},            
            // permission: { "PGA": 2, "C9": 1, "PDU": 1 },
            iconClass: 'fa fa-calculator',
            byUser: true
        }
    },
    {
        route: '/merchandiser/cost-calculation',
        name: 'cost-calculation',
        moduleId: './modules/merchandiser/cost-calculation/index',
        nav: true,
        title: 'Cost Calculation Garment (Semua User)',
        auth: true,
        settings: {
            group: "merchandiser",
            subGroup: "transaksi",
            permission:{"L6":1},
            // permission: { "PGA": 2, "C9": 1, "PDU": 1, "B7": 1 },
            iconClass: 'fa fa-calculator',
            byUser: false
        }
    },
    {
        route: '/merchandiser/cost-calculation-approval/marketing',
        name: 'cost-calculation-approval-marketing',
        moduleId: './modules/merchandiser/cost-calculation-approval/index',
        nav: true,
        title: 'Cost Calculation Approval - Marketing',
        auth: true,
        settings: {
            group: "merchandiser",
            subGroup: "approval",
            permission:{"L33":1},
            // permission: { "MK": 2, "PDU": 1, "C9": 1 },
            iconClass: 'fa fa-calculator',
            type: "PPIC"
        }
    },
    {
        route: '/merchandiser/cost-calculation-approval/md',
        name: 'cost-calculation-approval-md',
        moduleId: './modules/merchandiser/cost-calculation-approval/index',
        nav: true,
        title: 'Cost Calculation Approval - Kabag/Kasie MD',
        auth: true,
        settings: {
            group: "merchandiser",
            subGroup: "approval",
            permission:{"L34":1},
            // permission: { "PGA": 3, "C9": 1, "PDU": 1 },
            iconClass: 'fa fa-calculator',
            type: "md"
        }
    },
    {
        route: '/merchandiser/cost-calculation-approval/kadivmd',
        name: 'cost-calculation-approval-kadivmd',
        moduleId: './modules/merchandiser/cost-calculation-approval/index',
        nav: true,
        title: 'Cost Calculation Approval - Direktur Penjualan',
        auth: true,
        settings: {
            group: "merchandiser",
            subGroup: "approval",
            permission:{"L35":1},
            // permission: { "PGA": 4, "PDU": 1, "C9": 1 },
            iconClass: 'fa fa-calculator',
            type: "kadivmd"
        }
    },
    {
        route: '/merchandiser/budget-validation-ie',
        name: 'budget-validation-ie',
        moduleId: './modules/merchandiser/cost-calculation-approval/index',
        nav: true,
        title: 'Validasi Budget - IE',
        auth: true,
        settings: {
            group: "merchandiser",
            subGroup: "approval",
            permission:{"L36":1},
            // permission: { "IE": 2, "PDU": 1, "C9": 1 },
            iconClass: 'fa fa-calculator',
            type: "ie"
        }
    },
    {
        route: '/merchandiser/budget-validation-purchasing',
        name: 'budget-validation-purchasing',
        moduleId: './modules/merchandiser/budget-validation-purchasing/index',
        nav: true,
        title: 'Validasi Budget - Purchasing',
        auth: true,
        settings: {
            group: "merchandiser",
            subGroup: "approval",
            permission:{"L37":1},
            // permission: { "PG": 3, "PDU": 1, "C9": 1 },
            iconClass: 'fa fa-calculator'
        }
    },
    {
        route: '/merchandiser/budget-validation-process',
        name: 'budget-validation-process',
        moduleId: './modules/merchandiser/budget-validation-process/index',
        nav: true,
        title: 'Validasi Budget - PROSES',
        auth: true,
        settings: {
            group: "merchandiser",
            subGroup: "approval",
            permission:{"L38":1},
            // permission: { "PG": 3, "PDU": 1, "C9": 1 },
            iconClass: 'fa fa-calculator'
        }
    },
    {
        route: '/merchandiser/garment-sales-contract-by-user',
        name: 'garment-sales-contract-by-user',
        moduleId: './modules/merchandiser/garment-sales-contract/index',
        nav: true,
        title: 'Sales Contract',
        auth: true,
        settings: {
            group: "merchandiser",
            subGroup: "transaksi",
            permission:{"L7":1},
            // permission: { "PGA": 2, "PDU": 1, "C9": 1 },
            iconClass: 'fa fa-calculator',
            byUser: true
        }
    },
    {
        route: '/merchandiser/garment-sales-contract',
        name: 'garment-sales-contract',
        moduleId: './modules/merchandiser/garment-sales-contract/index',
        nav: true,
        title: 'Sales Contract (Semua User)',
        auth: true,
        settings: {
            group: "merchandiser",
            subGroup: "transaksi",
            permission:{"L8":1},
            // permission: { "PGA": 2, "PDU": 1, "C9": 1 },
            iconClass: 'fa fa-calculator',
            byUser: false
        }
    },
    {
        route: '/merchandiser/ro-garment-by-user',
        name: 'ro-garment-by-user',
        moduleId: './modules/merchandiser/ro-garment/index',
        nav: true,
        title: 'RO Garment',
        auth: true,
        settings: {
            group: "merchandiser",
            subGroup: "transaksi",
            permission:{"L9":1},
            // permission: { "PGA": 2, "PDU": 1, "C9": 1 },
            iconClass: 'fa fa-calculator',
            byUser: true
        }
    },
    {
        route: '/merchandiser/ro-garment',
        name: 'ro-garment',
        moduleId: './modules/merchandiser/ro-garment/index',
        nav: true,
        title: 'RO Garment (Semua User)',
        auth: true,
        settings: {
            group: "merchandiser",
            subGroup: "transaksi",
            permission:{"L10":1},
            // permission: { "PGA": 2, "PDU": 1, "C9": 1, "B7" : 1,"AG2": 1 },
            iconClass: 'fa fa-calculator',
            byUser: false
        }
    },
    {
        route: '/merchandiser/ro-validation-kasiemd',
        name: 'ro-validation-kasiemd',
        moduleId: './modules/merchandiser/ro-validation/index',
        nav: true,
        title: 'Validasi RO - Kasie Md',
        auth: true,
        settings: {
            group: "merchandiser",
            subGroup: "approval",
            permission:{"L39":1},
            // permission: { "PGA": 3, "PDU": 1, "C9": 1 },
            iconClass: 'fa fa-calculator',
            type: 'kabagmd'
        }
    },
    {
        route: '/merchandiser/ro-validation-qc',
        name: 'ro-validation-qc',
        moduleId: './modules/merchandiser/ro-validation/index',
        nav: true,
        title: 'Validasi RO - QC',
        auth: true,
        settings: {
            group: "merchandiser",
            subGroup: "approval",
            permission:{"L40":1},
            // permission: { "QC": 2, "C9": 1, "PDU": 1 },
            iconClass: 'fa fa-calculator',
            type: 'sample'
        }
    },
    // {
    //     route: '/merchandiser/ro-validation-ppic',
    //     name: 'ro-validation-ppic',
    //     moduleId: './modules/merchandiser/ro-validation-ppic/index',
    //     nav: true,
    //     title: 'Validasi RO - PPIC',
    //     auth: true,
    //     settings: {
    //         group: "merchandiser",
    //         permission: { "PGA": 1, "C9": 1 },
    //         iconClass: 'fa fa-calculator'
    //     }
    // },
    {
        route: '/merchandiser/ro-acceptance',
        name: 'ro-acceptance',
        moduleId: './modules/merchandiser/ro-acceptance/index',
        nav: true,
        title: 'Penerimaan RO',
        auth: true,
        settings: {
            group: "merchandiser",
    //        permission: { "P": 1, "C9": 1 },
            iconClass: 'fa fa-calculator'
        }
    },
    {
        route: '/merchandiser/ro-available',
        name: 'ro-available',
        moduleId: './modules/merchandiser/ro-available/index',
        nav: true,
        title: 'Kesiapan RO',
        auth: true,
        settings: {
            group: "merchandiser",
            subGroup: "produksi",
            permission:{"L44":1},
            // permission: { "PGA": 2, "C9": 1, "PDU": 1, "AG2": 2 },
            iconClass: 'fa fa-calculator'
        }
    },
    {
        route: '/merchandiser/ro-distribute',
        name: 'ro-distribute',
        moduleId: './modules/merchandiser/ro-distribute/index',
        nav: true,
        title: 'Distribusi RO',
        auth: true,
        settings: {
            group: "merchandiser",
            subGroup: "produksi",
            permission:{"L45":1},
            // permission: { "PGA": 2, "C9": 1, "PDU": 1, "AG2": 2 },
            iconClass: 'fa fa-calculator'
        }
    },
    {
        route: '/merchandiser/cost-calculation-copy',
        name: 'cost-calculation-copy',
        moduleId: './modules/merchandiser/cost-calculation/copy/index',
        nav: true,
        title: 'Copy Cost Calculation',
        auth: true,
        settings: {
            group: "merchandiser",
            subGroup: "feature",
            permission:{"L49":1},
            // permission: { "PGA": 2, "PDU": 1, "C9": 1 },
            iconClass: 'fa fa-calculator'
        }
    },
    {
        route: '/merchandiser/garment-sales-contract-copy',
        name: 'garment-sales-contract-copy',
        moduleId: './modules/merchandiser/garment-sales-contract/copy/index',
        nav: true,
        title: 'Copy Sales Contract',
        auth: true,
        settings: {
            group: "merchandiser",
            subGroup: "feature",
            permission:{"L50":1},
            // permission: { "PGA": 2, "PDU": 1, "C9": 1 },
            iconClass: 'fa fa-calculator'
        }
    },
    {
        route: '/merchandiser/ro-garment-copy',
        name: 'ro-garment-copy',
        moduleId: './modules/merchandiser/ro-garment/copy/index',
        nav: true,
        title: 'Copy RO Garment',
        auth: true,
        settings: {
            group: "merchandiser",
            subGroup: "feature",
            permission:{"L51":1},
            // permission: { "PGA": 2, "PDU": 1, "C9": 1 },
            iconClass: 'fa fa-calculator'
        }
    },
    {
        route: 'merchandiser/monitoring-ro-job-order',
        name: 'merchandiser-monitoring-ro-job-order',
        moduleId: './modules/garment-purchasing/monitoring-ro-job-order/index',
        nav: true,
        title: 'Monitoring RO Job Order',
        auth: true,
        settings: {
            group: "merchandiser",
            subGroup: "monitoring",
            permission:{"L13":1},
            // permission: { "PGA": 2, "PDU": 1, "C9": 1 },
            iconClass: 'fa fa-dashboard'
        }
    },
    {
        route: '/merchandiser/garment-cost-calculation-by-unit-report',
        name: 'garment-cost-calculation-by-unit-report',
        moduleId: './modules/merchandiser/report/cost-calculation-garment-by-unit-report/index',
        nav: true,
        title: 'Display Cost Calculation Garment Per Unit',
        auth: true,
        settings: {
            group: "merchandiser",
            subGroup: "monitoring",
            permission:{"L14":1},
            // permission: { "PGA": 2, "PDU": 1, "C9": 1 },
            iconClass: 'fa fa-dashboard'
        }
    },
    {
        route: '/merchandiser/garment-cost-calculation-by-section-report',
        name: 'garment-cost-calculation-by-section-report',
        moduleId: './modules/merchandiser/report/cost-calculation-garment-by-section-report/index',
        nav: true,
        title: 'Display Cost Calculation Garment Per Seksi',
        auth: true,
        settings: {
            group: "merchandiser",
            subGroup: "monitoring",
            permission:{"L15":1},
            // permission: { "PGA": 2, "PDU": 1, "C9": 1 },
            iconClass: 'fa fa-dashboard'
        }
    },
    {
        route: '/merchandiser/garment-cost-calculation-by-buyer-report',
        name: 'garment-cost-calculation-by-buyer-report',
        moduleId: './modules/merchandiser/report/cost-calculation-garment-by-buyer-report/index',
        nav: true,
        title: 'Display Cost Calculation Garment Per Buyer - Deskripsi',
        auth: true,
        settings: {
            group: "merchandiser",
            subGroup: "monitoring",
            permission:{"L16":1},
            // permission: { "PGA": 2, "PDU": 1, "C9": 1 },
            iconClass: 'fa fa-dashboard'
        }
    },
     {
        route: '/merchandiser/garment-cost-calculation-by-sc-report',
        name: 'garment-cost-calculation-by-sc-report',
        moduleId: './modules/merchandiser/report/cost-calculation-garment-by-sc-report/index',
        nav: true,
        title: 'Display Cost Calculation Garment Per Buyer - Sales Contract',
        auth: true,
        settings: {
            group: "merchandiser",
            subGroup: "monitoring",
            permission:{"L17":1},
            // permission: { "PGA": 2, "PDU": 1, "C9": 1 },
            iconClass: 'fa fa-dashboard'
        }
    },
    {
        route: '/merchandiser/budget-job-order-report',
        name: 'budget-job-order-report',
        moduleId: './modules/merchandiser/report/budget-job-order-report/index',
        nav: true,
        title: 'Display Budget Job Order',
        auth: true,
        settings: {
            group: "merchandiser",
            subGroup: "monitoring",
            permission:{"L18":1},
            // permission: { "PGA": 2, "B7": 1, "PDU": 1, "C9": 1 },
            iconClass: 'fa fa-dashboard'
        }
    },
    {
        route: '/merchandiser/budget-master-sample-report',
        name: 'budget-master-sample-report',
        moduleId: './modules/merchandiser/report/budget-master-sample-report/index',
        nav: true,
        title: 'Display Budget Master / Sample',
        auth: true,
        settings: {
            group: "merchandiser",
            subGroup: "monitoring",
            permission:{"L19":1},
            // permission: { "PGA": 2, "B7": 1, "PDU": 1, "C9": 1 },
            iconClass: 'fa fa-dashboard'
        }
    },
    {
        route: '/merchandiser/monitoring-unpost-cost-calculation',
        name: 'monitoring-unpost-cost-calculation',
        moduleId: './modules/merchandiser/report/monitoring-unpost-cost-calculation/index',
        nav: true,
        title: 'Monitoring Unpost Cost Calculation',
        auth: true,
        settings: {
            group: "merchandiser",
            subGroup: "monitoring",
            permission:{"L20":1},
            // permission: { "PGA": 2, "PDU": 1, "C9": 1 },
            iconClass: 'fa fa-dashboard'
        }
    },
    {
        route: '/merchandiser/production-order-report',
        name: 'production-order-report',
        moduleId: './modules/merchandiser/report/production-order-report/index',
        nav: true,
        title: 'Laporan Order Produksi',
        auth: true,
        settings: {
            group: "merchandiser",
            subGroup: "monitoring",
            permission:{"L21":1},
            // permission: { "PGA": 2, "PDU": 1, "C9": 1 },
            iconClass: 'fa fa-dashboard'
        }
    },
    {
        route: '/merchandiser/accepted-ro-report',
        name: 'accepted-ro-report',
        moduleId: './modules/merchandiser/report/accepted-ro-report/index',
        nav: true,
        title: 'Laporan Penerimaan RO',
        auth: true,
        settings: {
            group: "merchandiser",
            subGroup: "produksi",
            permission:{"L46":1},
            // permission: { "PGA": 2, "PDU": 1, "C9": 1,"AG2":2 },
            iconClass: 'fa fa-dashboard'
        }
    },
    {
        route: '/merchandiser/available-ro-report',
        name: 'available-ro-report',
        moduleId: './modules/merchandiser/report/available-ro-report/index',
        nav: true,
        title: 'Laporan Kecepatan Cek RO',
        auth: true,
        settings: {
            group: "merchandiser",
            subGroup: "produksi",
            permission:{"L47":1},
            // permission: { "PGA": 2, "PDU": 1, "C9": 1,"AG2":2 },
            iconClass: 'fa fa-dashboard'
        }
    },
     {
        route: '/merchandiser/distribution-ro-garment-report',
        name: 'distribution-ro-garment-report',
        moduleId: './modules/merchandiser/report/distribution-ro-garment-report/index',
        nav: true,
        title: 'Laporan Distribusi RO Garment',
        auth: true,
        settings: {
            group: "merchandiser",
            subGroup: "produksi",
            permission:{"L48":1},
            // permission: {  "PGA": 2, "PDU": 1, "C9": 1,"AG2":2 },
            iconClass: 'fa fa-dashboard'
        }
    },    
    {
        route: '/merchandiser/available-budget-report',
        name: 'available-budget-report',
        moduleId: './modules/merchandiser/report/available-budget-report/index',
        nav: true,
        title: 'Laporan Kesiapan Budget',
        auth: true,
        settings: {
            group: "merchandiser",
            subGroup: "monitoring",
            permission:{"L22":1},
            // permission: { "PGA": 2, "PDU": 1, "C9": 1 },
            iconClass: 'fa fa-dashboard'
        }
    },
     {
        route: '/merchandiser/latest-available-budget-report',
        name: 'latest-available-budget-report',
        moduleId: './modules/merchandiser/report/latest-available-budget-report/index',
        nav: true,
        title: 'Laporan Kesiapan Budget | >= 2024',
        auth: true,
        settings: {
            group: "merchandiser",
            subGroup: "monitoring",
            permission:{"L23":1},
            // permission: { "PGA": 2, "PDU": 1, "C9": 1 },
            iconClass: 'fa fa-dashboard'
        }
    },
    {
        route: '/merchandiser/available-ro-garment-report',
        name: 'available-ro-garment-report',
        moduleId: './modules/merchandiser/report/available-ro-garment-report/index',
        nav: true,
        title: 'Laporan Kesiapan RO',
        auth: true,
        settings: {
            group: "merchandiser",
            subGroup: "monitoring",
            permission:{"L57":1},
            //permission: { "PGA": 2, "PDU": 1, "C9": 1, "B7": 1 },
            iconClass: 'fa fa-dashboard'
        }
    },   
     {
        route: '/merchandiser/latest-available-ro-garment-report',
        name: 'latest-available-ro-garment-report',
        moduleId: './modules/merchandiser/report/latest-available-ro-garment-report/index',
        nav: true,
        title: 'Laporan Kesiapan RO | >= 2024',
        auth: true,
        settings: {
            group: "merchandiser",
            subGroup: "monitoring",
            permission:{"L24":1},
            // permission: { "PGA": 2, "PDU": 1, "C9": 1, "B7": 1 },
            iconClass: 'fa fa-dashboard'
        }
    },  
    {
        route: '/merchandiser/garment-purchasing-quality-objective-report',
        name: 'garment-purchasing-quality-objective-report',
        moduleId: './modules/merchandiser/report/garment-purchasing-quality-objective-report/index',
        nav: true,
        title: 'Laporan Sasaran Mutu Penjualan Garment',
        auth: true,
        settings: {
            group: "merchandiser",
            subGroup: "monitoring",
            permission:{"L25":1},
            // permission: { "PGA": 2, "PDU": 1, "C9": 1},
            iconClass: 'fa fa-dashboard'
        }
    },
    {
        route: '/merchandiser/profit-garment-by-section-report',
        name: 'profit-garment-by-section-report',
        moduleId: './modules/merchandiser/report/profit-garment-by-section-report/index',
        nav: true,
        title: 'Laporan Profit Garment Per Seksi',
        auth: true,
        settings: {
            group: "merchandiser",
            subGroup: "monitoring",
            permission:{"L26":1},
            // permission: { "PGA": 2, "PDU": 1, "C9": 1, "B7": 1 },
            iconClass: 'fa fa-dashboard'
        }
    },
    {
        route: '/merchandiser/profit-garment-by-comodity-report',
        name: 'profit-garment-by-comodity-report',
        moduleId: './modules/merchandiser/report/profit-garment-by-comodity-report/index',
        nav: true,
        title: 'Laporan Profit Garment Per Komoditi',
        auth: true,
        settings: {
            group: "merchandiser",
            subGroup: "monitoring",
            permission:{"L27":1},
            // permission: { "PGA": 2, "PDU": 1, "C9": 1 },
            iconClass: 'fa fa-dashboard'
        }
    },
    {
        route: '/merchandiser/budget-export-garment-report',
        name: 'budget-export-garment-report',
        moduleId: './modules/merchandiser/report/budget-export-garment-report/index',
        nav: true,
        title: 'Monitoring Budget Garment',
        auth: true,
        settings: {
            group: "merchandiser",
            subGroup: "monitoring",
            permission:{"L28":1},
            // permission: { "PGA": 2, "B7": 1, "PDU": 1, "C9": 1 },
            iconClass: 'fa fa-dashboard'
        }
    },
    {
        route: '/merchandiser/cc-ro-garment-history-report',
        name: 'cc-ro-garment-history-report',
        moduleId: './modules/merchandiser/report/cc-ro-garment-history-by-section-report/index',
        nav: true,
        title: 'Monitoring History Cost Calculatin & Budget Garment',
        auth: true,
        settings: {
            group: "merchandiser",
            subGroup: "monitoring",
            permission:{"L29":1},
            // permission: { "PGA": 2, "PDU": 1, "C9": 1 },
            iconClass: 'fa fa-dashboard'
        }
    },
    {
        route: '/merchandiser/open-po-master',
        name: 'open-po-master',
        moduleId: './modules/merchandiser/open-po-master/index',
        nav: true,
        title: 'Open PO Master',
        auth: true,
        settings: {
            group: "merchandiser",
            subGroup: "feature",
            permission:{"L52":1},
            // permission: { "PGA": 2, "PDU": 1, "C9": 1 },
            iconClass: 'fa fa-dashboard'
        }
    },
    {
        route: '/merchandiser/open-po-master-approval/kabag-md',
        name: 'open-po-master-approval-kabag-md',
        moduleId: './modules/merchandiser/open-po-master-approval/index',
        nav: true,
        title: 'Approval Open PO Master - Kasie MD',
        auth: true,
        settings: {
            group: "merchandiser",
            subGroup: "approval",
            permission:{"L41":1},
            // permission: { "PGA": 3, "PDU": 1, "C9": 1 },
            iconClass: 'fa fa-dashboard',
            type: "kabag_md"
        }
    },
    {
        route: '/merchandiser/open-po-master-approval/purchasing',
        name: 'open-po-master-approval-purchasing',
        moduleId: './modules/merchandiser/open-po-master-approval/index',
        nav: true,
        title: 'Approval Open PO Master - Kabag/Kasie Penjualan',
        auth: true,
        settings: {
            group: "merchandiser",
            subGroup: "approval",
            permission:{"L42":1},
            // permission: { "PGA": 3, "PDU": 1, "C9": 1 },
            iconClass: 'fa fa-dashboard',
            type: "purchasing"
        }
    },
    {
        route: '/merchandiser/open-po-master-approval/kadiv-md',
        name: 'open-po-master-approval-kadiv-md',
        moduleId: './modules/merchandiser/open-po-master-approval/index',
        nav: true,
        title: 'Approval Open PO Master - Kabag/Kasie Purchasing',
        auth: true,
        settings: {
            group: "merchandiser",
            subGroup: "approval",
            permission:{"L43":1},
            // permission: { "PG": 3, "PDU": 1, "C9": 1 },
            iconClass: 'fa fa-dashboard',
            type: "kadiv_md"
        }
    },
    {
        route: '/merchandiser/unit-delivery-order-marketing',
        name: 'unit-delivery-order-marketing',
        moduleId: './modules/merchandiser/unit-delivery-order-marketing/index',
        nav: true,
        title: 'DO Marketing',
        auth: true,
        settings: {
            group: "merchandiser",
            subGroup: "transaksi",
            permission:{"L11":1},
            // permission: { "PGA": 2, "PDU": 1, "C9": 1 },
            iconClass: 'fa fa-calculator'
        }
    },
    {
        route: "garment-production/packing-list-draft-list",
        name: "garment-production/packing-list-draft-list",
        moduleId: "modules/garment-shipping/packing-list-draft-list/index",
        nav: true,
        title: "LIST | Draft Packing List",
        auth: true,
        settings: {
            group: "merchandiser",
            subGroup: "approval shipping",
            permission:{"L53":1},
            // permission: { "PGA": 2, "PDU": 1, "C9": 1 },
            iconClass: "fa fa-dashboard"
        }
    },
    {
        route: '/merchandiser/packing-list-draft-approval',
        name: 'packing-list-draft-approval',
        moduleId: './modules/merchandiser/packing-list-draft-approval/index',
        nav: true,
        title: 'Approval Draft Packing List - Md',
        auth: true,
        settings: {
            group: "merchandiser",
            subGroup: "approval shipping",
            permission:{"L54":1},
            // permission: { "PGA": 2, "PDU": 1, "C9": 1 },
            iconClass: 'fa fa-calculator'
        }
    },
    {
        route: '/merchandiser/packing-list-approval',
        name: 'packing-list-approval',
        moduleId: './modules/merchandiser/packing-list-approval/index',
        nav: true,
        title: 'Approval Packing List - Md',
        auth: true,
        settings: {
            group: "merchandiser",
            subGroup: "approval shipping",
            permission:{"L55":1},
            // permission: { "PGA": 2, "PDU": 1, "C9": 1 },
            iconClass: 'fa fa-calculator'
        }
    },
    {
        route: '/merchandiser/packing-list',
        name: 'packing-list',
        moduleId: './modules/merchandiser/packing-list/index',
        nav: true,
        title: 'Approved Packing List - Md',
        auth: true,
        settings: {
            group: "merchandiser",
            subGroup: "approval shipping",
            permission:{"L56":1},
            // permission: { "PGA": 2, "PDU": 1, "C9": 1 },
            iconClass: 'fa fa-calculator'
        }
    },
    {
        route: '/merchandiser/cost-calculation-cancel-approval',
        name: 'cost-calculation-cancel-approval',
        moduleId: './modules/merchandiser/cost-calculation-cancel-approval/index',
        nav: true,
        title: 'Cancel Approval Cost Calculation',
        auth: true,
        settings: {
            group: "merchandiser",
            subGroup: "feature",
            permission : {'L58' : 1},
            iconClass: 'fa fa-calculator',
            type: "kadivmd"
        }
    },
    {
        route: '/merchandiser/report-cost-calculation-cancel-approval',
        name: 'report--cost-calculation-cancel-approval',
        moduleId: './modules/merchandiser/report/cancel-approval-ccg-report/index',
        nav: true,
        title: 'Report Cancel Approval Cost Calculation',
        auth: true,
        settings: {
            group: "merchandiser",
            subGroup: "monitoring",
            permission : {'L59' : 1},
            iconClass: 'fa fa-calculator',
        }
    },
    {
        route: '/merchandiser/reject-ro-garment-report',
        name: 'reject-ro-garment-report',
        moduleId: './modules/merchandiser/report/reject-ro-garment-report/index',
        nav: true,
        title: 'Report Reject RO Garment',
        auth: true,
        settings: {
            group: "merchandiser",
            subGroup: "monitoring",
            permission : {'L60' : 1},
            iconClass: 'fa fa-calculator',
        }
    },

    // ENHANCE DEMO PACKING LIST
    {
        route: '/merchandiser/packing-list-draft-approval-demo',
        name: 'packing-list-draft-approval-demo',
        moduleId: './modules/merchandiser/packing-list-draft-approval-demo/index',
        nav: true,
        title: 'Approval Draft Packing MD',
        auth: true,
        settings: {
            group: "merchandiser",
            subGroup: "approval shipping",
            // permission: { "PGA": 1, "C9": 1 },
            permission: { "L61": 1 },
            iconClass: 'fa fa-calculator'
        }
    },
    {
        route: '/merchandiser/packing-list-approval-demo',
        name: 'packing-list-approval-demo',
        moduleId: './modules/merchandiser/packing-list-approval-demo/index',
        nav: true,
        title: 'Approval Packing MD',
        auth: true,
        settings: {
            group: "merchandiser",
            subGroup: "approval shipping",
            // permission: { "PGA": 1, "C9": 1 },
            permission: { "L62": 1 },
            iconClass: 'fa fa-calculator'
        }
    },
    {
        route: '/merchandiser/packing-list-demo',
        name: 'packing-list-demo',
        moduleId: './modules/merchandiser/packing-list-demo/index',
        nav: true,
        title: 'Approved Packing MD',
        auth: true,
        settings: {
            group: "merchandiser",
            subGroup: "approval shipping",
            // permission: { "PGA": 1, "SG": 1, "C9": 1 },
            permission: { "L63": 1 },
            iconClass: 'fa fa-calculator'
        }
    },
    //END
];
