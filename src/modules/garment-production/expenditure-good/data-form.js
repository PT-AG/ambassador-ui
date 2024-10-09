import { bindable, inject, computedFrom } from "aurelia-framework";
import { Service,SalesService,PurchasingService } from "./service";

const UnitLoader = require('../../../loader/garment-units-loader');
const PlLoader= require('../../../loader/garment-shipping-invoice-loader');

@inject(Service,SalesService,PurchasingService)
export class DataForm {
    @bindable readOnly = false;
    @bindable isEdit = false;
    @bindable isCreate = false;
    @bindable title;
    @bindable data = {};
    // @bindable error = {};
    @bindable selectedRO;
    @bindable itemOptions = {};
    @bindable selectedUnit;
    @bindable selectedSize;
    @bindable sizes=[];
    @bindable selectedColor;
    @bindable selectedInvoice;
    @bindable manual;
    @bindable selectedExpenditureFrom;

    constructor(service,salesService,purchasingService) {
        this.service = service;
        this.salesService=salesService;
        this.purchasingService=purchasingService;
    }

    expenditureFromOptions = ["FINISHING","SEWING","LOADING", "CUTTING"];
    expenditureTypes=["EXPORT","LOKAL","LAIN-LAIN","SISA"];

    formOptions = {
        cancelText: "Kembali",
        saveText: "Simpan",
        deleteText: "Hapus",
        editText: "Ubah"
    };

    controlOptions = {
        label: {
            length: 2
        },
        control: {
            length: 7
        }
    };

    itemsColumns = [""];

    async bind(context) {
        this.context = context;
        this.data = this.context.data;
        this.error = this.context.error;
        this.isCreate=this.context.isCreate;
        this.itemOptions = {
            isEdit: this.context.isEdit,
            checkedAll: true,
            isCreate: this.context.isCreate
        
        }
        if (this.data && this.data.Items) {
            this.data.Items.forEach(
                item => {
                    item.IsSave = true;
                }
            );
            
        }

        if(this.data.PackingListId){
            this.selectedInvoice={
                invoiceNo:this.data.Invoice,
                id:this.data.PackingListId
            }
           // this.manual=false;
        }
        // else{
        //     this.manual=true;
        // }
    }

    unitView = (unit) => {
        return `${unit.Code} - ${unit.Name}`;
    }

    selectedExpenditureFromChanged(newValue, oldValue) {
        this.selectedRO=null;
        this.data.RONo = null;
        this.data.Article = null;
        this.data.Comodity=null;
        this.data.Items = [];
        this.data.Price=0;
        this.data.Buyer=null;
        this.data.ContractNo=null;
        this.data.Description ="";
        if (newValue) {
            this.data.ExpenditureFrom = newValue;
        }
        else {
            this.data.ExpenditureFrom = null;
        }
     }

    @computedFrom("data.ExpenditureFrom")
    get roLoader() {
        return (keyword) => {
            var info = {
              keyword: keyword,
              filter: JSON.stringify({UnitId: this.data.Unit.Id, "Quantity>0":true, FinishedFrom: this.data.ExpenditureFrom})
            };
            return this.service.getFinishedGoodByRo(info)
                .then((result) => {
                    var roList=[];
                        for(var a of result.data){
                            if(roList.length==0){
                                roList.push(a);
                            }
                            else{
                                var dup= roList.find(d=>d.RONo==a.RONo);
                                if(!dup){
                                    roList.push(a);
                                }
                            }
                        }
                    return roList;
                });
        }
    }

    get unitLoader() {
        return UnitLoader;
    }

    get plLoader() {
        return PlLoader;
    }

    get sewingOutLoader() {
        return SewingOutLoader;
    }

    // plFilter={
    //     status:"DELIVERED"
    // }

    selectedUnitChanged(newValue){
        this.selectedRO=null;
        this.data.RONo = null;
        this.data.Article = null;
        this.data.Comodity=null;
        this.data.Items = [];
        this.data.Price=0;
        this.data.Buyer=null;
        this.data.ContractNo=null;
        this.data.Description ="";
        if(newValue)
        {
            this.data.Unit=newValue;
        }
        else
        {
            this.data.Unit=null;
            this.data.RONo = null;
            this.data.Article = null;
            this.data.Comodity=null;
            this.data.Items.splice(0);
            this.data.Price=0;
            this.data.Buyer=null;
            this.data.ContractNo=null;
            this.data.Description ="";
        }
    }

    async selectedROChanged(newValue, oldValue){
        this.data.RONo = null;
        this.data.Article = null;
        this.data.Comodity=null;
        this.data.Buyer=null;
        this.data.ContractNo=null;
        this.data.Items.splice(0);
        this.sizes.splice(0);
        this.data.Price=0;
        this.data.Description ="";
        if (newValue) {
            this.context.error.Items = [];
            this.data.RONo = newValue.RONo;
            this.data.Article = newValue.Article;
            this.data.Comodity = newValue.Comodity;
            var items = [];

            let pr = await this.purchasingService.getGarmentPR({ size: 1, filter: JSON.stringify({ RONo: this.data.RONo }) });
                
            if (pr.data.length > 0) {
                this.data.Buyer = pr.data[0].Buyer;
                this.data.BuyerView = this.data.Buyer.Code + ' - ' + this.data.Buyer.Name;
            }

            let noResult = await this.salesService.getCostCalculationByRONo({ size: 1, filter: JSON.stringify({ RO_Number: this.data.RONo }) });
            if (noResult.data.length > 0) {
                this.data.Description = noResult.data[0].CommodityDescription;
            }

            var ROfilter = {};
            ROfilter[`SalesContractROs.Any(RONumber.Equals("${this.data.RONo}"))`] = true;

            let salesContractResult = await this.salesService.getSalesContractByRONo({ size: 1, filter: JSON.stringify(ROfilter) });
            if (salesContractResult.data.length > 0) {
                this.data.ContractNo = salesContractResult.data[0].SalesContractNo;
            }

            // let salesContractResult = await this.salesService.getSalesContractByRONo(this.data.RONo);
            // if(salesContractResult.data.length > 0) {
            //     this.data.ContractNo = salesContractResult.data[0].SalesContractNo;
            // }
            
            let priceResult = await this.service.getComodityPrice({ filter: JSON.stringify({ ComodityId: this.data.Comodity.Id, UnitId: this.data.Unit.Id, IsValid: true }) });
            if (priceResult.data.length > 0) {
                this.data.Price = priceResult.data[0].Price;
            }
            else {
                this.data.Price = 0;
            }

            //get data color by RONo
            this.data.colors = [];
            let resultColor = {};
            //set filter to get color by RONo
            let filterColor = { size: 99999, filter: JSON.stringify({ RONo: this.data.RONo }) };
            switch (this.data.ExpenditureFrom) {
                case "FINISHING":
                    resultColor = await this.service.searchFinishingOutColor(filterColor);
                    break;
                case "SEWING":
                    resultColor = await this.service.searchSewingOutColor(filterColor);
                    break; 
                case "LOADING":
                    resultColor = await this.service.searchLoadingOutColor(filterColor);
                    break;
                case "CUTTING":
                    resultColor = await this.service.searchCuttingOutColor(filterColor);
                    break;
            }

            //mapping data color to array
            for (var data of resultColor.data) {
                if (this.data.colors.length == 0) {
                    this.data.colors.push(data.Color);
                }
                else {
                    var dup = this.data.colors.find(a => a == data.Color);
                    if (!dup) {
                        this.data.colors.push(data.Color);
                    }
                }
            }

            //get data finished good stock by RONo and Unit and ExpenditureFrom
            Promise.resolve(this.service.getFinishedGood({ filter: JSON.stringify({ RONo: this.data.RONo, UnitId: this.data.Unit.Id, FinishedFrom: this.data.ExpenditureFrom }) }))
                .then(result => {
                    for (var finGood of result.data) {
                        var item = {};
                        if (finGood.Quantity > 0) {
                            if (this.sizes.length > 0) {
                                var duplicate = this.sizes.find(a => a.Size.Id == finGood.Size.Id && a.Uom.Id == finGood.Uom.Id);
                                    
                                if (duplicate) {
                                    var idx = this.data.Items.indexOf(duplicate);
                                    //duplicate.Quantity+=finGood.Quantity;
                                    duplicate.StockQuantity += finGood.Quantity;
                                    duplicate.RemainingQuantity = duplicate.StockQuantity;
                                    this.sizes[idx] = duplicate;
                                } else {
                                    item.IsSave = true;
                                    item.Size = finGood.Size;
                                    item.SizeName = finGood.Size.Size;
                                    item.StockQuantity = finGood.Quantity;
                                    item.RemainingQuantity = item.StockQuantity;
                                    //item.Quantity=finGood.Quantity;
                                    item.Uom = finGood.Uom;
                                    item.colors = this.data.colors;
                                    //this.data.Items.push(item);
                                    this.sizes.push(item)
                                }
                            }
                            else {
                                item.IsSave = true;
                                item.Size = finGood.Size;
                                item.SizeName = finGood.Size.Size;
                                item.StockQuantity = finGood.Quantity;
                                item.RemainingQuantity = item.StockQuantity;
                                //item.Quantity=finGood.Quantity;
                                item.Uom = finGood.Uom;
                                item.colors = this.data.colors;
                                this.sizes.push(item);
                            }
                                
                        }
                    }
                    console.log(this.size)
                    this.sizes.sort((a, b) => a.SizeName.localeCompare(b.SizeName));
                });
        }
        else {
            this.context.selectedROViewModel.editorValue = "";
            this.data.RONo = null;
            this.data.Article = null;
            this.data.Comodity=null;
            this.data.Items.splice(0);
            this.data.Price=0;
            this.data.Buyer=null;
            this.data.ContractNo=null;
            this.data.Description ="";
        }
    }
    itemsInfo = { 
        columns: [
            "Size",
            "Jumlah Keluar",
            "Satuan",
            "Keterangan",
        ]
    };

    ROView=(ro) => {
        return `${ro.RONo}`;
    }

    get totalQuantity(){
        var qty=0;
        if(this.data.Items){
            for(var item of this.data.Items){
                if(item.IsSave)
                    qty += item.Quantity;
            }
        }
        return qty;
    }

    selectedSizeChanged(e){
        console.log(e);
        // this.selectedSize.RemainingQuantity=this.selectedSize.StockQuantity;
        // if(this.data.Items){
        //     for(var item of this.data.Items){
        //         var dup= this.sizes.find(a=>a.SizeName==item.SizeName);
        //         if(dup){
        //             this.selectedSize.RemainingQuantity-=item.Quantity;
        //         }
        //     }
        // }
    }

    addProduct(){
        if(this.data.Quantity>this.selectedSize.RemainingQuantity ){
            alert("Jumlah Keluar tidak boleh lebih dari " + this.selectedSize.RemainingQuantity);
        }
        else{
            let objData = {};
            var item=Object.assign(objData, this.selectedSize);
            item.Description=this.selectedColor;
            item.Quantity=this.data.Quantity;
            item.RemainingQuantity-=this.selectedSize.Quantity;
            // if(this.data.Items){
            //     var dup= this.data.Items.find(a=>a.SizeName===item.SizeName && a.Description===this.selectedColor);
            //     if(dup){
            //         var idx= this.data.Items.indexOf(dup);
            //         dup.Quantity+=this.data.Quantity;
            //         this.data.Items[idx]=dup;
            //     }
            //     else{
            //         this.data.Items.push(item);
            //     }
            // }
            // else{
            this.data.Items.push(item);
            // }
            this.selectedSize.RemainingQuantity-=this.data.Quantity;
            this.data.Quantity=0;
        }
        
    }

    get removeItems() {
        return (event) => {
            if(this.selectedSize.SizeName==event.detail.SizeName){
                this.selectedSize.RemainingQuantity += event.detail.Quantity;
            }
            else{
                var item= this.sizes.find(a=>a.SizeName==event.detail.SizeName);
                var idx= this.sizes.indexOf(item);
                item.RemainingQuantity += event.detail.Quantity;
                this.sizes[idx]=item;
            }
            this.error = null;
        };
    }

    async selectedInvoiceChanged(newValue){
        if(newValue){
            this.data.Invoice= newValue.invoiceNo;
            this.data.PackingListId=newValue.id;
            this.data.PackingListId=newValue.packingListId;
            this.data.InvoiceId = newValue.id;
        }

        else{
            this.data.Invoice= "";
            this.data.PackingListId=0;
        }
    }

    manualChanged(newValue){
        if(!this.readOnly){
            if(this.context.selectedInvoiceViewModel)
                this.context.selectedInvoiceViewModel.editorValue = "";
            this.selectedInvoice=null;
            this.data.Invoice= "";
            this.data.PackingListId=0;
        }
    }
}