import { bindable, computedFrom, BindingSignaler, inject } from 'aurelia-framework';

const UnitLoader = require('../../../../loader/unit-loader');

// @inject(BindingSignaler)
export class Upload {

    constructor() {
    }

    activate(context) {
        this.data = context.data;
        this.error = context.error;
        this.options = context.context.options;
        this.readOnly = context.options.readOnly;
        this.data.IsSelected=true;
    }
    unitView = (unit) => {
        return `${unit.Code} - ${unit.Name}`
    }

    get unitLoader() {
        return UnitLoader;
    }
    
    onFileSelected(event, row) {
        const file = event.target.files[0];
        // Simpan file ke model row
        row.file = file || null;
        // Jika ingin menampilkan nama file:
        // row.fileName = file ? file.name : '';
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
