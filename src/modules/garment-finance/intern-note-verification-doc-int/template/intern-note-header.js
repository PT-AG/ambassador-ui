import { inject, containerless } from 'aurelia-framework'
import { Service } from '../service';

@containerless()
@inject(Service)
export class InternNoteHeader {

    itemsInfo = {
        columns: [
            { header: "Tgl. Surat Jalan" },
            { header: "Nomor Surat Jalan" },
            { header: "Nomor PO Eksternal" },
            { header: "Nomor Ref PR" },
            { header: "Nomor RO" },
            { header: "Term Pembayaran" },
            { header: "Tipe Pembayaran" },
            { header: "Tanggal Jatuh Tempo" },
            { header: "Barang" },
            { header: "Jumlah" },
            { header: "Satuan" },
            { header: "Harga Satuan" },
            { header: "Harga Total" },
            { header: "Diterima Unit" }
        ]
    };

    constructor(service) {
        this.service = service;
    }

    async activate(context) {
        this.context = context;
        this.isShowing = false;
        this.data = await this.service.getById(context.data.Id);
        this.error = context.error;
        this.invoice = this.data.items[0].garmentInvoice
        this.details = this.data.items.map(item => item.details.map(detail => detail)).flat();
    }

    controlOptions = {
        control: {
            length: 12
        }
    };

    toggle() {
        if (!this.isShowing)
            this.isShowing = true;
        else
            this.isShowing = !this.isShowing;
    }
}