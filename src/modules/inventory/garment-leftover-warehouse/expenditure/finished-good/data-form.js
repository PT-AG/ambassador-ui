import { inject, bindable, containerless, computedFrom, BindingEngine } from 'aurelia-framework'
import { Service as GLDOService } from "../../delivery-order/service"

//const UnitLoader = require('../../../../../loader/garment-unitsAndsample-loader');
// const BuyerLoader = require('../../../../../loader/garment-leftover-warehouse-buyer-loader');
//const SalesNoteLoader = require('../../../../../loader/garment-shipping-local-sales-note-loader');
const GLDeliveryOrderLoader = require('../../../../../loader/garment-leftover-warehouse-delivery-order-loader');

@containerless()
@inject(BindingEngine, GLDOService)
export class DataForm {

    constructor(bindingEngine, GLDOService) {
        this.bindingEngine = bindingEngine;
        this.gldoService = GLDOService;
    }

    identityProperties = [
        "Id",
        "_Active",
        "_CreatedUtc",
        "_CreatedBy",
        "_CreatedAgent",
        "_LastModifiedUtc",
        "_LastModifiedBy",
        "_LastModifiedAgent",
        "_IsDeleted",
    ];

    @bindable readOnly = false;
    @bindable title;
    @bindable selectedSalesNote;
    @bindable selectedBuyer;
    @bindable selectedGLDO;
    @bindable selectedUnit;
    @bindable data = {};

    controlOptions = {
        label: {
            length: 3
        },
        control: {
            length: 5
        }
    };

    formOptions = {
        builtInActions: false
    };

    footerOptions = {
        label: {
            length: 3
        },
        control: {
            length: 2
        }
    };

    // itemsColumns = [
    //     { header: "Komoditi", value: "LeftoverComodity" },
    //     { header: "Unit Asal", value: "UnitCode" },
    //     { header: "RO", value: "RONo" },
    //     { header: "Jumlah Stock", value: "StockQuantity" },
    //     { header: "Jumlah Keluar", value: "ExpenditureQuantity" },
    // ]

    viewItemsColumns = [
        { header: "Komoditi", value: "LeftoverComodity" },
        { header: "Unit Asal", value: "UnitCode" },
        { header: "RO", value: "RONo" },
        { header: "Jumlah Keluar", value: "ExpenditureQuantity" },
    ]

    expenditureToOptions = ["JUAL LOKAL", "LAIN-LAIN"];

    get buyerLoader() {
        return BuyerLoader;
    }

    // get unitLoader() {
    //     return UnitLoader;
    // }

    // unitView = (data) => {
    //     return `${data.Code} - ${data.Name}`;
    // }

    buyerView = (buyer) => {
        return `${buyer.Code} - ${buyer.Name}`;
    }

    get gldoFilter() {
        return {
            ExpenditureType: "BARANG JADI",
            IsUsed: false
        };
    }

    get garmentLeftoverWarehouseDeliveryOrderLoader() {
        return GLDeliveryOrderLoader;
    }

    gldoView = (data) => {
        return `${data.DONo}`;
    }

    bind(context) {
        this.context = context;
        this.data = context.data;
        this.error = context.error;
        this.Options = {
            isCreate: this.context.isCreate,
            isView: this.context.isView,
            isEdit: this.context.isEdit,
            checkedAll: this.context.isCreate == true ? false : true
        }

        if (this.data.Id) {
            this.data.ExpenditureType = "BARANG JADI";
            this.existingItems = this.data.Items.map(i => {
                return {
                    StockId: i.StockId,
                    Quantity: i.ExpenditureQuantity
                };
            });

            this.selectedGLDO = {
                DONo: this.data.DONo
            };

            this.Options.existingItems = this.existingItems;
            if (this.data.LocalSalesNoteId) {
                this.selectedSalesNote = {
                    noteNo: this.data.LocalSalesNoteNo,
                    id: this.data.LocalSalesNoteId
                };

                // this.selectedUnit = {
                //     Code: this.data.UnitExpenditure.Code,
                //     Name: this.data.UnitExpenditure.Name
                // };

                this.selectedBuyer = this.data.Buyer;
            }
        }
    }

    clearDataProperties(data) {
        data.DOId = data.Id;
        data.ExpenditureTo = data.ExpenditureTo;
        data.ExpenditureDate = data.DODate;
        data.OtherDescription = data.EtcRemark;
        data.Description = data.Remark;

        data.Items.forEach(x => {
            x.DOId = data.Id;
            x.DOItemId = x.Id;
            x.ExpenditureQuantity = x.Quantity;
        });

        this.identityProperties.forEach(prop => delete data[prop]);
        data.Items.forEach(item => {
            this.identityProperties.forEach(prop => delete item[prop]);
        });

        return data;
    }

    async selectedGLDOChanged(newValue) {
        if (this.data && this.data.Id) 
            return;

        this.selectedSalesNote = null;
        // this.selectedUnit = null;
        this.selectedBuyer = null;
        this.existingItems = [];

        if (newValue && newValue.Id) {
            await this.gldoService.getById(newValue.Id).then(data => {
                var mapped = this.clearDataProperties(data);
                Object.assign(this.data, mapped);

                this.selectedSalesNote = {
                    noteNo : this.data.LocalSalesNoteNo
                };

                // this.selectedUnit = {
                //     Code: this.data.UnitExpenditure.Code,
                //     Name: this.data.UnitExpenditure.Name
                // };

                this.selectedBuyer = this.data.Buyer;
                this.existingItems = this.data.Items.map(i => {
                    return {
                        StockId: i.StockId,
                        Quantity: i.Quantity
                    };
                });
            }).catch(e => {
                alert(e.Message || 'DO Sisa Tidak Ditemukan');
            });
        } else {
            this.data.DOId = null;
            delete this.data.ExpenditureDate;
            this.data.ExpenditureTo = null;
            this.data.LocalSalesNoteNo = null;
            this.data.UnitExpenditure = null;
            this.data.OtherDescription = "";
            this.data.Description = "";
            this.data.Buyer = null;
            this.data.QtyKG = 0;
            this.data.Items = [];
        }
    }

    // selectedUnitChanged(newValue) {
    //     if (this.data.Id) return;
    //     this.data.UnitExpenditure = newValue;
    // }

    // get addItems() {
    //     return (event) => {
    //         this.data.Items.push({})
    //     };
    // }

    // get removeItems() {
    //     return (event) => {
    //         this.error = null;
    //         //this.Options.error = null;
    //     };
    // }

    // selectedSalesNoteChanged(newValue) {
    //     if (this.data.Id) return;
    //     this.data.LocalSalesNoteNo = null;
    //     this.data.LocalSalesNoteId = 0;
    //     if (newValue) {
    //         this.data.LocalSalesNoteNo = newValue.noteNo;
    //         this.data.LocalSalesNoteId = newValue.id;
    //     }
    // }

    get isUsed() {
        return (this.data.IsUsed || this.data.IsBC || !this.data.DOId);
    }
}