import { inject, bindable, containerless, BindingEngine, computedFrom } from 'aurelia-framework'
import { Service as GLDOService } from "../../delivery-order/service"

// const UnitLoader = require('../../../../../loader/garment-unitsAndsample-loader');
// const BuyerLoader = require('../../../../../loader/garment-leftover-warehouse-buyer-loader');
// const SalesNoteLoader = require('../../../../../loader/garment-shipping-local-sales-note-loader');
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
    @bindable isEdit = false;
    @bindable isCreate = false;
    @bindable selectedUnit;
    @bindable title;
    @bindable data = {};
    @bindable selectedBuyer;
    @bindable selectedSalesNote;
    @bindable selectedType;
    @bindable selectedGLDO;

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

    @computedFrom("readOnly")
    get items() {
        return {
            columns: 
            //this.readOnly ? 
            [
                "Unit Asal",
                "PO No",
                "Satuan",
                "Jumlah Keluar"
            ],
            // ] : [
            //     "Unit Asal",
            //     "PO No",
            //     "Satuan",
            //     "Jumlah Stock",
            //     "Jumlah Keluar"
            // ],
            options: {
                existingItems: this.existingItems
            }
        };
    };

    expenditureDestinations = [
        "UNIT",
        "JUAL LOKAL",
        "LAIN-LAIN"
    ];

    get garmentLeftoverWarehouseDeliveryOrderLoader() {
        return GLDeliveryOrderLoader;
    }

    gldoView = (data) => {
        return `${data.DONo}`;
    }

    unitView = (data) => {
        return `${data.Code} - ${data.Name}`;
    }

    buyerView = (data) => {
        return `${data.Code} - ${data.Name}`;
    }

    get gldoFilter() {
        return {
            ExpenditureType: "FABRIC",
            IsUsed: false
        };
    }

    bind(context) {
        this.context = context;
        this.data = context.data;
        this.error = context.error;

        if (this.data && this.data.Id) {
            this.data.ExpenditureType = "FABRIC";
            this.selectedUnit = {
                Code: this.data.UnitExpenditure.Code,
                Name: this.data.UnitExpenditure.Name
            };

            this.existingItems = this.data.Items.map(i => {
                return {
                    StockId: i.StockId,
                    Quantity: i.Quantity
                };
            });

            this.selectedGLDO = {
                DONo: this.data.DONo
            };

            this.selectedSalesNote = {
                noteNo: this.data.LocalSalesNoteNo
            };

            this.selectedBuyer = this.data.Buyer;
        }
    }

    clearDataProperties(data) {
        data.DOId = data.Id;
        data.ExpenditureDestination = data.ExpenditureTo;
        data.ExpenditureDate = data.DODate;

        data.Items.forEach(x => {
            x.DOId = data.Id;
            x.DOItemId = x.Id;
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
        this.selectedUnit = null;
        this.selectedBuyer = null;
        this.existingItems = [];

        if (newValue && newValue.Id) {
            await this.gldoService.getById(newValue.Id).then(data => {
                var mapped = this.clearDataProperties(data);
                Object.assign(this.data, mapped);

                this.selectedSalesNote = {
                    noteNo : this.data.LocalSalesNoteNo
                };

                this.selectedUnit = {
                    Code: this.data.UnitExpenditure.Code,
                    Name: this.data.UnitExpenditure.Name
                };

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
            this.data.ExpenditureDestination = null;
            this.data.LocalSalesNoteNo = null;
            this.data.UnitExpenditure = null;
            this.data.EtcRemark = "";
            this.data.Remark = "";
            this.data.Buyer = null;
            this.data.QtyKG = 0;
            this.data.Items = [];
        }
    }

    get isUsed() {
        return (this.data.IsUsed || this.data.IsBC || !this.data.DOId);
    }
}
