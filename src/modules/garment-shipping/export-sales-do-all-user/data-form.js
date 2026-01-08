import { inject, bindable, containerless, computedFrom, BindingEngine } from 'aurelia-framework'
import { Service } from "./service";

const PackingListLoader = require('../../../loader/garment-packing-list-loader');
const UnitLoader=require('../../../loader/unit-loader');
var BuyerLoader = require('../../../loader/garment-buyers-loader');

@inject(Service)
export class DataForm {

    constructor(service) {
        this.service = service;
    }

    @bindable readOnly = false;
    @bindable title;
    @bindable selectedInvoiceNo;
    @bindable selectedUnit;
    @bindable selectedBuyerAgent;

    controlOptions = {
        label: {
            length: 3
        },
        control: {
            length: 5
        }
    };
    filter={
        IsUsed:true
    };
    footerOptions = {
        label: {
            length: 3
        },
        control: {
            length: 2
        }
    };
    get unitLoader(){
        return UnitLoader;
    }
    unitView = (unit) => {
        return `${unit.Code || unit.code} - ${unit.Name || unit.name}`;
    }
    get buyerLoader() {
        return BuyerLoader;
    }
    buyerView = (buyer) => {
        var buyerName = buyer.Name || buyer.name;
        var buyerCode = buyer.Code || buyer.code;
        return `${buyerCode} - ${buyerName}`
    }
    itemsColumns = [
        { header: "No RO"},
        { header: "Komoditi"},
        { header: "Description" },
        { header: "Quantity " },
        { header: "Satuan"},
        // { header: "Jumlah Carton"},
        // { header: "Gross Weight"},
        // { header: "Nett Weight"},
        // { header: "Volume"},
    ];

    get packingListLoader() {
        return PackingListLoader;
    }
    get unitLoader(){
        return UnitLoader;
    }

    unitOptions = ["AG1 - AMBASSADOR GARMINDO 1", "AG2 - AMBASSADOR GARMINDO 2"];
    get unitQuery(){
        var result = { }
        result[`Code == "AG1" || Code == "AG2"`]=true;
        //result[`Code == "AG2"`]=true;
        return result;   
    }

    ShipmentModeOptions=["By Air", "By Sea", "By Land"];
    
    unitView = (unit) => {
        return `${unit.Code} - ${unit.Division.Name || unit.name}`;
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
        this.data.packingListId=0;
        this.data.documentsFile = this.data.documentsFile || [];
        this.data.documentsFileName = this.data.documentsFileName || [];
        this.documentsPathTemp = [].concat(this.data.documentsPath);
        if(this.data.id){
            // this.selectedInvoiceNo={
            //     invoiceNo:this.data.invoiceNo
            // };
            this.selectedBuyerAgent=this.data.buyerAgent;
        }
        
    }

    get addItems() {
        return (event) => {
            this.data.items.push({
                BuyerCodeFilter: this.data.buyerAgent.Code || this.data.buyerAgent.code,
            });
        };
    }

    unitView = (unit) => {
        return `${unit.Code || unit.code} - ${unit.Name || unit.name}`;
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

    selectedBuyerAgentChanged(newValue) {
        if (newValue != this.data.buyerAgent && this.data.items){
            if(this.data.items && this.data.items.length>0){
                this.data.items.splice(0);
            }
        }
        this.data.buyerAgent = null;
        if (newValue) {
            this.data.buyerAgent = newValue;
        }
    }

    onAddDocument() {
    this.data.documentsFile.push("");
    this.data.documentsFileName.push("");
    this.documentsPathTemp.push("");
  }

  onRemoveDocument(index) {
    this.data.documentsFile.splice(index, 1);
    this.data.documentsFileName.splice(index, 1);
    this.documentsPathTemp.splice(index, 1);
  }

  downloadDocument(index) {
    // this.service.getFile((this.documentsPathTemp[index] || '').replace('/sales/', ''), this.data.DocumentsFileName[index]);

    const linkSource = this.data.documentsFile[index];
    const downloadLink = document.createElement("a");
    const fileName = this.data.documentsFileName[index];

    downloadLink.href = linkSource;
    downloadLink.download = fileName;
    downloadLink.click();
  }

  documentInputChanged(index) {
    let documentInput = document.getElementById('documentInput' + index);

    if (documentInput.files[0]) {
      let reader = new FileReader();
      reader.onload = event => {
        let base64Document = event.target.result;
        const base64Content = base64Document.substring(base64Document.indexOf(',') + 1);
        if (base64Content.length * 6 / 8 > 52428800) {
          documentInput.value = "";
          this.data.documentsFile[index] = "";
          this.data.documentsFileName[index] = "";
          alert("Maximum Document Size is 50 MB")
        } else {
          this.data.documentsFile[index] = base64Document;
          this.data.documentsFileName[index] = documentInput.value.replace(/^.*[\\\/]/, '');
        }
      }
      reader.readAsDataURL(documentInput.files[0]);
    }
  }
}
