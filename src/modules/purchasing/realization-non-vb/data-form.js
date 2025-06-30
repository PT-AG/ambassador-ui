import { inject, bindable, containerless, computedFrom, BindingEngine } from 'aurelia-framework'
import { Service } from "./service";
import { CoreService } from "./core-service";
import moment from 'moment';

const UnitLoader = require('../../../loader/unit-loader');
var CurrencyLoader = require('../../../loader/currency-loader');
const UnitVBNonPO = require('../../../loader/unit-vb-non-po-loader');
const VbLoader = require('../../../loader/vb-request-document-loader');

@containerless()
@inject(Service, BindingEngine, CoreService)
export class DataForm {
    @bindable readOnly = false;
    @bindable data = {};
    @bindable error = {};
    @bindable title;

    // @computedFrom("data.VBNonPOType")
    // get isVB() {
    //     return this.data.VBNonPOType == "Dengan Nomor VB";
    // }
    @computedFrom("data.DispositionType")

    get isClaim() {
        return this.data.DispositionType == "Klaim";
    }
    @computedFrom("data.Id")
    get isEdit() {
        return (this.data.Id || '').toString() != '';
    }

    filter = {
        "ApprovalStatus": 2,
        "IsRealized": false,
        "Type": 2,
        "IsInklaring": false
    };

    controlOptions = {
        label: {
            length: 4
        },
        control: {
            length: 5
        }
    }

    controlOptionsLabel = {
        label: {
            length: 8
        },
        control: {
            length: 3
        }
    }

    controlOptionsDetail = {
        control: {
            length: 10
        }
    }

    unitQuery = { VBDocumentLayoutOrder: 0 }
    get unitVBNonPOLoader() {
        return UnitVBNonPO;
    }

    // /NumberVbOptions = ["", "Dengan Nomor VB", "Tanpa Nomor VB"];
    DispositionTypeItem = ["Klaim", "Non Klaim"];

    itemOptions = {};
    constructor(service, bindingEngine, coreService) {
        this.service = service;
        this.bindingEngine = bindingEngine;
        this.coreService = coreService;
        this.isDelay = false;
    }

    bind(context) {
        this.context = context;
        this.data = this.context.data;
        this.error = this.context.error;

        if (this.data.DispositionType) {
            this.dispositionType = this.data.DispositionType;
        }

        // if (this.data.VBNonPOType) {
        //     this.vbNonPOType = this.data.VBNonPOType;
        // }

        if (this.data.VBDocument) {
            this.vbDocument = this.data.VBDocument;
        }

        if (this.data.Currency) {
            this.currency = this.data.Currency;
        }

        if (this.data.Unit) {
            this.unit = this.data.Unit;
        }
        
        if (this.data.UnitCosts) {
            var uCosts=[];
            for(var item of this.data.UnitCosts){
                if(item.IsSelected){
                    uCosts.push(item);
                }
            }
            this.data.UnitCosts=uCosts;
        //     var otherUnit = this.data.UnitCosts.find(s => s.Unit.VBDocumentLayoutOrder == 10);
        //     if (otherUnit) {
        //         this.cardContentUnit = otherUnit.Unit;
        //     }
        // }

        // if (this.data.UnitCosts) {
        //     let tempCards = [];
        //     this.data.UnitCosts.forEach((item, index) => {
        //         tempCards.push(item);
        //         if (item.Unit.VBDocumentLayoutOrder % 5 == 0) {
        //             this.cards.push(tempCards);
        //             tempCards = [];
        //         }
        //     });

        //     if (tempCards.length > 0) {
        //         this.cards.push(tempCards)
        //     }
        }

        this.data.DocumentsFile = this.data.DocumentsFile || [];
        this.data.DocumentsFileName = this.data.DocumentsFileName || [];
        this.documentsPathTemp = [].concat(this.data.DocumentsPath);

    }


    cards = [];

    @bindable dispositionType;
    async dispositionTypeChanged(n, o) {
        if (this.dispositionType) {
            this.data.DispositionType = this.dispositionType;
        }

    }

    @bindable vbDocument;
    async vbDocumentChanged(n, o) {
        if (this.vbDocument) {
            this.cards = [];
            this.data.VBDocument = this.vbDocument;

            if (!this.isEdit && this.vbNonPOType == "Dengan Nomor VB") {
                this.unit = {
                    Id: this.data.VBDocument.SuppliantUnitId,
                    Code: this.data.VBDocument.SuppliantUnitCode,
                    Name: this.data.VBDocument.SuppliantUnitName,
                    Division: {
                        Id: this.data.VBDocument.SuppliantDivisionId,
                        Code: this.data.VBDocument.SuppliantDivisionCode,
                        Name: this.data.VBDocument.SuppliantDivisionName
                    }
                }
                this.currency = {
                    Id: this.data.VBDocument.CurrencyId,
                    Code: this.data.VBDocument.CurrencyCode,
                    Description: this.data.VBDocument.CurrencyDescription,
                    Symbol: this.data.VBDocument.CurrencySymbol,
                    Rate: this.data.VBDocument.CurrencyRate
                }
            }


            if (!this.isEdit && this.vbNonPOType == "Dengan Nomor VB") {
                var dataVBRequest = await this.service.getVBDocumentById(this.data.VBDocument.Id);
                dataVBRequest.Items.forEach((item, index) => {
                    if(item.IsSelected){
                        this.data.UnitCosts.push(item);
                    }
                });
                //this.data.UnitCosts = dataVBRequest.Items.find(a=>a.IsSelected);
            }

            var realizationDate = moment(this.data.Date).format("YYYY-MM-DD");  
            var estimationDate = moment(this.data.VBDocument.RealizationEstimationDate).format("YYYY-MM-DD");

            var diff = dateDiffInDays( estimationDate, realizationDate);
            

            if (diff > 2 && this.vbNonPOType == "Dengan Nomor VB") {
                this.isDelay = true;
                this.data.IsDelay = true;
            }
            console.log("tanggal realisasi", realizationDate);
            console.log("vbRequestDocument", estimationDate);
            console.log("diff", diff);
            console.log("isReason", this.isDelay);
            console.log("Type",this.vbNonPOType);


            // if (this.data.UnitCosts) {
            //     var otherUnit = this.data.UnitCosts.find(s => s.Unit.VBDocumentLayoutOrder == 10);
            //     if (otherUnit) {
            //         this.cardContentUnit = otherUnit.Unit;
            //     }
            // }

            // let tempCards = [];
            // this.data.UnitCosts.forEach((item, index) => {
            //     tempCards.push(item);
            //     if (item.Unit.VBDocumentLayoutOrder % 5 == 0) {
            //         this.cards.push(tempCards);
            //         tempCards = [];
            //     }
            // });

            // if (tempCards.length > 0) {
            //     this.cards.push(tempCards)
            // }
            this.itemOptions.vbNonPOType=this.vbNonPOType;
        } else {
            this.data.VBDocument = null;
            this.unit = null;
            this.currency = null;
        }

    }

    
    @bindable unit;
    unitChanged(n, o) {
        if (this.unit) {
            this.data.Unit = this.unit;
        } else {
            this.data.Unit = null;
        }
        
    }

    @bindable currency;
    currencyChanged(n, o) {
        if (this.currency) {
            this.data.Currency = this.currency;
            this.itemOptions.CurrencyCode = this.data.Currency.Code;

        } else {
            this.data.Currency = null;
        }
    }

    // otherUnitSelected(event, data) {
    //     this.cardContentUnit = null;
    //     data.Amount = 0;
    //     data.Unit = {};
    //     data.Unit.VBDocumentLayoutOrder = 10;
    // }

    resetAmount(event, data) {
        data.Amount = 0;
    }

    // @bindable cardContentUnit;
    // cardContentUnitChanged(n, o) {
    //     var otherUnit = this.data.UnitCosts.find(s => s.Unit.VBDocumentLayoutOrder == 10);

    //     if (this.cardContentUnit && otherUnit && otherUnit.IsSelected) {
    //         otherUnit.Unit = this.cardContentUnit;
    //         otherUnit.Unit.VBDocumentLayoutOrder = 10;
    //     } else {
    //         if (otherUnit) {
    //             otherUnit.Amount = 0;
    //             otherUnit.Unit = {};
    //             otherUnit.Unit.VBDocumentLayoutOrder = 10;
    //         }

    //     }
    // }
    columns = [
        "Tanggal", "Invoice", "Keterangan", "Jumlah", "Kena PPN", "PPh", "Total"
    ];

    unitcolumns = [
        "Unit", "Amount"
    ];

    uploadcolumns = [
        "Disposisi", "Amount"
    ];

    get addItems() {
        return (event) => {
            this.data.Items.push({
                Amount: 0,
                Total: 0
            })
        };
    }

    get addUnitCosts() {
        return (event) => {
            this.data.UnitCosts.push({ Amount: 0,})
        };
    }

    get addUploads() {
        return (event) => {
            this.data.UploadFile.push({ 
                 // ID unik untuk setiap baris
                Amount: 0,
             

            })

            // this.data.DocumentsFile.push("");
            // this.data.DocumentsFileName.push("");
            // this.documentsPathTemp.push("");
        };
    }

    

    get vbLoader() {
        return VbLoader;
    }

    unitView = (unit) => {
        return `${unit.Code} - ${unit.Name}`
    }

    get unitLoader() {
        return UnitLoader;
    }

    get currencyLoader() {
        return CurrencyLoader;
    }

    onAddDocument() {
        this.data.DocumentsFile.push("");
        this.data.DocumentsFileName.push("");
        this.documentsPathTemp.push("");
    }

    onRemoveDocument(index) {
        this.data.DocumentsFile.splice(index, 1);
        this.data.DocumentsFileName.splice(index, 1);
        this.documentsPathTemp.splice(index, 1);
    }
    // formatNumber(event, index) {
    //     const input = event.target;
    //     const value = input.value.replace(/,/g, ''); // Hapus separator sebelumnya
    //     if (!isNaN(value)) {
    //         input.value = new Intl.NumberFormat('en-US').format(value); // Tambahkan separator
    //         this.doc.amount = parseFloat(value); // Simpan nilai asli tanpa separator
    //     }
    // }

    



    documentInputChanged(index) {
        let documentInput = document.getElementById('documentInput' + index);

        if (documentInput.files[0]) {
            let reader = new FileReader();
            let amountInput = document.getElementById('amount' + index);
            reader.onload = event => {
                let base64Document = event.target.result;
                const base64Content = base64Document.substring(base64Document.indexOf(',') + 1);
                if (base64Content.length * 6 / 8 > 52428800) {
                    documentInput.value = "";
                    this.data.DocumentsFile[index] = "";
                    this.data.DocumentsFileName[index] = "";
                    alert("Maximum Document Size is 50 MB")
                } else {
                     // Hapus separator koma dari nilai input sebelum mengonversi ke angka
                    const rawAmount = amountInput.value.replace(/,/g, '');
                    this.data.DocumentsFile[index] = base64Document;
                    this.data.DocumentsFileName[index] = {
                        documentName : documentInput.value.replace(/^.*[\\\/]/, ''),
                        //amount : amountInput.value ? parseFloat(amountInput.value) : 0,
                        amount: rawAmount ? parseFloat(rawAmount) : 0, 
                        documentFile : base64Document
                    };
                }
            }
            reader.readAsDataURL(documentInput.files[0]);
        }
    }

    downloadDocument(index) {
        // this.service.getFile((this.documentsPathTemp[index] || '').replace('/sales/', ''), this.data.DocumentsFileName[index]);

        const linkSource = this.data.DocumentsFile[index];
        const downloadLink = document.createElement("a");
        const fileName = this.data.DocumentsFileName[index].documentName;
        console.log("fileName", fileName);
        downloadLink.href = linkSource;
        downloadLink.download = fileName;
        downloadLink.click();
    }

    // amountInputChanged(index) {
            
    //     let documentInput = document.getElementById('documentInput' + index);

    //     if (documentInput.files[0]) {
    //         let reader = new FileReader();
    //         let amountInput = document.getElementById('amount' + index);
    //         reader.onload = event => {
    //             let base64Document = event.target.result;
    //             const base64Content = base64Document.substring(base64Document.indexOf(',') + 1);
    //             if (base64Content.length * 6 / 8 > 52428800) {
    //                 documentInput.value = "";
    //                 this.data.DocumentsFile[index] = "";
    //                 this.data.DocumentsFileName[index] = "";
    //                 alert("Maximum Document Size is 50 MB")
    //             } else {
    //                 this.data.DocumentsFile[index] = base64Document;
    //                 this.data.DocumentsFileName[index] = {
    //                     documentName : documentInput.value.replace(/^.*[\\\/]/, ''),
    //                     amount : amountInput.value ? parseFloat(amountInput.value) : 0,
    //                     documentFile : base64Document
    //                 };
    //             }
    //         }
    //         reader.readAsDataURL(documentInput.files[0]);
    //     }
    // }

    amountInputChanged(index) {
        let documentInput = document.getElementById('documentInput' + index);
    
        if (documentInput.files[0]) {
            let reader = new FileReader();
            let amountInput = document.getElementById('amount' + index);
            reader.onload = event => {
                let base64Document = event.target.result;
                const base64Content = base64Document.substring(base64Document.indexOf(',') + 1);
                if (base64Content.length * 6 / 8 > 52428800) {
                    documentInput.value = "";
                    this.data.DocumentsFile[index] = "";
                    this.data.DocumentsFileName[index] = "";
                    alert("Maximum Document Size is 50 MB");
                } else {
                    // Hapus separator koma dari nilai input sebelum mengonversi ke angka
                    const rawAmount = amountInput.value.replace(/,/g, '');
                    this.data.DocumentsFile[index] = base64Document;
                    this.data.DocumentsFileName[index] = {
                        documentName: documentInput.value.replace(/^.*[\\\/]/, ''),
                        amount: rawAmount ? parseFloat(rawAmount) : 0, // Konversi nilai tanpa separator
                        documentFile: base64Document
                    };
                }
            };
            reader.readAsDataURL(documentInput.files[0]);
        }
    }

    formatNumber(event, index) {
        const input = event.target;
        console.log(input);
        const rawValue = input.value.replace(/,/g, ''); // Hapus separator sebelumnya
        if (!isNaN(rawValue)) {
            const formattedValue = new Intl.NumberFormat('en-US').format(rawValue); // Tambahkan separator
            input.value = formattedValue; // Tampilkan nilai dengan separator
            this.data.DocumentsFileName[index].amount = parseFloat(rawValue); // Simpan nilai asli tanpa separator
        }
    }

}


function dateDiffInDays(date1, date2) {
    const dt1 = new Date(date1);
    const dt2 = new Date(date2);

    const diffTime = dt2 - dt1; // Selisih dalam milidetik
    const diffDays = diffTime / (1000 * 60 * 60 * 24); // Konversi ke hari

    return diffDays;
}

