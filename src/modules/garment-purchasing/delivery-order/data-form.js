import { inject, bindable, containerless, computedFrom, BindingEngine } from 'aurelia-framework'
import { Service } from "./service";
var SupplierLoader = require('../../../loader/garment-supplier-loader');

@containerless()
@inject(BindingEngine, Element)
export class DataForm {
    @bindable readOnly = false;
    @bindable data = {};
    @bindable error = {};
    @bindable title;
    @bindable supplier;
    @bindable options = {};
    @bindable isView = false;
    @bindable supplierImport = false;
    @bindable showHSCodePopup = false;
    @bindable productHSCodeList = [];
    @bindable onHSCode = false;
    shipmentTypes = ['By Air', 'By Sea']
    controlOptions = {
        label: {
            length: 4
        },
        control: {
            length: 3
        }
    }
    itemsInfo = {
        columns: [{ header: "Nomor PO External", value: "purchaseOrderExternal" }],
        onAdd: function () {
            this.context.ItemsCollection.bind();
            this.data.items.push({ purchaseOrderExternal: { no: "" } });
        }.bind(this)
    };
    // itemsColumns = [{ header: "Nomor PO External", value: "purchaseOrderExternal" }]

    constructor(bindingEngine, element) {
        this.bindingEngine = bindingEngine;
        this.element = element;
    }

    bind(context) {
        this.context = context;
        this.data = this.context.data;
        this.error = this.context.error;
        console.log(this.data);
        //this.options.isImport = this.isImport;
        this.Import = false;
        var hasItems=true;
        if (this.data.items.length==0)
            hasItems=false;
        // console.log(this.data.supplier.Import);
        
        if(this.supplierImport == true){
            this.supplierImport=true;
        }
        
        
        // if (this.data.totalQuantity)
        //     this.data.totalQuantity=this.data.totalQuantity.toLocaleString('en-EN', { minimumFractionDigits: 2 });
        // if (this.data.totalAmount)
        //     this.data.totalAmount=this.data.totalAmount.toLocaleString('en-EN', { minimumFractionDigits: 2 });
    }

    @computedFrom("data.Id")
    get isEdit() {
        return (this.data.Id || '').toString() != '';
    }

    @computedFrom("data.supplier")
    get filter() {
        if(this.context.hasCreate){
            var filter = {
                supplierId: this.data.supplierId || this.data.supplier.Id,
                isEdit: this.isEdit,
                hasView: this.context.hasView,
                hasEdit:this.context.hasEdit,
                hasCreate:this.context.hasCreate,
                isImport: this.isImport
            }
        } else {
            var filter = {
                supplierId: this.data.supplierId || this.data.supplier.Id,
                paymentType: this.data.paymentType,
                paymentMethod: this.data.paymentMethod,
                isUseVat: this.data.useVat,
                vatRate: this.data.vat.Rate,
                isIncomeTax: this.data.useIncomeTax,
                incomeTaxName: this.data.incomeTax.Name || undefined,
                incomeTaxRate: this.data.incomeTax.Rate || undefined,
                isEdit: this.isEdit,
                hasView: this.context.hasView,
                hasEdit:this.context.hasEdit,
                hasCreate:this.context.hasCreate,
                supplierImport: this.data.supplier.Import
            }
        }
        return filter;
    }

    @computedFrom("data.supplier")
    get supplierType() {
        if(this.context.hasCreate){
            if(!this.data.supplier.import)
            return (this.data.supplier.Import || false) ? "Import" : "Lokal";
            else
            return (this.data.supplier.import || false) ? "Import" : "Lokal";
        } else {
            return (this.data.supplier.Import || false) ? "Import" : "Lokal";
        }
    }

    @computedFrom("data.supplier")
    get isImport() {
        if (this.data.supplier) {
            return (this.data.supplier.import || false);
        } else {
            return false
        }
    }

    supplierChanged(newValue, oldValue) {
        var selectedSupplier = newValue;
        if (selectedSupplier) {
            if (selectedSupplier.Id) {
                this.data.supplier = selectedSupplier;
                this.data.supplierId = selectedSupplier.Id;
            }
        } else {
            this.data.supplier = {};
            this.data.supplierId = undefined;
        }
        this.data.shipmentType = "";
        this.data.shipmentNo = "";
        this.data.items = [];
        this.resetErrorItems();
    }

    get supplierLoader() {
        return SupplierLoader;
    }

    supplierView = (supplier) => {
        if(!supplier.code)
        return `${supplier.Code} - ${supplier.Name}`
        else
        return `${supplier.code} - ${supplier.name}`
    }

    resetErrorItems() {
        if (this.error) {
            if (this.error.items) {
                this.error.items = [];
            }
        }
    }
    
    shipmentTypeChanged(e) {
        var selectedPayment = e.srcElement.value;
        if (selectedPayment) {
            this.data.shipmentNo = "";
        }
    }

    itemChanged(e){
        console.log("after change parent",this);
        console.log("after change parent event",e);
        this.updateProductHSCodeList();
        this.onHSCode = true;
    }

    showProductHSCode() {
        
        const products = this.data.items.flatMap(item =>
            item.fulfillments
            .filter(detail => detail.isSave === true)
            .map(detail => detail.product)
        );
        console.log("All Products:", products);
        
        const uniqueProducts = products.filter(
        (value, index, self) =>
            index === self.findIndex((t) => t.Code === value.Code && t.Name === value.Name)
        );

        this.productHSCodeList = uniqueProducts.map(p => ({
            productName: p.Name+ "-" + p.Code,
            hsCode: p.HSCode || p.HsCode || "" 
        }));

        this.showHSCodePopup = true;
        console.log("Unique Products:", this.productHSCodeList);
        }

    closePopup(event) {
    if (!event || event.target.classList.contains('hs-popup-overlay')) {
        this.showHSCodePopup = false;
    }
    }

    saveHSCode() {
        console.log("Data HS Code disimpan:", this.productHSCodeList);

        this.data.items.forEach(item => {
            item.fulfillments.forEach(detail => {
            const match = this.productHSCodeList.find(p => p.productName === detail.product.Name+"-"+detail.product.Code);
            if (match) {
                detail.product.HSCode = match.hsCode;
            }
            });
        });

    alert("HS Code berhasil diperbarui!");
    this.showHSCodePopup = false;
    console.log("Data setelah menyimpan HS Code:", this.data);
    }

    updateProductHSCodeList() {

        const products = this.data.items.flatMap(item =>
        item.fulfillments.map(detail => detail.product)
        );

        const uniqueProducts = products.filter(
            (value, index, self) =>
                index === self.findIndex((t) => t.Code === value.Code && t.Name === value.Name)
        );

        const oldHSCodeMap = new Map();
        if (this.productHSCodeList && this.productHSCodeList.length > 0) {
            this.productHSCodeList.forEach(p => {
                oldHSCodeMap.set(p.productName, p.hsCode);
            });
        }

        this.productHSCodeList = uniqueProducts.map(p => {
            const key = p.Name + "-" + p.Code;
            return {
                productName: key,
                hsCode: oldHSCodeMap.get(key) || p.HSCode || ""
            };
        });

        console.log("Updated HSCode List:", this.productHSCodeList);
        }



    get deleted() {
        var receiptQty = 0;

        for(var item of this.data.items)
        {
            
            for(var detail of item.fulfillments)
            {
                receiptQty += detail.receiptQuantity;
            }

        }
        return receiptQty !=0 || this.data.isCustoms || this.data.isInvoice;
        //return this.data.isCustoms;
    }
} 
