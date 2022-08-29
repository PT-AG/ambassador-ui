import { bindable, inject, computedFrom } from "aurelia-framework";
import { Service, PurchasingService, SalesService, CoreService } from "./service";

const UnitLoader = require('../../../loader/garment-units-loader');
var SupplierLoader = require('../../../loader/garment-supplier-loader');
var URNLoader = require('../../../loader/garment-unit-receipt-note-loader');

@inject(Service, PurchasingService, SalesService, CoreService)
export class DataForm {
    @bindable readOnly = false;
    @bindable isEdit = false;
    @bindable title;
    @bindable data = {};
    // @bindable error = {};
    @bindable selectedSupplier;
    @bindable selectedURN;
    @bindable selectedRONo;

    dataDODetails = [];
    itemsRONo = [];

    constructor(service, purchasingService, salesService, coreService) {
        this.service = service;
        this.purchasingService = purchasingService;
        this.salesService = salesService;
        this.coreService = coreService;
    }

    formOptions = {
        cancelText: "Kembali",
        saveText: "Simpan",
        deleteText: "Hapus",
        editText: "Ubah"
    };

    controlOptions = {
        label: {
            length: 3
        },
        control: {
            length: 6
        }
    };

    doDetailColumns = [
        { header: "Kode Barang", value: "ProductCode" },
        { header: "Nama Barang", value: "ProductName" },
        { header: "RO", value: "RONo" },
        { header: "Plan PO", value: "PlanPO" },
        { header: "Jumlah", value: "Quantity" },
        { header: "Satuan", value: "SmallUomUnit" },
    ];

    tradingDetails = {
        columns: [
            "Kode Barang",
            "Komoditas",
            "Keterangan",
            "Size",
            "Warna",
            "Jumlah Datang",
            "Satuan"
        ],
        viewColumns: [
            { header: "Kode Barang", value: "product" },
            { header: "Keterangan", value: "DesignColor" },
            { header: "Warna", value: "Color" },
            { header: "Size", value: "size" },
            { header: "Jumlah", value: "Quantity" },
            { header: "Sisa", value: "RemainingQuantity" },
            { header: "Satuan", value: "uom" }
        ],
        onAdd: function () {
            this.data.Items.push({ IsSave: true, Product: {Code : "", Name :""} , Comodity: this.data.Comodity, Uom: this.uom });
        }.bind(this),
        options: {
            checkedAll: true,
            tradingList: {}
        }
    };

    async bind(context) {
        this.context = context;
        this.data = this.context.data;
        this.error = this.context.error;
        this.data.FinishingInType = "PEMBELIAN";

        if (!this.data.Unit) {
            var unit = await this.coreService.getTradingUnit({ size: 1, keyword: 'TD2', filter: JSON.stringify({ Code: 'TD2' }) });
            this.data.Unit = unit.data[0];
        }
    }

    unitView = (unit) => {
        return `${unit.Code} - ${unit.Name}`;
    }

    get supplierLoader() {
        return SupplierLoader;
    }

    get urnLoader() {
        return (keyword) => {
            var info = {
                keyword: keyword,
                filter: JSON.stringify({ SupplierId: this.data.Supplier.Id, UnitId : this.data.Unit.Id })
            };
            return this.purchasingService.getGarmentURN(info)
                .then((result) => {
                    var doList = [];
                    for (var a of result.data) {
                        if (doList.length == 0) {
                            doList.push(a);
                        }
                        else {
                            var dup = doList.find(d => d.DONo == a.DONo);
                            if (!dup) {
                                doList.push(a);
                            }
                        }

                    }
                    return doList;

                });
        }
    }

    urnView = (urn) => {
        return `${urn.DONo}`;
    }

    supplierView = (supplier) => {
        if (!supplier.code)
            return `${supplier.Code} - ${supplier.Name}`
        else
            return `${supplier.code} - ${supplier.name}`
    }

    get unitLoader() {
        return UnitLoader;
    }

    @computedFrom("data.Supplier")
    get filter() {
        if (this.data.Supplier) {
            return {
                SupplierId: this.data.Supplier.Id,
                UnitId : this.data.Unit.Id
            };
        } else {
            return {
                SupplierId: 0
            };
        }
    }

    selectedSupplierChanged(newValue) {
        this.data.Supplier = newValue;
        this.context.selectedURNViewModel.editorValue = "";
        this.selectedURN = null;
    }

    async selectedURNChanged(newValue, oldValue) {
        this.selectedRONo = null;

        if (newValue) {
            this.data.DOId = newValue.DOId;
            this.data.DONo = newValue.DONo;

            Promise.resolve(this.purchasingService.getGarmentDOById(newValue.DOId))
                .then(result => {
                    this.garmentDOData = result;
                    this.itemsRONo = [""];
                    for (var item of result.items) {
                        for (var detail of item.fulfillments) {
                            // if (this.itemsRONo.indexOf(detail.rONo) < 0 && detail.product.Code === "PRC001") {
                            //     this.itemsRONo.push(detail.rONo);
                            // }
                            
                            if (this.itemsRONo.indexOf(detail.rONo) < 0) {
                                this.itemsRONo.push(detail.rONo);
                            }
                        }
                    }
                });

        } else {
            this.data.DOId = 0;
            this.data.DONo = null;
        }
    }

    selectedRONoChanged(newValue, oldValue) {
        this.dataDODetails.splice(0);
        this.data.Items.splice(0);
        this.tradingDetails.options.tradingList = {};

        if (newValue && newValue != oldValue) {
            this.data.RONo = newValue;

            let DODetailIds = [];
            for (var item of this.garmentDOData.items) {
                for (var detail of item.fulfillments) {
                    // if (detail.rONo === newValue && detail.product.Code === "PRC001") {
                    //     DODetailIds.push(detail.Id);
                    // }
                    if (detail.rONo === newValue) {
                        DODetailIds.push(detail.Id);
                    }
                }
            }

            const DODetailIdFilter = DODetailIds
                .filter((DODetailId, i) => DODetailIds.indexOf(DODetailId) == i)
                .map(DODetailId => "DODetailId==" + DODetailId)
                .join(" || ");
            const filter = { SupplierId: this.data.Supplier.Id };
            filter[`Items.Any(${DODetailIdFilter})`] = true;
            const info = {
                filter: JSON.stringify(filter)
            };

            const costCalculationInfo = {
                filter: JSON.stringify({ RO_Number: newValue })
            };

            this.salesService.getCostCalculation(costCalculationInfo)
                .then(ccResult => {
                    if (ccResult.data && ccResult.data[0]) {
                        this.data.Article = ccResult.data[0].Article;
                        this.data.Comodity = ccResult.data[0].Comodity;
                        this.uom = ccResult.data[0].UOM;
                    }

                    this.purchasingService.getGarmentURN(info)
                        .then(urnResult => {
                            if (urnResult.data) {
                                let quantityByDODetailId = {};
                                let priceByDODetailId = {};
                                let remarkByDODetailId = {};
                                for (const data of urnResult.data) {
                                    for (const item of data.Items) {
                                        priceByDODetailId[item.DODetailId] = (priceByDODetailId[item.DODetailId] || 0) + (item.PricePerDealUnit * data.DOCurrencyRate);
                                        quantityByDODetailId[item.DODetailId] = (quantityByDODetailId[item.DODetailId] || 0) + (item.ReceiptCorrection * item.CorrectionConversion);
                                        remarkByDODetailId[item.DODetailId] = (remarkByDODetailId[item.DODetailId] || "") + item.ProductRemark;
                                    }
                                }
                                for (var item of this.garmentDOData.items) {
                                    for (var detail of item.fulfillments) {
                                        // if (detail.rONo === newValue && detail.product.Code === "PRC001") {
                                        //     this.dataDODetails.push({
                                        //         ProductCode: detail.product.Code,
                                        //         ProductName: detail.product.Name,
                                        //         RONo: detail.rONo,
                                        //         PlanPO: detail.poSerialNumber,
                                        //         Quantity: quantityByDODetailId[detail.Id] || 0,
                                        //         SmallUomUnit: detail.smallUom.Unit
                                        //     });

                                        console.log(detail);

                                        if (detail.rONo === newValue) {
                                            this.dataDODetails.push({
                                                ProductCode: detail.product.Code,
                                                ProductName: detail.product.Name,
                                                RONo: detail.rONo,
                                                PlanPO: detail.poSerialNumber,
                                                Quantity: quantityByDODetailId[detail.Id] || 0,
                                                SmallUomUnit: detail.smallUom.Unit,
                                            });

                                            var _product = {
                                                Id : detail.product.Id,
                                                Code : detail.product.Code,
                                                Name : detail.product.Name
                                            }

                                            this.tradingDetails.options.tradingList[detail.product.Code] = {
                                                // ProductCode: detail.product.Code,
                                                // ProductName: detail.product.Name,
                                                Product : _product,
                                                DesignColor : remarkByDODetailId[detail.Id] || "",
                                                Quantity: quantityByDODetailId[detail.Id] || 0,
                                                BasicPrice: priceByDODetailId[detail.Id] || 0,
                                                DODetailId: detail.Id,
                                            };

                                            this.tradingDetails.options.checkedAll = true;                 
                                        }
                                    }
                                }
                            }
                        });
                    // this.data.Items.sort((a, b) => a.Color.localeCompare(b.Color) || a.SizeName.localeCompare(b.SizeName));
                });
        } else {
            this.data.RONo = null;
            this.data.Article = null;
            this.data.Comodity = null;
        }
    }

    changeCheckedAll() {
        (this.data.Items || []).forEach(i => i.IsSave = this.tradingDetails.options.checkedAll);
    }

    get totalQuantity() {
        this.data.TotalQuantity = this.dataDODetails.reduce((acc, cur) => acc += cur.Quantity, 0) - this.data.Items.filter(i => i.IsSave).reduce((acc, cur) => acc += cur.Quantity, 0);
        return this.data.TotalQuantity;
    }
}