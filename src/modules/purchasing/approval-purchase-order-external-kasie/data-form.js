import { bindable } from "aurelia-framework";

export class DataForm {
    @bindable data;
    @bindable error;
    @bindable readOnly;

    @bindable approveCallback;
    @bindable backCallback;

    constructor() {}

    bind() {
        // Columns hanya label, karena detail rendering menggunakan template
        this.itemsColumns = [
            { header: "Barang" },
            { header: "Default Jumlah" },
            { header: "Default Satuan" },
            { header: "Deal Jumlah" },
            { header: "Deal Satuan" },
            { header: "Konversi" },
            { header: "Harga" },
            { header: "Include PPN?" },
            { header: "Keterangan" }
        ];
    }

    approve() {
        if (this.approveCallback) this.approveCallback();
    }

    back() {
        if (this.backCallback) this.backCallback();
    }
}
