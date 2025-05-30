import {inject, bindable, computedFrom} from 'aurelia-framework'
var UnitLoader = require('../../../loader/garment-units-loader');
var PreSalesContractLoader = require('../../../loader/garment-pre-sales-contracts-loader');
import { CoreService } from './service';

@inject(CoreService)
export class DataForm {
    @bindable readOnly = false;
    @bindable isEdit = false;
    @bindable data = {};
    @bindable title;
    @bindable selectedPreSalesContract;

    constructor(coreService) {
        this.coreService = coreService;
    }

    controlOptions = {
        label: {
            length: 4
        },
        control: {
            length: 5
        }
    }

    prTypes = [
        "MASTER",
        "SAMPLE",
        "SUBCON KELUAR"
    ];

    formOptions = {
        cancelText: "Kembali",
        saveText: "Simpan",
        deleteText: "Hapus",
        editText: "Ubah"
    };
    //CODE BEFORE
    // @computedFrom("data.PRType")
    // get salesContractFilter (){
    //     let filter = {
    //         IsPosted: true,
    //         SCType: this.data.PRType == "MASTER" ?  "JOB ORDER" : "SAMPLE"
    //     };
    //     if (this.data.PRType == "SAMPLE") {
    //         filter.IsPR = false;
    //     }
    //     return filter;
    // }

    //AFTER CODE
    @computedFrom("data.PRType")
  get salesContractFilter() {
    let filter = {
      IsPosted: true,
      // SCType: this.data.PRType == "MASTER" ? "JOB ORDER" : this.data.PRType,
    };

    if (this.data.PRType == "SAMPLE") {
      filter.IsPR = false;
      filter.SCType = "SAMPLE";
    } else if (this.data.PRType == "MASTER") {
      filter.SCType = "JOB ORDER";
    } else if (this.data.PRType == "SUBCON KELUAR") {
      let filterSubcon = {
        IsPosted: true,
        'SCType == "SUBCON KELUAR" || SCType == "SUBCON"': true,
        //'SCType == "SUBCON KELUAR"': true,
      };

      return filterSubcon;
    }

    return filter;
  }

    bind(context) {
        this.context = context;
        this.data = this.context.data;
        this.error = this.context.error;

        this.itemOptions = {
            isEdit : this.isEdit
        };

        if (this.readOnly || this.isEdit) {
            this.itemsColumns.splice(0, 0, { header: "No. PO" });
        }
    }

    unitView = (unit) => {
        return `${unit.Code} - ${unit.Name}`;
    }

    get unitLoader() {
        return UnitLoader;
    }

    get preSalesContractLoader() {
        return PreSalesContractLoader;
    }

    itemsColumns = [
        { header: "Kategori" },
        { header: "Kode Barang" },
        { header: "Komposisi" },
        { header: "Konstruksi" },
        { header: "Yarn" },
        { header: "Width" },
        { header: "Design/Color/Keterangan" },
        { header: "Jumlah" },
        { header: "Satuan" },
        { header: "Price" },
        { header: "Satuan Harga" },
        { header: "Konversi" },
        { header: "Total" },
    ]

    get buyer() {
        if (this.data.Buyer) {
            return `${this.data.Buyer.Code} - ${this.data.Buyer.Name}`;
        } else {
            return "-";
        }
	}
    
    changePRType(e) {
        this.context.selectedPreSalesContractViewModel.editorValue = "";
        this.selectedPreSalesContract = null;

        if (e.target.value === "MASTER") {
            this.context.unitViewModel.editorValue = "";
            this.data.Unit = null;
        }
    }

    async selectedPreSalesContractChanged(newValue) {
        if (newValue) {
            this.data.SCId = newValue.Id;
            this.data.SCNo = newValue.SCNo;
            this.data.Buyer = {
                Id: newValue.BuyerBrandId,
                Code: newValue.BuyerBrandCode,
                Name: newValue.BuyerBrandName
            };

            const section = await this.coreService.getGarmentSection(newValue.SectionId);
            this.data.SectionName = section.Name;
            this.data.ApprovalPR = section.ApprovalCC; 
            
        } else {
            this.data.SCId = 0;
            this.data.SCNo = null;
            this.data.Buyer = null;
            this.data.SectionName = null;
            this.data.ApprovalPR = null;
        }
    }

    get addItems() {
        return (event) => {
            this.data.Items.push({})
        };
    }

    get removeItems() {
        return (event) => {
            // console.log(event);
        };
    }
}
