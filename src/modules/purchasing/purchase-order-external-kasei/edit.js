import {inject, Lazy} from 'aurelia-framework';
import {Router} from 'aurelia-router';
import {Service} from './service';
import { Base64Helper } from '../../../utils/base-64-coded-helper';


@inject(Router, Service)
export class Edit {
    hasCancel = true;
    hasSave = true;
    hasView = false;

    constructor(router, service) {
        this.router = router;
        this.service = service;
    }

    bind() {
        this.error = {};
    }

    async activate(params) {
        const decoded = Base64Helper.decode(params.id);
        var id = decoded;
        this.data = await this.service.getById(id);
    }

    cancel(event) {
        const encoded = Base64Helper.encode(this.data._id);
        this.router.navigateToRoute('view', { id: encoded });
    }

    save(event) {
        var test=false;
        for(var item of this.data.items){
            for(var detail of item.details){
                if(isNaN(detail.pricePerDealUnit)){
                    test=true;
                }
            }
        }
        if(test==true){
            alert("Harga Barang Harus Diisi Dengan Angka");
        } else {
            this.service.update(this.data).then(result => {
                this.cancel();
            }).catch(e => {
                this.error = e;
            })
        }
    }
}

