import { inject, bindable, containerless, computedFrom, BindingEngine } from 'aurelia-framework'
import { Service } from "./service";

var BuyerLoader = require('../../../loader/garment-buyers-loader');
var ShippingStaffLoader = require('../../../loader/garment-shipping-staff-loader');
var InvoiceNoLoader = require('../../../loader/garment-pl-invoiceno-loader');

@inject(Service)
export class DataForm {
    @bindable readOnly = false;
    @bindable isCreate = false;
    @bindable isEdit = false;
    @bindable isView = false;
    @bindable title;
    @bindable data = {};
    @bindable selectedInvoiceNo;

    constructor(service) {
        this.service = service;
    }
    typeOptions=["EXPORT","LOKAL"];
    formOptions = {
        cancelText: "Back"
    }

    activeTab = 0;
    changeRole(tab) {
        this.activeTab = tab;
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

    newPL=true;

    itemsColumns = [
        { header: "RO No" },
        { header: "SC No" },
        { header: "Buyer Brand" },
        { header: "Seksi" },
        { header: "Komoditi Description" },
        { header: "Qty" },
        { header: "Satuan" },
        { header: "Price RO" },
        { header: "Mata Uang" },
        { header: "Amount" },
        { header: "Unit" },
        { header: "" },
    ]

    measureColumns = [
        { header: "No", value: "MeasurementIndex" },
        { header: "Length" },
        { header: "Width" },
        { header: "Height" },
        { header: "Qty Cartons" },
        { header: "CBM" },
    ]

    countries = ["", "AFGHANISTAN", "ALBANIA", "ALGERIA", "ANDORRA", "ANGOLA", "ANGUILLA", "ANTIGUA AND BARBUDA", "ARGENTINA", "ARMENIA", "ARUBA", "AUSTRALIA", "AUSTRIA", "AZERBAIJAN", "BAHAMAS", "BAHRAIN", "BANGLADESH", "BARBADOS", "BELARUS", "BELGIUM", "BELIZE", "BENIN", "BERMUDA", "BHUTAN", "BOLIVIA", "BOSNIA AND HERZEGOVINA", "BOTSWANA", "BRAZIL", "BRITISH VIRGIN ISLANDS", "BRUNEI", "BULGARIA", "BURKINA FASO", "BURUNDI", "CAMBODIA", "CAMEROON", "CANADA", "CAPE VERDE", "CAYMAN ISLANDS", "CHAD", "CHILE", "CHINA", "COLOMBIA", "CONGO", "COOK ISLANDS", "COSTA RICA", "COTE D IVOIRE", "CROATIA", "CRUISE SHIP", "CUBA", "CYPRUS", "CZECH REPUBLIC", "DENMARK", "DJIBOUTI", "DOMINICA", "DOMINICAN REPUBLIC", "ECUADOR", "EGYPT", "EL SALVADOR", "EQUATORIAL GUINEA", "ESTONIA", "ETHIOPIA", "FALKLAND ISLANDS", "FAROE ISLANDS", "FIJI", "FINLAND", "FRANCE", "FRENCH POLYNESIA", "FRENCH WEST INDIES", "GABON", "GAMBIA", "GEORGIA", "GERMANY", "GHANA", "GIBRALTAR", "GREECE", "GREENLAND", "GRENADA", "GUAM", "GUATEMALA", "GUERNSEY", "GUINEA", "GUINEA BISSAU", "GUYANA", "HAITI", "HONDURAS", "HONG KONG", "HUNGARY", "ICELAND", "INDIA", "INDONESIA", "IRAN", "IRAQ", "IRELAND", "ISLE OF MAN", "ISRAEL", "ITALY", "JAMAICA", "JAPAN", "JERSEY", "JORDAN", "KAZAKHSTAN", "KENYA", "KUWAIT", "KYRGYZ REPUBLIC", "LAOS", "LATVIA", "LEBANON", "LESOTHO", "LIBERIA", "LIBYA", "LIECHTENSTEIN", "LITHUANIA", "LUXEMBOURG", "MACAU", "MACEDONIA", "MADAGASCAR", "MALAWI", "MALAYSIA", "MALDIVES", "MALI", "MALTA", "MAURITANIA", "MAURITIUS", "MEXICO", "MOLDOVA", "MONACO", "MONGOLIA", "MONTENEGRO", "MONTSERRAT", "MOROCCO", "MOZAMBIQUE", "NAMIBIA", "NEPAL", "NETHERLANDS", "NETHERLANDS ANTILLES", "NEW CALEDONIA", "NEW ZEALAND", "NICARAGUA", "NIGER", "NIGERIA", "NORTH KOREA", "NORWAY", "OMAN", "PAKISTAN", "PALESTINE", "PANAMA", "PAPUA NEW GUINEA", "PARAGUAY", "PERU", "PHILIPPINES", "POLAND", "PORTUGAL", "PUERTO RICO", "QATAR", "REUNION", "ROMANIA", "RUSSIA", "RWANDA", "SAINT PIERRE AND MIQUELON", "SAMOA", "SAN MARINO", "SATELLITE", "SAUDI ARABIA", "SENEGAL", "SERBIA", "SEYCHELLES", "SIERRA LEONE", "SINGAPORE", "SLOVAKIA", "SLOVENIA", "SOUTH AFRICA", "SOUTH KOREA", "SPAIN", "SRI LANKA", "ST KITTS AND NEVIS", "ST LUCIA", "ST VINCENT", "ST. LUCIA", "SUDAN", "SURINAME", "SWAZILAND", "SWEDEN", "SWITZERLAND", "SYRIA", "TAIWAN", "TAJIKISTAN", "TANZANIA", "THAILAND", "TIMOR L'ESTE", "TOGO", "TONGA", "TRINIDAD AND TOBAGO", "TUNISIA", "TURKEY", "TURKMENISTAN", "TURKS AND CAICOS", "UGANDA", "UKRAINE", "UNITED ARAB EMIRATES", "UNITED KINGDOM", "UNITED STATES OF AMERICA", "URUGUAY", "UZBEKISTAN", "VENEZUELA", "VIETNAM", "VIRGIN ISLANDS (US)", "YEMEN", "ZAMBIA", "ZIMBABWE"];

    get say() {
        var number = this.data.totalCartons;

        const first = ['', 'one ', 'two ', 'three ', 'four ', 'five ', 'six ', 'seven ', 'eight ', 'nine ', 'ten ', 'eleven ', 'twelve ', 'thirteen ', 'fourteen ', 'fifteen ', 'sixteen ', 'seventeen ', 'eighteen ', 'nineteen '];
        const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
        const mad = ['', 'thousand', 'million', 'billion', 'trillion'];
        let word = '';

        for (let i = 0; i < mad.length; i++) {
            let tempNumber = number % (100 * Math.pow(1000, i));
            if (Math.floor(tempNumber / Math.pow(1000, i)) !== 0) {
                if (Math.floor(tempNumber / Math.pow(1000, i)) < 20) {
                    word = first[Math.floor(tempNumber / Math.pow(1000, i))] + mad[i] + ' ' + word;
                } else {
                    word = tens[Math.floor(tempNumber / (10 * Math.pow(1000, i)))] + '-' + first[Math.floor(tempNumber / Math.pow(1000, i)) % 10] + mad[i] + ' ' + word;
                }
            }

            tempNumber = number % (Math.pow(1000, i + 1));
            if (Math.floor(tempNumber / (100 * Math.pow(1000, i))) !== 0)
                word = first[Math.floor(tempNumber / (100 * Math.pow(1000, i)))] + 'hundred ' + word;
        }
        return word.toUpperCase();
    }

    get buyerLoader() {
        return BuyerLoader;
    }

    get invoiceLoader() {
        return InvoiceNoLoader;
    }

    buyerView = (buyer) => {
        var buyerName = buyer.Name || buyer.name;
        var buyerCode = buyer.Code || buyer.code;
        return `${buyerCode} - ${buyerName}`
    }

    // get buyerQuery(){
    // var result = { "Active" : true }
    // return result;   
    // }

    get shippingStaffLoader() {
        return ShippingStaffLoader;
    }
    shippingStaffView = (data) => {
        return `${data.Name || data.name}`
    }

    bind(context) {
        this.context = context;
        this.data = context.data;
        this.error = context.error;

        this.Options = {
            isCreate: this.context.isCreate,
            isView: this.context.isView,
            isEdit: this.context.isEdit,
            checkedAll: this.context.isCreate == true ? false : true,
            header: this.data
        }
        this.data.Isfile = true,
        this.data.documentsFile = this.data.documentsFile || [];
        this.data.documentsFileName = this.data.documentsFileName || [];
        this.documentsPathTemp = [].concat(this.data.documentsPath);

        this.data.invoiceType = this.data.invoiceType || "AG";
        this.data.packingListType = this.data.packingListType || "EXPORT";
        this.data.sayUnit = this.data.sayUnit || "CARTONS";

        this.shippingMarkImageSrc = this.data.shippingMarkImageFile || this.noImage;
        this.sideMarkImageSrc = this.data.sideMarkImageFile || this.noImage;
        this.remarkImageSrc = this.data.remarkImageFile || this.noImage;

        if(this.data.invoiceNo){
            this.data.invoiceNo= this.data.increment ? this.data.invoiceNo + " - " + this.data.increment : this.data.invoiceNo
            this.selectedInvoiceNo={
                invoiceNo:this.data.invoiceNo
            }
        }
    }

    get addItems() {
        return (event) => {
            this.data.items.push({});
        };
    }
    

    noImage = "images/no-image.jpg";

    @bindable shippingMarkImageSrc;
    @bindable shippingMarkImageUpload;
    shippingMarkImageUploadChanged(newValue) {
        this.uploadImage('shippingMark', newValue);
    }

    @bindable sideMarkImageSrc;
    @bindable sideMarkImageUpload;
    sideMarkImageUploadChanged(newValue) {
        this.uploadImage('sideMark', newValue);
    }

    @bindable remarkImageSrc;
    @bindable remarkImageUpload;
    remarkImageUploadChanged(newValue) {
        this.uploadImage('remark', newValue);
    }

    uploadImage(mark, newValue) {
        if (newValue) {
            let imageInput = document.getElementById(mark + 'ImageInput');
            let reader = new FileReader();
            reader.onload = event => {
                let base64Image = event.target.result;
                this[mark + 'ImageSrc'] = this.data[mark + 'ImageFile'] = base64Image;
            }
            reader.readAsDataURL(imageInput.files[0]);
        } else {
            this[mark + 'ImageSrc'] = this.noImage;
            this.data[mark + 'ImageFile'] = null;
        }
    }

    removeImage(mark) {
        this[mark + "ImageUpload"] = null;
        this[mark + "ImageSrc"] = this.noImage;
        this.data[mark + "ImageFile"] = null;
    }

    //FITUR EXCEL
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
triggerFileInput(index) {
  const input = document.getElementById('documentInput' + index);
  if (input) {
    input.click();
  }
}

documentInputChanged(index, event) {
  const files = event.target.files;

  if (!files || files.length === 0) return;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const fileName = file.name;
    const fileExtension = fileName.split('.').pop().toLowerCase();

    if (fileExtension !== 'pdf' && fileExtension !== 'xls' && fileExtension !== 'xlsx') {
      alert("Format file harus PDF atau Excel (.pdf/.xls/.xlsx)");
      continue;
    }

    const reader = new FileReader();

    reader.onload = (event) => {
      const base64Document = event.target.result;
      const base64Content = base64Document.substring(base64Document.indexOf(',') + 1);
      const fileSizeInBytes = base64Content.length * 6 / 8;

      if (fileSizeInBytes > 52428800) { // 50MB
        this.error.documentsFile = this.error.documentsFile || [];
        this.error.documentsFile.push("Maximum Document Size is 50 MB");
        return;
      }else{
        this.data.documentsFile.push(base64Document);
        this.data.documentsFileName.push(fileName);
      }
      
      this.data.documentsFile = this.data.documentsFile || [];
      this.data.documentsFileName = this.data.documentsFileName || [];
      
    };

    reader.readAsDataURL(file);
  }
  this.data.documentsFile.splice(index, 1);
  this.data.documentsFileName.splice(index, 1);
  this.documentsPathTemp.splice(index, 1);
  event.target.value = '';
}

    get totalQuantities() {
        let quantities = [];
        let result = [];
        let units = [];
        if (this.data.items) {
            var no = 1;
            for (var item of this.data.items) {
                let unit = "";
                if(item.uom) {
                    unit = item.uom.unit || item.uom.Unit;
                }
                // if (item.quantity && quantities.findIndex(c => c.roNo == item.roNo && c.unit == unit) < 0) {
                    quantities.push({ no: no, roNo: item.roNo, unit: unit, quantityTotal: item.quantity });
                    if(units.findIndex(u => u.unit == unit) < 0) {
                        units.push({ unit: unit });
                    // }
                }
                no++;
                
            }
        }
        for (var u of units) {
            let countableQuantities = 0;
            for (var q of quantities) {
                if (q.unit == u.unit) {
                    countableQuantities += q.quantityTotal;
                }
            }
            result.push(countableQuantities + " " + u.unit);
        }
        return result.join(" / ");
    }

    selectedInvoiceNoChanged(newValue){
        if(newValue){
            if(this.data.invoiceNo != newValue.invoiceNo){
                this.data.invoiceNo= newValue.invoiceNo;
            }
        }
    }

    changeCheckBox() {
        this.selectedInvoiceNo=null;
        this.data.invoiceNo=null;
    }
}
