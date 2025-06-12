import { inject, bindable, containerless, computedFrom, BindingEngine } from 'aurelia-framework'
import { Service } from "./service";

var BuyerLoader = require('../../../loader/garment-buyers-loader');
var ShippingStaffLoader = require('../../../loader/garment-shipping-staff-loader');

@inject(Service)
export class DataForm {
    @bindable readOnly = false;
    @bindable isCreate = false;
    @bindable isEdit = false;
    @bindable isView = false;
    @bindable title;
    @bindable data = {};

    constructor(service) {
        this.service = service;
    }

    formOptions = {
        cancelText: "Back"
    }

    activeTab = 0;
    changeRole(tab) {
        this.activeTab = tab;
        // if (tab != 2) {
        //     this.context.saveCallback=null;
        //     this.context.cancelCallback=null;
        //     this.context.deleteCallback=null;
        //     this.context.editCallback=null;
        // }
        // else{
        //     this.context.saveCallback=this.save;
        //     this.context.cancelCallback=this.cancel;
        //     this.context.deleteCallback=this.delete;
        //     this.context.editCallback=this.edit;
        // }
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

    itemsColumns = [
        { header: "Jenis RO" },
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

    PackingTypeOptions = ["EXPORT", "RE EXPORT"];
    InvoiceTypeOptions = ["DL", "SM"];

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
    buyerView = (buyer) => {
        var buyerName = buyer.Name || buyer.name;
        var buyerCode = buyer.Code || buyer.code;
        return `${buyerCode} - ${buyerName}`
    }

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
       
        this.data.documentsFile = this.data.documentsFile || [];
        this.data.documentsFileName = this.data.documentsFileName || [];
        this.documentsPathTemp = [].concat(this.data.documentsPath);
        //this.error.documentsFile = this.error.documentsFile || [];

        this.shippingMarkImageSrc = this.data.shippingMarkImageFile || this.noImage;
        this.sideMarkImageSrc = this.data.sideMarkImageFile || this.noImage;
        this.remarkImageSrc = this.data.remarkImageFile || this.noImage;

        if (this.data.items && this.data.id) {
            for (var item of this.data.items) {
                item.BuyerCode = this.data.buyerAgent.code;
            }
        }
    }

    get addItems() {
        return (event) => {
            this.data.items.push({
                BuyerCode: this.data.buyerAgent.Code || this.data.buyerAgent.code,
                details: []
            });
        };
    }

    get removeItems() {
        return (event) => {
            this.data.grossWeight = this.data.items.reduce((acc, cur) => acc += cur.avG_GW, 0);
            this.data.nettWeight = this.data.items.reduce((acc, cur) => acc += cur.avG_NW, 0);
            this.error = null;
            this.updateMeasurements();
        };
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
  
      if (fileExtension !== 'pdf') {
        alert("Format file harus PDF (.pdf)");
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
  
  // documentInputChanged(index) {
  //   let documentInput = document.getElementById('documentInput' + index);
   
  //   if (documentInput.files.length > 0) {
  //     let file = documentInput.files[0];
  //     let fileName = file.name;
  //     let fileExtension = fileName.split('.').pop().toLowerCase();
      
  //       let reader = new FileReader();
  //       reader.onload = event => {
  //         if (fileExtension !== 'xls' && fileExtension !== 'xlsx') {
  //             documentInput.value = "";
  //             this.data.documentsFile[index] = "";
  //             this.data.documentsFileName[index] = "";
  //             alert("Format file harus Excel (.xls atau .xlsx)");
  //           }
  
  //           let base64Document = event.target.result;
  //           const base64Content = base64Document.substring(base64Document.indexOf(',') + 1);
  //           if (base64Content.length * 6 / 8 > 52428800) {
  //               this.error.documentsFile[index] ="Maximum Document Size is 50 MB";  
  //               documentInput.value = "";
  //               this.data.documentsFile[index] = "";
  //               this.data.documentsFileName[index] = "";
              
  //           } else {
  //               this.data.documentsFile[index] = base64Document;
  //               this.data.documentsFileName[index] = documentInput.value.replace(/^.*[\\\/]/, '');
  //           }
  //       }
  //       reader.readAsDataURL(documentInput.files[0]);
  //   }
  //  }
  // END FITUR EXCEL


    get totalCBM() {
        var total = 0;
        if (this.data.measurements) {
            for (var m of this.data.measurements) {
                if (m.length && m.width && m.height && m.cartonsQuantity) {
                    total += (m.length * m.width * m.height * m.cartonsQuantity / 1000000);
                }
            }
        }
        return total.toLocaleString('en-EN', { minimumFractionDigits: 3, maximumFractionDigits: 3 });
    }

    // get totalCartons() {
    //     let cartons = [];
    //     if (this.data.items) {
    //         for (var item of this.data.items) {
    //             if (item.details) {
    //                 for (var detail of item.details) {
    //                     if (detail.cartonQuantity && cartons.findIndex(c => c.carton1 == detail.carton1 && c.carton2 == detail.carton2) < 0) {
    //                         cartons.push({ carton1: detail.carton1, carton2: detail.carton2, cartonQuantity: detail.cartonQuantity });
    //                     }
    //                 }
    //             }
    //         }
    //     }
    //     this.data.totalCartons = cartons.reduce((acc, cur) => acc + cur.cartonQuantity , 0);
    //     return this.data.totalCartons;
    // }

    get totalCartons() {
        let result = 0;
        if (this.data.items) {
            for (var item of this.data.items) {
                if (item.details) {
                    const newDetails = item.details.map(d => {
                        return {
                            carton1: d.carton1,
                            carton2: d.carton2,
                            cartonQuantity: d.cartonQuantity,
                            index: d.index
                        };
                    }).filter((value, i, self) => self.findIndex(f => value.carton1 == f.carton1 && value.carton2 == f.carton2 && value.index == f.index) === i);

                    for (var detail of newDetails) {
                        const cartonExist = false;
                        const indexItem = this.data.items.indexOf(item);
                        if (indexItem > 0) {
                            for (let i = 0; i < indexItem; i++) {
                                const item = this.data.items[i];
                                for (const prevDetail of item.details) {
                                    if (detail.carton1 == prevDetail.carton1 && detail.carton2 == prevDetail.carton2 && detail.index == prevDetail.index) {
                                        cartonExist = true;
                                        break;
                                    }
                                }
                            }
                        }
                        if (!cartonExist) {
                            result += detail.cartonQuantity;
                        }
                    }
                }
            }
            this.data.totalCartons = result;
            return this.data.totalCartons;
        }
    }

    get totalQuantities() {
        let quantities = [];
        let result = [];
        let units = [];
        if (this.data.items) {
            var no = 1;
            for (var item of this.data.items) {
                let unit = "";
                if (item.uom) {
                    unit = item.uom.unit || item.uom.Unit;
                }
                // if (item.quantity && quantities.findIndex(c => c.roNo == item.roNo && c.unit == unit) < 0) {
                quantities.push({ no: no, roNo: item.roNo, unit: unit, quantityTotal: item.quantity });
                if (units.findIndex(u => u.unit == unit) < 0) {
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

    updateMeasurements() {
        let measurementCartons = [];
        for (const item of this.data.items) {
            for (const detail of (item.details || [])) {
                let measurement = measurementCartons.find(m => m.length == detail.length && m.width == detail.width && m.height == detail.height && m.carton1 == detail.carton1 && m.carton2 == detail.carton2 && m.index == detail.index);
                if (!measurement) {
                    measurementCartons.push({
                        carton1: detail.carton1,
                        carton2: detail.carton2,
                        length: detail.length,
                        width: detail.width,
                        height: detail.height,
                        cartonsQuantity: detail.cartonQuantity,
                        index: detail.index
                    });
                }
            }
        }

        let measurements = [];
        for (const measurementCarton of measurementCartons) {
            let measurement = measurements.find(m => m.length == measurementCarton.length && m.width == measurementCarton.width && m.height == measurementCarton.height && m.index == measurementCarton.index);
            if (measurement) {
                measurement.cartonsQuantity += measurementCarton.cartonsQuantity;
            } else {
                measurements.push(Object.assign({}, measurementCarton));
            }
        }

        this.data.measurements = this.data.measurements || [];
        this.data.measurements.splice(0);

        for (const mt of measurements) {
            let measurement = (this.data.measurementsTemp || []).find(m => m.length == mt.length && m.width == mt.width && m.height == mt.height && m.index == mt.index);
            if (measurement) {
                measurement.cartonsQuantity = mt.cartonsQuantity;
                this.data.measurements.push(measurement);
            } else {
                this.data.measurements.push(mt);
            }
        }

        this.data.measurements.forEach((m, i) => m.MeasurementIndex = i);
    }
}
