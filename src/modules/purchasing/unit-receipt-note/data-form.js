import { inject, bindable, BindingEngine, observable, computedFrom } from 'aurelia-framework';
import { Service } from "./service";
var UnitLoader = require('../../../loader/unit-loader');
var SupplierLoader = require('../../../loader/supplier-loader');
var DeliveryOrderBySupplierLoader = require('../../../loader/delivery-order-by-supplier-loader');
var StorageLoader = require('../../../loader/storage-loader');
var moment = require('moment');

@inject(BindingEngine, Element, Service)
export class DataForm {
    @bindable readOnly = false;
    @bindable data = {};
    @bindable error = {};
    @bindable unit;
    @bindable supplier;
    @bindable deliveryOrder;
    @bindable storage;

    constructor(bindingEngine, element, service) {
        this.bindingEngine = bindingEngine;
        this.element = element;
        this.service = service;



        this.auInputOptions = {
            label: {
                length: 4,
                align: "right"
            },
            control: {
                length: 5
            }
        };

        this.deliveryOrderItem = {
            columns: [
                { header: "No PR" },
                { header: "Barang" },
                { header: "Jumlah" },
                { header: "Satuan" },
                { header: "Keterangan" }
            ],
            // onRemove: function() {
            //     this.bind();
            // }
        };
    }
    @computedFrom("data.deliveryOrder", "data.unit")
    get storageFilter() {
        var storageFilter = {};
        if (this.data.unit) {
            storageFilter = {
                "UnitName": this.data.unit.name,
                "DivisionName": this.data.unit.division.name
            };
        }
        console.log(storageFilter);
        return storageFilter;
    }

    @computedFrom("data._id")
    get isEdit() {
        return (this.data._id || '').toString() != '';
    }


    @computedFrom("data.supplier", "data.unit")
    get filter() {
        var filter = {
            // "supplierId": this.data.supplierId,
            // "unitId": this.data.unitId
            supplierId: this.data.supplierId,
            unitId: "" // <-- paksa kosong biar bypass filter unit di backend
        };
        return filter;
    }

    storageFields = ["name", "code"];

    async bind(context) {
        this.context = context;
        this.data = this.context.data;
        this.error = this.context.error;
        if (this.data && this.data.supplier)
            this.data.supplier.toString = function () {
                return this.code + " - " + this.name;
            };
        if (this.data.isStorage && this.data.unit) {
            this.data.storage.unit = this.data.unit;
            this.storage = this.data.storage;
        }

        // if (this.data.isInventory) {
        //     this.storage = await this.service.getStorageById(this.data.storageId, this.storageFields);
        //     this.data.storage =this.storage;
        // }

        // if(!this.readOnly) {
        //     this.deliveryOrderItem.columns.push({ header: "" });
        // }
    }

    supplierChanged(newValue, oldValue) {
        var selectedSupplier = newValue;

        if (selectedSupplier) {
            this.data.supplier = selectedSupplier;
            this.data.supplierId = selectedSupplier._id || selectedSupplier.Id;
        }
        else {
            this.data.supplierId = undefined;
        }

        this.deliveryOrderAU.editorValue = "";
        this.data.deliveryOrderId = undefined;
        this.storage = null;
        this.data.isInventory = false;
    }

    unitChanged(newValue, oldValue) {
        var _selectedUnit = newValue;

        if (_selectedUnit) {
            this.data.unit = _selectedUnit;
            this.data.unit._id = _selectedUnit.Id || _selectedUnit._id;
            this.data.unit.name = _selectedUnit.Name || _selectedUnit.name;
            this.data.unit.code = _selectedUnit.Code || _selectedUnit.code;
            this.data.unitId = _selectedUnit.Id || _selectedUnit._id || "";
            this.data.unit.division = _selectedUnit.Division || _selectedUnit.division;
            this.data.unit.division._id = this.data.unit.division.Id || this.data.unit.division._id;
            this.data.unit.division.name = this.data.unit.division.Name || this.data.unit.division.name;
            this.data.unit.division.code = this.data.unit.division.Code || this.data.unit.division.code;
        }
        else {
            this.data.unitId = null;
        }

        this.deliveryOrderAU.editorValue = "";
        this.data.deliveryOrderId = undefined;
        this.data.storageId = undefined;
        this.storage = null;
        this.data.isInventory = false;
    }

    async deliveryOrderChanged(newValue, oldValue) {
        var selectedDo = newValue;

        if (selectedDo) {
            this.data.deliveryOrder = selectedDo;
            this.data.doId = selectedDo._id || selectedDo.Id;
            this.data.doNo = selectedDo.no;
            var selectedItem = selectedDo.items || [];

            var _items = [];
            var getEPO = [];
            for (var item of selectedItem) {
                var epoId = item.purchaseOrderExternal.Id || item.purchaseOrderExternal._id;
                getEPO.push(this.service.getEPOById(epoId));
                for (var fulfillment of item.fulfillments) {
                    var _item = {};

                    _item.product = fulfillment.product;
                    _item.deliveredUom = fulfillment.purchaseOrderUom;
                    _item.product.uom = _item.deliveredUom;
                    _item.purchaseOrder = fulfillment.purchaseOrder;
                    _item.purchaseOrderId = fulfillment.purchaseOrderId || fulfillment.PurchaseOrderId;
                    _item.purchaseOrderQuantity = fulfillment.purchaseOrderQuantity || fulfillment.PurchaseOrderQuantity;
                    _item.epoDetailId = fulfillment.EPODetailId || fulfillment.epoDetailId;
                    _item.prItemId = fulfillment.PRItemId || fulfillment.prItemId;
                    _item.poItemId = fulfillment.POItemId || fulfillment.poItemId;
                    _item.doDetailId = fulfillment.Id || fulfillment._id;
                    _item.prId = fulfillment.purchaseOrder.purchaseRequest.Id || fulfillment.purchaseOrder.purchaseRequest._id;
                    _item.prNo = fulfillment.purchaseOrder.purchaseRequest.No || fulfillment.purchaseOrder.purchaseRequest.no;
                    _item.epoId = epoId;
                    _item.deliveredQuantity = fulfillment.deliveredQuantity - fulfillment.receiptQuantity;

                    if (_item.deliveredQuantity > 0)
                        _items.push(_item);
                }
            }
            await Promise.all(getEPO).then(result => {
                var filteredItems = [];
                var selectedUnitId = this.data.unit ? (this.data.unit.Id || this.data.unit._id) : null;
                var selectedUnitCode = this.data.unit ? (this.data.unit.code || this.data.unit.Code) : null;
                var selectedUnitName = this.data.unit ? (this.data.unit.name || this.data.unit.Name) : null;

                for (var item of _items) {
                    var same = result.find(a => (a.Id || a._id) == item.epoId);
                    var isSameUnit = true;
                    if (same) {
                        item.epoNo = same.no;
                        item.incomeTaxBy = same.incomeTaxBy;

                        if (same.items && same.items.length > 0) {
                            var epoPoItem = same.items.find(i => (i.poId && i.poId == item.purchaseOrderId) || (i.details && i.details.some(d => d.poItemId == item.poItemId)));
                            if (epoPoItem && epoPoItem.unit) {
                                var u = epoPoItem.unit;
                                var uId = u.Id || u._id;
                                var uCode = u.code || u.Code;
                                var uName = u.name || u.Name;

                                if (selectedUnitId && uId && uId != 0 && uId != "0") {
                                    isSameUnit = selectedUnitId.toString() === uId.toString();
                                } else if (selectedUnitName && uName && uName != "-") {
                                    isSameUnit = selectedUnitName.toString().toLowerCase() === uName.toString().toLowerCase();
                                } else if (selectedUnitCode && uCode && uCode != "-") {
                                    isSameUnit = selectedUnitCode.toString().toLowerCase() === uCode.toString().toLowerCase();
                                }
                            }
                        }
                    }

                    if (isSameUnit) {
                        filteredItems.push(item);
                    }
                }
                this.data.items = filteredItems;
                console.log(this.data.items);
            });

        }
        else {
            this.data.items = [];
        }
        this.resetErrorItems();
        this.storage = null;
        this.data.isInventory = false;
    }

    isStorageChanged(e) {
        if (!this.data.isStorage) {
            this.storage = null;
            this.data.storage = null;
            this.data.storageId = null;
            console.log(this.data.storage)
        }
    }

    storageChanged(newValue, oldValue) {
        var selectedStorage = newValue;

        if (selectedStorage) {
            this.data.storage = selectedStorage;
            this.data.storageId = selectedStorage._id;
        }
        else {
            this.data.storageId = null;
        }

    }

    resetErrorItems() {
        if (this.error) {
            if (this.error.items) {
                this.error.items = [];
            }
        }
    }

    get unitLoader() {
        return UnitLoader;
    }

    get supplierLoader() {
        return SupplierLoader;
    }

    get storageLoader() {
        return StorageLoader;
    }

    get deliveryOrderBySupplierLoader() {
        return DeliveryOrderBySupplierLoader;
    }

    unitView = (unit) => {
        return unit.division ? `${unit.division.name} - ${unit.name}` : `${unit.Division.Name} - ${unit.Name}`;
    }

    supplierView = (supplier) => {
        return `${supplier.code} - ${supplier.name}`;
    }

    storageView = (storage) => {
        return `${storage.unit.name} - ${storage.name}`;
    }
} 