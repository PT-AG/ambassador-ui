import { inject, Lazy } from 'aurelia-framework';
import { Router } from 'aurelia-router';
import { Service } from './service';
import { Dialog } from '../../../au-components/dialog/dialog';
import { Base64Helper } from '../../../utils/base-64-coded-helper';

@inject(Router, Service, Dialog)
export class View {
    hasCancel = true;
    hasEdit = true;
    hasDelete = true;
    isVisible = true;
    isGarment = false;


    constructor(router, service, dialog) {
        this.router = router;
        this.service = service;
        this.dialog = dialog;
    }

    async activate(params) {
        const decoded = Base64Helper.decode(params.id);
        let id = decoded;
        this.data = await this.service.getById(id);
        // console.log(this.data);

        if (this.data.ApprovalStatus == "Cancelled" || this.data.ApprovalStatus == "Approved") {
            this.hasDelete = false;
            this.hasEdit = false;
        }

        if (this.data.TypePurchasing) {
            this.isGarment = true;
            switch (this.data.TypePurchasing) {
                case "GARMENT":
                    this.TypePurchasing = "JOB";
                    break;
                case "UMUM":
                    this.TypePurchasing = "UMUM";
                    break;
                default:
                    this.TypePurchasing = null;
            }
        }
    }

    cancel(event) {
        this.router.navigateToRoute('list');
    }

    edit(event) {
        const encoded = Base64Helper.encode(this.data.Id);
        this.router.navigateToRoute('edit', { id: encoded });
    }

    delete(event) {
        // this.service.delete(this.data).then(result => {
        //     this.cancel();
        // });
        //this.dialog.prompt('Apakah anda yakin akan menghapus data ini?', 'Hapus Data Permohonan VB dengan PO')
        this.dialog.prompt('Apakah anda yakin akan menghapus data ini?', 'Hapus Data Uang Muka Pembelian')
            .then(response => {
                if (response.ok) {
                    this.service.delete(this.data)
                        .then(result => {
                            this.cancel();
                        });
                }
            });
    }

}