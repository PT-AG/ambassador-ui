module.exports = [
    {
        route: 'pr',
        name: 'purchase-request',
        moduleId: './modules/purchasing/purchase-request/index',
        nav: true,
        title: 'Purchase Request',
        auth: true,
        settings: {
            group: "purchasing",
            subGroup: "transaksi",
            // permission: { "*": 1},
            permission: { "E1": 1},
            iconClass: 'fa fa-dashboard'
        }
    },
    {
        route: 'pr/monitoring',
        name: 'purchase-request-monitoring',
        moduleId: './modules/purchasing/monitoring-purchase-request/index',
        nav: true,
        title: 'Monitoring Purchase Request',
        auth: true,
        settings: {
            group: "purchasing",
            subGroup: "monitoring",
            permission: { "E12": 1},
            // permission: { "*": 1 },
            iconClass: 'fa fa-dashboard'
        }
    },
    {
        route: 'monitoring-purchase-request-all-unit',
        name: 'monitoring-purchase-request-all-unit',
        moduleId: './modules/purchasing/monitoring-purchase-request-all-unit/index',
        nav: true,
        title: 'Monitoring Purchase Request Semua Unit',
        auth: true,
        settings: {
            group: "purchasing",
            subGroup: "monitoring",
            permission: { "E13": 1},
            // permission: { "P1": 1, "P2": 1, "B1": 1, "PDU": 1,"C9":1 },
            iconClass: 'fa fa-dashboard'
        }
    },
    {
        route: 'po',
        name: 'purchase-order',
        moduleId: './modules/purchasing/purchase-order/index',
        nav: true,
        title: 'Purchase Order',
        auth: true,
        settings: {
            group: "purchasing",
            subGroup: "transaksi",
            // permission: { "P1": 2, "P2": 2, "PDU": 1,"C9":1 },
            permission: { "E2": 1},
            iconClass: 'fa fa-dashboard'
        }
    },
    {
        route: 'purchase-order-internal/monitoring',
        name: 'po-internal-belum-unit-payment-order-monitoring',
        moduleId: './modules/purchasing/monitoring-po-internal-belum-po-external/index',
        nav: true,
        title: 'Monitoring Purchase Order Internal Belum Diproses Pembelian',
        auth: true,
        settings: {
            group: "purchasing",
            subGroup: "monitoring",
            permission: { "E14": 1},
            // permission: { "P1": 2, "P2": 2, "B1": 2, "PDU": 1,"C9":1},
            iconClass: 'fa fa-dashboard'
        }
    },
    {
        route: 'po-internal/monitoring',
        name: 'purchase-order-internal-monitoring',
        moduleId: './modules/purchasing/monitoring-purchase-order-internal/index',
        nav: true,
        title: 'Monitoring Purchase Order Internal',
        auth: true,
        settings: {
            group: "purchasing",
            subGroup: "monitoring",
            permission: { "E15": 1},
            // permission: { "P1": 2, "P2": 2, "B1": 2, "PDU": 1,"C9":1 },
            iconClass: 'fa fa-dashboard'
        }
    },

    {
        route: 'receipt-spb-monitoring',
        name: 'receipt-spb-monitoring',
        moduleId: './modules/purchasing/unit-before-spb-monitoring/index',
        nav: true,
        title: 'Monitoring Bon Belum Buat SPB',
        auth: true,
        settings: {
            group: "purchasing",
            subGroup: "monitoring",
            permission: { "E16": 1},
            // permission: { "P1": 2, "P2": 2, "B1": 2, "PDU": 1,"C9":1 },
            iconClass: 'fa fa-dashboard'
        }
    },
    {
        route: 'po-external',
        name: 'purchase-order-external',
        moduleId: './modules/purchasing/purchase-order-external/index',
        nav: true,
        title: 'Purchase Order External',
        auth: true,
        settings: {
            group: "purchasing",
            subGroup: "transaksi",
            // permission: { "P1": 2, "P2": 2, "PDU": 1,"C9":1 },
            permission: { "E3": 1},
            iconClass: 'fa fa-dashboard'
        }
    },
    // {
    //     route: 'vb-expedition-realitation-report',
    //     name: 'vb-expedition-realitation-report',
    //     moduleId: './modules/purchasing/reports/vb-expedition-realitation-report/index',
    //     nav: true,
    //     title: 'Laporan Ekspedisi Realisasi VB',
    //     auth: true,
    //     settings: {
    //         group: "purchasing",
    //         permission: { "P1": 1, "P2": 1, "P4": 1, "P6": 1, "P7": 1, "PI": 1, "PG": 1, "PK": 1, "B9": 1, "B4": 1, "C5": 1, "C9": 1 },
    //         iconClass: 'fa fa-dashboard'
    //     }
    // },
    {
        route: 'po-external/all',
        name: 'purchase-order-external-kasei',
        moduleId: './modules/purchasing/purchase-order-external-kasei/index',
        nav: true,
        title: 'Purchase Order External All',
        auth: true,
        settings: {
            group: "purchasing",
            subGroup: "transaksi",
            // permission: { "P1": 3, "P2": 3, "PDU": 1,"C9":1 },
            permission: { "E4": 1},
            iconClass: 'fa fa-dashboard'
        }
    },
    {
        route: 'po/monitoring/all',
        name: 'purchase-order-monitoring',
        moduleId: './modules/purchasing/monitoring-purchase-order-all-user/index',
        nav: true,
        title: 'Monitoring Purchase All',
        auth: true,
        settings: {
            group: "purchasing",
            subGroup: "monitoring",
            // permission: { "*": 1},
            permission: { "E17": 1},
            iconClass: 'fa fa-dashboard'
        }
    },
    {
        route: 'po/monitoring',
        name: 'purchase-order-monitoring',
        moduleId: './modules/purchasing/monitoring-purchase-order/index',
        nav: true,
        title: 'Monitoring Purchase',
        auth: true,
        settings: {
            group: "purchasing",
            subGroup: "monitoring",
            permission: { "E18": 1},
            // permission: { "P1": 2, "P2": 2, "B1": 2, "PDU": 1,"C9":1},
            iconClass: 'fa fa-dashboard'
        }
    },
    {
        route: 'po/reports/periode/unit',
        name: 'purchase-order-reports-periode-unit',
        moduleId: './modules/purchasing/reports/purchase-order-report/unit-report/index',
        nav: true,
        title: 'Laporan Total Pembelian per Unit',
        auth: true,
        settings: {
            group: "purchasing",
            subGroup: "laporan",
            permission: { "E26": 1},
            // permission: { "P1": 2, "P2": 2, "B1": 2, "PDU": 1,"C9":1 },
            iconClass: 'fa fa-dashboard'
        }
    },
    {
        route: 'po/reports/periode/category',
        name: 'purchase-order-reports-periode-category',
        moduleId: './modules/purchasing/reports/purchase-order-report/category-report/index',
        nav: true,
        title: 'Laporan Total Pembelian per Kategori',
        auth: true,
        settings: {
            group: "purchasing",
            subGroup: "laporan",
            permission: { "E27": 1},
            // permission: { "P1": 2, "P2": 2, "B1": 2, "PDU": 1,"C9":1 },
            iconClass: 'fa fa-dashboard'
        }
    },
    {
        route: 'po/reports/periode/unit-category',
        name: 'purchase-order-reports-periode-unit-category',
        moduleId: './modules/purchasing/reports/purchase-order-report/unit-category-report/index',
        nav: true,
        title: 'Laporan Total Pembelian per Unit per Kategori',
        auth: true,
        settings: {
            group: "purchasing",
            subGroup: "laporan",
            permission: { "E28": 1},
            // permission: { "P1": 2, "P2": 2, "B1": 2, "PDU": 1,"C9":1 },
            iconClass: 'fa fa-dashboard'
        }
    },
    {
        route: 'po/reports/periode/supplier',
        name: 'purchase-order-reports-periode-supplier',
        moduleId: './modules/purchasing/reports/purchase-order-report/supplier-report/index',
        nav: true,
        title: 'Laporan Total Pembelian per Supplier',
        auth: true,
        settings: {
            group: "purchasing",
            subGroup: "laporan",
            permission: { "E29": 1},
            // permission: { "P1": 2, "P2": 2, "B1": 2, "PDU": 1,"C9":1 },
            iconClass: 'fa fa-dashboard'
        }
    },
    {
        route: 'delivery-order',
        name: 'delivery-order',
        moduleId: './modules/purchasing/delivery-order/index',
        nav: true,
        title: 'Surat Jalan',
        auth: true,
        settings: {
            group: "purchasing",
            subGroup: "transaksi",
            // permission: { "P1": 2, "P2": 2, "PDU": 1,"C9":1 },
            permission: { "E5": 1},
            iconClass: 'fa fa-dashboard'
        }
    },
    {
        route: 'do/monitoring',
        name: 'delivery-order-monitoring',
        moduleId: './modules/purchasing/monitoring-delivery-order/index',
        nav: true,
        title: 'Monitoring Surat Jalan',
        auth: true,
        settings: {
            group: "purchasing",
            subGroup: "monitoring",
            permission: { "E19": 1},
            // permission: { "P1": 2, "P2": 2, "B1": 2, "PDU": 1,"C9":1 },
            iconClass: 'fa fa-dashboard'
        }
    },
    {
        route: 'receipt-note/unit',
        name: 'receipt-note-unit',
        moduleId: './modules/purchasing/unit-receipt-note/index',
        nav: true,
        title: 'Bon Terima Unit',
        auth: true,
        settings: {
            group: "purchasing",
            subGroup: "transaksi",
            // permission: { "*": 1 },
            permission: { "E6": 1},
            iconClass: 'fa fa-dashboard'
        }
    },
    {
        route: 'receipt-note/unit/monitoring',
        name: 'receipt-note-unit-monitoring',
        moduleId: './modules/purchasing/unit-receipt-note-monitoring/index',
        nav: true,
        title: 'Monitoring Bon Terima Unit',
        auth: true,
        settings: {
            group: "purchasing",
            subGroup: "monitoring",
            // permission: { "*": 1 },
            permission: { "E20": 1},
            iconClass: 'fa fa-dashboard'
        }
    },
    {
        route: 'report/bon-unit-blm-spb',
        name: 'bon-unit-blm-spb',
        moduleId: './modules/purchasing/reports/bon-unit-blm-spb/index',
        nav: true,
        title: 'Laporan Bon Terima Unit Belum Dibuat SPB',
        auth: true,
        settings: {
            group: "purchasing",
            //permission: { "P1": 1, "P2": 1, "P4": 1, "P6": 1, "P7": 1, "PI": 1, "PG": 1, "PK": 1, "C9": 1 },
            iconClass: 'fa fa-dashboard'
        }
    },
    {
        route: 'unit-payment-order',
        name: 'unit-payment-order',
        moduleId: './modules/purchasing/unit-payment-order/index',
        nav: true,
        title: 'Surat Perintah Bayar',
        auth: true,
        settings: {
            group: "purchasing",
            subGroup: "transaksi",
            permission: { "E7": 1},
            // permission: { "P1": 2, "P2": 2, "PDU": 1,"C9":1 },
            iconClass: 'fa fa-dashboard'
        }
    },
    {
        route: 'unit-payment-order/all',
        name: 'unit-payment-order-all',
        moduleId: './modules/purchasing/unit-payment-order-all/index',
        nav: true,
        title: 'Surat Perintah Bayar All',
        auth: true,
        settings: {
            group: "purchasing",
            subGroup: "transaksi",
            permission: { "E8": 1},
            // permission: { "P1": 3, "P2": 3, "PDU": 1,"C9":1 },
            iconClass: 'fa fa-dashboard'
        }
    },
    {
        route: 'po/monitoring/spb',
        name: 'surat-perintah-bayar-monitoring',
        moduleId: './modules/purchasing/monitoring-surat-perintah-bayar-new/index',
        nav: true,
        title: 'Monitoring Surat Perintah Bayar',
        auth: true,
        settings: {
            group: "purchasing",
            subGroup: "monitoring",
            permission: { "E21": 1},
            // permission: { "P1": 1, "P2": 1, "B1": 1, "PDU": 1,"C9":1},
            iconClass: 'fa fa-dashboard'
        }
    },
    {
        route: 'po/monitoring/tax',
        name: 'incometax-vat-monitoring',
        moduleId: './modules/purchasing/monitoring-ppn-pph/index',
        nav: true,
        title: 'Monitoring PPN & PPH',
        auth: true,
        settings: {
            group: "purchasing",
            subGroup: "monitoring",
            permission: { "E22": 1},
            // permission: { "P1": 2, "P2": 2, "B1": 2, "PDU": 1,"C9":1 },
            iconClass: 'fa fa-dashboard'
        }
    },
    {
        route: 'unit-payment-note/price-correction',
        name: 'unit-payment-price-correction-note',
        moduleId: './modules/purchasing/unit-payment-price-correction-note/index',
        nav: true,
        title: 'Koreksi Harga Pembelian',
        auth: true,
        settings: {
            group: "purchasing",
            subGroup: "transaksi",
            permission: { "E9": 1},
            // permission: { "P1": 2, "P2": 2, "PDU": 1,"C9":1},
            iconClass: 'fa fa-dashboard'
        }
    },
    {
        route: 'unit-payment-note/price-correction/monitoring',
        name: 'unit-payment-price-correction-note-monitoring',
        moduleId: './modules/purchasing/koreksi-harga/index',
        nav: true,
        title: 'Monitoring Koreksi Harga',
        auth: true,
        settings: {
            group: "purchasing",
            subGroup: "monitoring",
            permission: { "E23": 1},
            // permission: { "P1": 2, "P2": 2, "B1": 2, "PDU": 1,"C9":1 },
            iconClass: 'fa fa-dashboard'
        }
    },
    {
        route: 'unit-payment-note/quantity-correction',
        name: 'unit-payment-quantity-correction-note',
        moduleId: './modules/purchasing/unit-payment-quantity-correction-note/index',
        nav: true,
        title: 'Koreksi Jumlah Pembelian',
        auth: true,
        settings: {
            group: "purchasing",
            subGroup: "transaksi",
            permission: { "E10": 1},
            // permission: { "P1": 2, "P2": 2, "PDU": 1,"C9":1 },
            iconClass: 'fa fa-dashboard'
        }
    },
    {
        route: 'correction-quantity',
        name: 'unit-payment-quantity-koreksi',
        moduleId: './modules/purchasing/koreksi-jumlah/index',
        nav: true,
        title: 'Monitoring Koreksi Jumlah',
        auth: true,
        settings: {
            group: "purchasing",
            subGroup: "monitoring",
            permission: { "E24": 1},
            // permission: { "P1": 2, "P2": 2, "B1": 2, "PDU": 1,"C9":1 },
            iconClass: 'fa fa-dashboard'
        }
    },
    {
        route: 'generating-data',
        name: 'generating-data',
        moduleId: './modules/purchasing/generating-data/index',
        nav: true,
        title: 'Generating Data',
        auth: true,
        settings: {
            group: "purchasing",            
            // permission: { "C9": 1 },
            permission: { "E39": 1},
            iconClass: 'fa fa-dashboard'
        }
    },
    {
        route: 'purchase-request-purchase-order-duration-report',
        name: 'purchase-request-purchase-order-duration-report',
        moduleId: './modules/purchasing/reports/duration-reports/purchase-request-purchase-order-duration-report/index',
        nav: true,
        title: 'Laporan Durasi PR - PO Internal',
        auth: true,
        settings: {
            group: "purchasing",
            subGroup: "laporan",
            permission: { "E30": 1},
            // permission: { "P1": 2, "P2": 2, "B1": 2, "PDU": 1,"C9":1 },
            iconClass: 'fa fa-dashboard'
        }
    },
    {
        route: 'purchase-request-purchase-order-external-duration-report',
        name: 'purchase-request-purchase-order-external-duration-report',
        moduleId: './modules/purchasing/reports/duration-reports/purchase-request-purchase-order-external-duration-report/index',
        nav: true,
        title: 'Laporan Durasi PR - PO Eksternal',
        auth: true,
        settings: {
            group: "purchasing",
            subGroup: "laporan",
            permission: { "E31": 1},
            // permission: { "P1": 2, "P2": 2, "B1": 2, "PDU": 1,"C9":1 },
            iconClass: 'fa fa-dashboard'
        }
    },
    {
        route: 'purchase-order-purchase-order-external-duration-report',
        name: 'purchase-order-purchase-order-external-duration-report',
        moduleId: './modules/purchasing/reports/duration-reports/purchase-order-purchase-order-external-duration-report/index',
        nav: true,
        title: 'Laporan Durasi PO Internal - PO Eksternal',
        auth: true,
        settings: {
            group: "purchasing",
            subGroup: "laporan",
            permission: { "E32": 1},
            // permission: { "P1": 2, "P2": 2, "B1": 2, "PDU": 1,"C9":1 },
            iconClass: 'fa fa-dashboard'
        }
    },
    {
        route: 'purchase-order-external-delivery-order-duration-report',
        name: 'purchase-order-external-delivery-order-duration-report',
        moduleId: './modules/purchasing/reports/duration-reports/purchase-order-external-delivery-order-duration-report/index',
        nav: true,
        title: 'Laporan Durasi PO Eksternal - Surat Jalan',
        auth: true,
        settings: {
            group: "purchasing",
            subGroup: "laporan",
            permission: { "E33": 1},
            // permission: { "P1": 2, "P2": 2, "B1": 2, "PDU": 1,"C9":1 },
            iconClass: 'fa fa-dashboard'
        }
    },
    {
        route: 'purchase-order/monitoring-price',
        name: 'purchase-order-monitoring-price',
        moduleId: './modules/purchasing/monitoring-price/index',
        nav: true,
        title: 'Monitoring Price',
        auth: true,
        settings: {
            group: "purchasing",
            subGroup: "monitoring",
            permission: { "E25": 1},
            // permission: { "P1": 1, "P2": 1, "B1": 1, "PDU": 1,"C9":1 },
            iconClass: 'fa fa-dashboard'
        }
    },
    {
        route: 'po/reports/ketepatan/staff',
        name: 'purchase-order-reports-ketepatan-staff',
        moduleId: './modules/purchasing/reports/purchase-order-report/staff-report-new/index',
        nav: true,
        title: 'Laporan Ketepatan kedatangan Barang per Staff',
        auth: true,
        settings: {
            group: "purchasing",
            subGroup: "laporan",
            permission: { "E34": 1},
            // permission: { "P1": 2, "P2": 2, "B1": 2, "PDU": 1,"C9":1 },
            iconClass: 'fa fa-dashboard'
        }
    },
    {
        route: 'report/local-purchasing-book-report',
        name: 'local-purchasing-book-report',
        moduleId: './modules/purchasing/reports/local-purchasing-book-report/index',
        nav: true,
        title: 'Laporan Buku Pembelian Lokal',
        auth: true,
        settings: {
            group: "purchasing",
            subGroup: "laporan",
            permission: { "E35": 1},
            // permission: { "P1": 2, "P2": 2, "B1": 2, "PDU": 1,"C9":1 },
            iconClass: 'fa fa-dashboard'
        }
    },
    {
        route: 'report/local-valas-purchasing-book-report',
        name: 'local-valas-purchasing-book-report',
        moduleId: './modules/purchasing/reports/local-valas-purchasing-book-report/index',
        nav: true,
        title: 'Laporan Buku Pembelian Lokal Valas',
        auth: true,
        settings: {
            group: "purchasing",
            subGroup: "laporan",
            permission: { "E36": 1},
            // permission: { "P1": 2, "P2": 2, "B1": 2, "PDU": 1,"C9":1 },
            iconClass: 'fa fa-dashboard'
        }
    },
    {
        route: 'report/import-purchasing-book',
        name: 'import-purchasing-book-report',
        moduleId: './modules/purchasing/reports/import-purchasing-book/index',
        nav: true,
        title: 'Laporan Buku Pembelian Import',
        auth: true,
        settings: {
            group: "purchasing",
            subGroup: "laporan",
            permission: { "E37": 1},
            // permission: { "P1": 2, "P2": 2, "B1": 2, "PDU": 1,"C9":1 },
            iconClass: 'fa fa-dashboard'
        }
    },
    {
        route: 'unit-payment-order-not-verified-report',
        name: 'unit-payment-order-not-verified-report',
        moduleId: './modules/purchasing/reports/unit-payment-order-not-verified-report/index',
        nav: true,
        title: 'Laporan SPB Not Verified',
        auth: true,
        settings: {
            group: "purchasing",
            //permission: { "P1": 1, "P2": 1, "P4": 1, "P6": 1, "P7": 1, "PI": 1, "PG": 1, "PK": 1, "B9": 1, "C9": 1},
            iconClass: 'fa fa-dashboard'
        }
    },
    {
        route: 'purchasing-disposition',
        name: 'purchasing-disposition',
        moduleId: './modules/purchasing/purchasing-disposition/index',
        nav: true,
        title: 'Disposisi Pembayaran',
        auth: true,
        settings: {
            group: "purchasing",
            subGroup: "transaksi",
            permission: { "E11": 1},
            // permission: { "P1": 2, "P2": 2, "PDU": 1,"C9":1},
            iconClass: 'fa fa-dashboard'
        }
    },
    {
        route: '/expedition/reports/unit-payment-order-paid-status-report',
        name: 'unit-payment-order-paid-status',
        moduleId: './modules/expedition/reports/unit-payment-order-paid-status-report/index',
        nav: true,
        title: 'Laporan Status Bayar SPB',
        auth: true,
        settings: {
            group: "purchasing",
            subGroup: "laporan",
            permission: { "E38": 1},
            // permission: { "P1": 2, "P2": 2, "B1": 2, "PDU": 1,"C9":1 },
            iconClass: 'fa fa-dashboard'
        }
    }
]
