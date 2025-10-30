import { bindable, inject, computedFrom } from "aurelia-framework";
import { Service } from "./service";

const BuyerLoader = require('../../../../loader/garment-buyers-loader');
const ROCCLoader = require('../../../../loader/cost-calculation-garment-loader');
const ComodityLoader = require("../../../../loader/garment-comodities-loader");
const SectionLoader = require('../../../../loader/garment-sections-loader');

@inject(Service)
export class DataForm {
    @bindable readOnly = false;
    @bindable isCreate = false;
    @bindable isEdit = false;
    @bindable isView = false;
    @bindable title;
    @bindable data = {};
    @bindable SelectedROCC;

    SampleCategoryOptions = ["Commercial Sample", "Non Commercial Sample"];
    SampleToOptions=["MARKETING","JOB ORDER"];

    constructor(service) {
        this.service = service;
        this.imagesSrc = [];
        this.maxSizeMB = 20;
        this.totalSizeMB = 0;
        this.progressPercent = 0;
        this.progressColor = "#000000ff";
    }
    get freeSpaceMB() {
    return Math.max(0, this.maxSizeMB - this.totalSizeMB);
    }
    getBase64SizeMB(base64String) {
        if (!base64String) return 0;

        // Hilangkan header "data:image/png;base64,"
        const base64Clean = base64String.split(',')[1] || base64String;
        const sizeInBytes = (base64Clean.length * (3 / 4)) -
            (base64Clean.endsWith('==') ? 2 : base64Clean.endsWith('=') ? 1 : 0);

        return sizeInBytes / (1024 * 1024);
    }
    formOptions = {
        cancelText: "Kembali",
        saveText: "Simpan",
        deleteText: "Hapus",
        editText: "Ubah"
    };

    productColumns = [
        "Style",
        "Color",
        "Fabric",
        "Size",
        "Keterangan Size",
        "Quantity"
    ];

    specColumns = [
        "Inventory",
        "Detail Spesifikasi",
        "Quantity",
        "Satuan",
        "Keterangan"
    ];

    controlOptions = {
        label: {
            length: 3
        },
        control: {
            length: 7
        }
    };

    controlOptions2 = {
        label: {
            length: 3
        },
        control: {
            length: 5
        }
    };

    bind(context) {
        this.context = context;
        this.data = this.context.data;
        this.error = this.context.error;
        this.itemOptions = {
            isCreate: this.context.isCreate,
            isView: this.context.isView,
            checkedAll: this.context.isCreate == true ? false : true,
            isEdit: this.isEdit,
        };
        if (this.data.RONoCC) {
            this.SelectedROCC = {
                RO_Number: this.data.RONoCC
            };

        }
        this.data.ImagesFile = this.data.ImagesFile ? this.data.ImagesFile : [];
        this.data.ImagesName = this.data.ImagesName ? this.data.ImagesName : [];
        this.imagesSrc = this.data.ImagesFile.slice();
        this.data.DocumentsFile = this.data.DocumentsFile || [];
        this.data.DocumentsFileName = this.data.DocumentsFileName || [];
        this.documentsPathTemp = [].concat(this.data.DocumentsPath);

        for (let base64 of this.data.ImagesFile) {
        let sizeMB = this.getBase64SizeMB(base64);
        this.totalSizeMB += sizeMB;
    }

    this.updateProgressBar();
    }

    roView = (costCal) => {
        return `${costCal.RO_Number}`
    }
    get roNoCCLoader() {
        return ROCCLoader;
    }

    get buyerLoader() {
        return BuyerLoader;
    }
    buyerView = (buyer) => {
        var buyerName = buyer.Name || buyer.name;
        var buyerCode = buyer.Code || buyer.code;
        return `${buyerCode} - ${buyerName}`
    }

    comodityView = (comodity) => {
        var code = comodity.code || comodity.Code;
        var name = comodity.name || comodity.Name;
        return `${code} - ${name}`;
    }

    get comodityLoader() {
        return ComodityLoader;
    }

    SelectedROCCChanged(newValue) {
        if (newValue) {
            if (newValue.RO_Number != this.data.RONoCC) {
                this.data.RONoCC = newValue.RO_Number;
            }
        }
    }
    get sectionLoader() {
        return SectionLoader;
    }
    get addItems() {
        return (event) => {
            this.data.SampleProducts.push({});
            this.data.SampleProducts.forEach((m, i) => m.Index = i);
        };
    }

    get removeItems() {
        return (event) => {
            this.error = null;
        };
    }

    get addSpecs() {
        return (event) => {
            this.data.SampleSpecifications.push({
                Uom: { Id: 0, Unit: "" }
            });
            this.data.SampleSpecifications.forEach((m, i) => m.Index = i);
        };
    }

    get removeSpecs() {
        return (event) => {
            this.error = null;
        };
    }


    @bindable imageUpload;
    imageUploadChanged(newValue) {
    if (newValue) {
      let imageInput = document.getElementById('imageInput');
      let files = Array.from(imageInput.files);

      for (let file of files) {
        let fileSizeMB = file.size / (1024 * 1024);

        if (this.totalSizeMB + fileSizeMB > this.maxSizeMB) {
          alert(`Total file melebihi batas ${this.maxSizeMB} MB!`);
          continue; // skip file ini
        }

        let reader = new FileReader();
        reader.onload = (event) => {
          let base64Image = event.target.result;
          this.imagesSrc.push(base64Image);
          this.imagesSrcChanged(this.imagesSrc);
          // Tambahkan ukuran file ke total
          this.totalSizeMB += fileSizeMB;
          this.updateProgressBar();
        };
        reader.readAsDataURL(file);
      }
      this.imageUpload = null;
    }
  }

    @bindable imagesSrc = [];
    imagesSrcChanged(newValue) {
        this.data.ImagesFile = [];
        newValue.forEach(imageSrc => {
            this.data.ImagesFile.push(imageSrc);
        })
    }

    removeImage(index) {
        this.imagesSrc.splice(index, 1);
        this.data.ImagesName.splice(index, 1);
        this.imagesSrcChanged(this.imagesSrc);
        this.recalculateTotalSize();
        this.updateProgressBar();
    }

    recalculateTotalSize() {
        this.totalSizeMB = 0;
        for (let img of this.imagesSrc) {
        // Perkiraan ukuran base64 (bytes)
        let sizeBytes = (img.length * 3) / 4;
        this.totalSizeMB += sizeBytes / (1024 * 1024);
        }
    }

    updateProgressBar() {
        this.progressPercent = Math.min((this.totalSizeMB / this.maxSizeMB) * 100, 100);
        if (this.progressPercent > 90) {
        this.progressColor = "#f44336"; // merah
        } else if (this.progressPercent > 70) {
        this.progressColor = "#ff9800"; // oranye
        } else {
        this.progressColor = "#4caf50"; // hijau
        }
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

    downloadDocument(index) {
        // this.service.getFile((this.documentsPathTemp[index] || '').replace('/sales/', ''), this.data.DocumentsFileName[index]);

        const linkSource = this.data.DocumentsFile[index];
        const downloadLink = document.createElement("a");
        const fileName = this.data.DocumentsFileName[index];

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
                    this.data.DocumentsFile[index] = "";
                    this.data.DocumentsFileName[index] = "";
                    alert("Maximum Document Size is 50 MB")
                } else {
                    this.data.DocumentsFile[index] = base64Document;
                    this.data.DocumentsFileName[index] = documentInput.value.replace(/^.*[\\\/]/, '');
                }
            }
            reader.readAsDataURL(documentInput.files[0]);
        }
    }
}