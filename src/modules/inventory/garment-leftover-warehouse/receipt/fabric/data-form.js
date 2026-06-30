import { inject, bindable, containerless, computedFrom, BindingEngine } from 'aurelia-framework'
import { GarmentCoreService, GarmentPurchasingService } from "./service";

const UnitLoader = require('../../../../../loader/garment-unitsAndsample-loader');
const UnitExpenditureNoteLoader = require('../../../../../loader/garment-unit-expenditure-note-loader');

const UnitDeliveryReturnLoader = require('../../../../../loader/garment-delivery-retur-loader');
const SampleDeliveryReturnLoader = require('../../../../../loader/garment-sample-delivery-return-loader');

@inject(GarmentPurchasingService, GarmentCoreService)
export class DataForm {

    constructor(garmentPurchasingService, garmentCoreService) {
        this.garmentPurchasingService = garmentPurchasingService;
        this.garmentCoreService = garmentCoreService;
    }

    @bindable readOnly = false;
    @bindable title;
    @bindable selectedUnitFrom;
    @bindable selectedUnitExpenditureNote;
    @bindable selectedUnitDeliveryReturn;

    controlOptions = {
        label: {
            length: 3
        },
        control: {
            length: 5
        }
    };

    itemsColumns = [
        { header: "Kode Barang", value: "ProductCode" },
        { header: "Nama Barang", value: "ProductName" },
        { header: "No PO", value: "POSerialNumber" },
        { header: "Komposisi", value: "Composition" },
        { header: "Keterangan Fabric", value: "FabricRemark" },
        { header: "Jumlah", value: "Quantity" },
        { header: "Satuan", value: "UomUnit" },
    ];

    ReceiptOptions = ["GUDANG", "SISA PRODUKSI"];

    get unitLoader() {
        return UnitLoader;
    }

    get unitExpenditureNoteLoader() {
        return UnitExpenditureNoteLoader;
    }

    get unitDeliveryReturnLoader() {
        return UnitDeliveryReturnLoader;
    }

    get sampleDeliveryReturnLoader() {
        return SampleDeliveryReturnLoader
    }

    unitView = (unit) => {
        return `${unit.Code} - ${unit.Name}`;
    }

    @computedFrom("data.UnitFrom")
    get unitExpenditureNoteFilter() {
        return {
            IsReceived: false,
            ExpenditureType: "SISA",
            StorageName: "GUDANG BAHAN BAKU",
            UnitSenderId: (this.data.UnitFrom || {}).Id || 0
        };
    }

    @computedFrom("data.UnitFrom", "data.ReceiptType")
    get unitDeliveryReturnFilter() {
        return {
            IsUsed: false,
            ReturnType: "SISA PRODUKSI",
            StorageName: "GUDANG BAHAN BAKU",
            UnitId: (this.data.UnitFrom || {}).Id || 0,
        }
    }

    bind(context) {
        this.context = context;
        this.data = context.data;
        this.error = context.error;

        if (this.data && this.data.Id) {
            this.selectedUnitFrom = {
                Code: this.data.UnitFrom.Code,
                Name: this.data.UnitFrom.Name
            };

            this.selectedUnitExpenditureNote = {
                UENNo: this.data.UENNo
            };

            this.data.StorageFromName = this.data.StorageFrom.name;
            for (const item of this.data.Items) {
                item.ProductCode = item.Product.Code;
                item.ProductName = item.Product.Name;
                item.UomUnit = item.Uom.Unit;
            }

            if (this.data && this.data.DRId) {
                this.garmentPurchasingService.getUnitExpenditureNoteById(this.data.UENId)
                    .then(dataUnitExpenditureNote => {
                        this.garmentPurchasingService.getUnitDeliveryOrderById(dataUnitExpenditureNote.UnitDOId)
                            .then(dataUnitDeliveryOrder => {
                                this.data.ROJob = dataUnitDeliveryOrder.RONo;
                            });
                    });

                this.selectedUnitDeliveryReturn = {
                    Id : this.data.DRId,
                    DRNo : this.data.DRNo
                };
            }

            if (this.data && this.data.UENId) {
                this.garmentPurchasingService.getUnitExpenditureNoteById(this.data.UENId)
                    .then(dataUnitExpenditureNote => {
                        this.garmentPurchasingService.getUnitDeliveryOrderById(dataUnitExpenditureNote.UnitDOId)
                            .then(dataUnitDeliveryOrder => {
                                this.data.ROJob = dataUnitDeliveryOrder.RONo;
                            });
                    });
            }
        }
    }

    selectedUnitFromChanged(newValue) {
        if (this.data.Id) return;

        this.data.UnitFrom = newValue;

        this.selectedUnitExpenditureNote = null;
    }

    selectedUnitExpenditureNoteChanged(newValue) {
        if (this.data.Id) return;

        this.data.Items.splice(0);

        if (newValue) {
            this.garmentPurchasingService.getUnitExpenditureNoteById(newValue.Id)
                .then(dataUnitExpenditureNote => {
                    this.garmentPurchasingService.getUnitDeliveryOrderById(dataUnitExpenditureNote.UnitDOId)
                        .then(dataUnitDeliveryOrder => {
                            this.data.UENId = dataUnitExpenditureNote.Id;
                            this.data.UENNo = dataUnitExpenditureNote.UENNo;
                            this.data.StorageFrom = dataUnitExpenditureNote.Storage;
                            this.data.StorageFromName = dataUnitExpenditureNote.Storage.name;
                            this.data.ExpenditureDate = dataUnitExpenditureNote.ExpenditureDate;

                            for (const item of dataUnitExpenditureNote.Items) {
                                this.garmentCoreService.getProductById(item.ProductId)
                                    .then(product => {
                                        this.data.Items.push({
                                            UENItemId: item.Id,
                                            POSerialNumber: item.POSerialNumber,
                                            Product: {
                                                Id: item.ProductId,
                                                Code: item.ProductCode,
                                                Name: item.ProductName
                                            },
                                            ProductCode: item.ProductCode,
                                            ProductName: item.ProductName,
                                            FabricRemark: product.Const + "; " + product.Yarn + "; " + product.Width,
                                            Composition: product.Composition,
                                            ProductRemark: item.ProductRemark,
                                            BasicPrice: item.BasicPrice,
                                            Quantity: item.Quantity,
                                            Uom: {
                                                Id: item.UomId,
                                                Unit: item.UomUnit
                                            },
                                            UomUnit: item.UomUnit
                                        });

                                    });
                            }

                            this.data.ROJob = dataUnitDeliveryOrder.RONo;
                        })
                });
        } else {
            this.data.DRId = null;
            this.data.DRNo = null;
            this.data.UENId = 0;
            this.data.UENNo = null;
            this.data.StorageFrom = null;
            this.data.StorageFromName = null;
            delete this.data.ExpenditureDate;
            this.data.ROJob = null;
            this.context.UnitExpenditureNoteViewModel.editorValue = "";
        }
    }

    selectedUnitDeliveryReturnChanged(newValue) {
        if (this.data.Id) return;

        this.data.Items.splice(0);

        if (newValue) {
            this.data.DRId = newValue.Id;
            this.data.DRNo = newValue.DRNo;

            this.garmentPurchasingService.getUnitExpenditureNoteById(newValue.UENId)
                .then(dataUnitExpenditureNote => {
                    this.garmentPurchasingService.getUnitDeliveryOrderById(dataUnitExpenditureNote.UnitDOId)
                        .then(dataUnitDeliveryOrder => {
                            this.data.UENId = dataUnitExpenditureNote.Id;
                            this.data.UENNo = dataUnitExpenditureNote.UENNo;
                            this.data.StorageFrom = dataUnitExpenditureNote.Storage;
                            this.data.StorageFromName = dataUnitExpenditureNote.Storage.name;
                            this.data.ExpenditureDate = dataUnitExpenditureNote.ExpenditureDate;

                            for (const item of newValue.Items) {
                                var unitExpenditureItem =
                                    dataUnitExpenditureNote.Items.find(x => x.Id == item.UENItemId);

                                this.garmentCoreService.getProductById(item.Product.Id)
                                    .then(product => {
                                        this.data.Items.push({
                                            DRItemId: item.Id,
                                            UENItemId: item.UENItemId,
                                            POSerialNumber: unitExpenditureItem ? unitExpenditureItem.POSerialNumber : "-",
                                            Product: {
                                                Id: item.Product.Id,
                                                Code: item.Product.Code,
                                                Name: item.Product.Name
                                            },
                                            ProductCode: item.Product.Code,
                                            ProductName: item.Product.Name,
                                            FabricRemark: product.Const + "; " + product.Yarn + "; " + product.Width,
                                            Composition: product.Composition,
                                            ProductRemark: unitExpenditureItem ? unitExpenditureItem.ProductRemark : "-",
                                            BasicPrice: unitExpenditureItem ? unitExpenditureItem.BasicPrice : 0,
                                            Quantity: item.Quantity,
                                            Uom: {
                                                Id: item.Uom.Id,
                                                Unit: item.Uom.Unit
                                            },
                                            UomUnit: item.Uom.Unit
                                        });
                                    });
                            }

                            this.data.ROJob = dataUnitDeliveryOrder.RONo;
                        });
                    });
        } else {
            this.data.DRId = null;
            this.data.DRNo = null;
            this.data.UENId = 0;
            this.data.UENNo = null;
            this.data.StorageFrom = null;
            this.data.StorageFromName = null;
            delete this.data.ExpenditureDate;
            this.data.ROJob = null;
            this.context.UnitExpenditureNoteViewModel.editorValue = "";
        }
    }
}
