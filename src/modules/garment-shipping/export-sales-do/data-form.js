import { inject, bindable, containerless, computedFrom, BindingEngine } from 'aurelia-framework'
import { Service } from "./service";

const PackingListLoader = require('../../../loader/garment-packing-list-loader');
const UnitLoader=require('../../../loader/unit-loader')

@inject(Service)
export class DataForm {

    constructor(service) {
        this.service = service;
    }

    @bindable readOnly = false;
    @bindable title;
    @bindable selectedInvoiceNo;
    @bindable selectedUnit;

    controlOptions = {
        label: {
            length: 3
        },
        control: {
            length: 5
        }
    }

    // filter={
    //     IsUsed:true
    // };

    get filter() {
        return {
            'status=="CREATED" || status=="DRAFT_APPROVED_SHIPPING" || status=="POSTED" || status=="APPROVED_MD" || status=="APPROVED_SHIPPING" || status=="REVISED_MD" || status=="REVISED_SHIPPING" || status=="REJECTED_MD" || status=="REJECTED_SHIPPING_UNIT"': true,
            BuyerAgentCode: this.selectedBuyerAgent ? this.selectedBuyerAgent.Code || this.selectedBuyerAgent.code : ""
        };
    }

    ShipmentModeOptions = ["By Air", "By Sea", "By Land"];
    //unitOptions = ["AG1 - AMBASSADOR GARMINDO 1", "AG2 - AMBASSADOR GARMINDO 2"];
    unitOptions = ["AG - AMBASSADOR GARMINDO"];

    footerOptions = {
        label: {
            length: 3
        },
        control: {
            length: 2
        }
    };

    itemsColumns = [
        { header: "Komoditi"},
        { header: "Description" },
        { header: "Quantity " },
        { header: "Satuan"},
        { header: "Jumlah Carton"},
        { header: "Gross Weight"},
        { header: "Nett Weight"},
        { header: "Volume"},
    ];

    get packingListLoader() {
        return PackingListLoader;
    }
    get unitLoader(){
        return UnitLoader;
    }

    get unitQuery() {
        var result = {}
        result[`Code == "AG1" || Code == "AG2" || Code == "AG"`] = true;
        return result;
    }

    // ShipmentModeOptions=["By Air", "By Sea"];
    
    unitView = (unit) => {
        return `${unit.Code || unit.code} - ${unit.Name || unit.name}`;
    }

    bind(context) {
        this.context = context;
        this.data = context.data;
        this.error = context.error;
        this.isEdit=this.context.isEdit;
        this.Options = {
            isCreate: this.context.isCreate,
            isView: this.context.isView,
            isEdit: this.context.isEdit,
        }
        if(this.data.id){
            this.selectedInvoiceNo={
                invoiceNo:this.data.invoiceNo
            };
        }
    }

    get addItems() {
        return (event) => {
            this.data.items.push({})
        };
    }

    get removeItems() {
        return (event) => {
            this.error = null;
            //this.Options.error = null;
     };
    }

    async selectedInvoiceNoChanged(newValue){
        if(this.data.id) return;

        this.data.invoiceNo=null;
        this.data.packingListId=0;
        this.data.buyerAgent=null;
        if(newValue){
            this.data.invoiceNo=newValue.invoiceNo;
            this.data.packingListId=newValue.id;
            this.data.buyerAgent=newValue.buyerAgent;
            var coverLetter=await this.service.getCoverLetterByInvoice({ filter: JSON.stringify({ InvoiceNo: this.data.invoiceNo})});
            if(coverLetter.data.length>0){
                this.data.deliverTo= coverLetter.data[0].destination;
            }
        }
    }
}
