import { inject, bindable, computedFrom } from 'aurelia-framework'
import { Service } from "./service";

const UnitLoader = require('../../../../loader/garment-unitsAndsample-loader');
const BuyerLoader = require('../../../../loader/garment-leftover-warehouse-buyer-loader');
const SalesNoteLoader = require('../../../../loader/garment-shipping-local-sales-note-loader');

@inject(Service)
export class DataForm {

    constructor(service) {
        this.service = service;
    }

    @bindable readOnly = false;
    @bindable isEdit = false;
    @bindable isCreate = false;
    @bindable title;
    @bindable selectedUnit;
    @bindable selectedBuyer;
    @bindable selectedSalesNote;
    @bindable manual;

    get buyerLoader() {
        return BuyerLoader;
    }

    get unitLoader() {
        return UnitLoader;
    }

    get localSalesNoteLoader() {
        return SalesNoteLoader;
    }

    buyerView = (buyer) => {
        return `${buyer.Code} - ${buyer.Name}`;
    }

    unitView = (unit) => {
        return `${unit.Code} - ${unit.Name}`;
    }

    controlOptions = {
        label: {
            length: 3
        },
        control: {
            length: 5
        }
    };

    footerOptions = {
        label: {
            length: 3
        },
        control: {
            length: 2
        }
    };

    @computedFrom("readOnly", "data.ExpenditureType", "data.AvalType")
    get items() {
        let columns = [];
        
        if (this.data.ExpenditureType === "FABRIC") {
            columns = this.readOnly ? [
                "Unit Asal",
                "PO No",
                "Satuan",
                "Jumlah Keluar"
            ] : [
                "Unit Asal",
                "PO No",
                "Satuan",
                "Jumlah Stock",
                "Jumlah Keluar"
            ];
        } else if (this.data.ExpenditureType === "ACCESSORIES") {
            columns = this.readOnly ? [
                "Unit Asal",
                "Kode Barang",
                "Nama Barang",
                "PO No",
                "Satuan",
                "Jumlah Keluar"
            ] : [
                "Unit Asal",
                "Kode Barang",
                "Nama Barang",
                "PO No",
                "Satuan",
                "Jumlah Stock",
                "Jumlah Keluar"
            ];
        } else if (this.data.ExpenditureType === "AVAL") {
            columns = this.data.AvalType != "AVAL BAHAN PENOLONG" ? 
            [
                { header: "Unit Asal", value: "UnitCode" },
                { header: "Bon No", value: "AvalReceiptNo" },
                { header: "Jumlah Awal", value: "Quantity" },
                { header: "Jumlah Aktual ", value: "Quantity" },
                { header: "Satuan", value: "UomUnit" },
            ] : [
                { header: "Unit Asal" },
                { header: "Kode - Nama Barang" },
                { header: "Satuan" },
                { header: "Jumlah Stock" },
                { header: "Jumlah Keluar" },
            ];

            columns = this.readOnly ? columns.filter((col, index) => index !== 3) : columns;
        } else if (this.data.ExpenditureType === "BARANG JADI") {
            columns = this.readOnly ? [
                { header: "Komoditi", value: "LeftoverComodity" },
                { header: "Unit Asal", value: "UnitCode" },
                { header: "RO", value: "RONo" },
                { header: "Jumlah Keluar", value: "Quantity" },
            ] : [
                { header: "Komoditi", value: "LeftoverComodity" },
                { header: "Unit Asal", value: "UnitCode" },
                { header: "RO", value: "RONo" },
                { header: "Jumlah Stock", value: "StockQuantity" },
                { header: "Jumlah Keluar", value: "Quantity" },
            ];
        }
        
        return {
            columns: columns,
            onAdd: function () {
                this.data.Items.push({});
            }.bind(this),
            options: {
                isEdit: this.isEdit,
                existingItems: this.existingItems
            }
        };
    };

    expenditureDestinations = ["JUAL LOKAL", "UNIT", "LAIN-LAIN"];
    expenditureTypes = ["FABRIC", "ACCESSORIES", "AVAL", "BARANG JADI"];
    avalTypes = ["AVAL FABRIC", "AVAL BAHAN PENOLONG", "AVAL KOMPONEN"];

    bind(context) {
        this.context = context;
        this.data = context.data;
        this.error = context.error;
        this.expenditureDestinationTemp = this.expenditureDestinations;
        this.Options = {
            isCreate: this.context.isCreate,
            isView: this.context.isView,
            isEdit: this.context.isEdit,
            checkedAll: this.context.isCreate == true ? false : true
        }

        for (var item of this.data.Items) {
            item.type = this.data.AvalType;
        }

        this.selectedType = this.data.AvalType;
        if (this.data.Id) {
            this.existingItems = this.data.Items.map(i => {
                return {
                    StockId: i.StockId,
                    Quantity: i.Quantity
                };
            });

            this.selectedUnit = this.data.ExpenditureTo == "UNIT" ? this.data.UnitExpenditure : null;

            this.items.options.existingItems = this.existingItems;
            if (this.data.LocalSalesNoteId) {
                this.selectedSalesNote = {
                    noteNo: this.data.LocalSalesNoteNo,
                    id: this.data.LocalSalesNoteId
                };

                this.manual = false;
            } else {
                this.selectedSalesNote = {
                    noteNo: this.data.LocalSalesNoteNo
                };
                
                this.manual = true;
            }

            this.selectedBuyer = this.data.Buyer;
        }
    }

    expenditureDestinationsChanged() {
        this.context.selectedUnitViewModel.editorValue = "";
        this.selectedUnit = null;
        this.context.selectedBuyerViewModel.editorValue = "";
        this.selectedBuyer = null;
        this.data.RemarkEtc = null;
    }

    expenditureTypesChanged() {
        if (this.data.ExpenditureType == "AVAL" || this.data.ExpenditureType == "BARANG JADI") 
        {
            this.expenditureDestinationTemp = this.expenditureDestinations.filter(x => x != "UNIT");
        }

        this.data.Items.splice(0);
    }

    selectedUnitChanged(newValue) {
        if (this.data.Id) return;

        this.data.UnitExpenditure = newValue;
    }

    get addItems() {
        return (event) => {
            this.data.Items.push({
                type: this.data.AvalType
            })
        };
    }

    get removeItems() {
        return (event) => {
            this.error = null;
        };
    }

    selectedAvalTypeChanged() {
        if (!this.data.Id)
            this.data.Items.splice(0);
    }

    selectedSalesNoteChanged(newValue) {
        if (this.data.Id) return;

        this.data.LocalSalesNoteNo = null;
        this.data.LocalSalesNoteId = 0;
        if (newValue) {
            this.data.LocalSalesNoteNo = newValue.noteNo;
            this.data.LocalSalesNoteId = newValue.id;
        }
    }

    selectedBuyerChanged(newValue) {
        if (this.data.Id) return;

        this.data.Buyer = newValue;
    }

    manualChanged(newValue) {
        if (!this.data.Id) {
            if (this.context.selectedSalesNote)
                this.context.selectedSalesNote.editorValue = "";
            this.selectedSalesNote = null;
            this.data.LocalSalesNoteNo = "";
            this.data.LocalSalesNoteId = 0;
        }
    }
}