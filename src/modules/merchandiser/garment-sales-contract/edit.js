import { inject, Lazy } from 'aurelia-framework';
import { Router } from 'aurelia-router';
import { Service } from './service';


@inject(Router, Service)
export class Edit {
    constructor(router, service) {
        this.router = router;
        this.service = service;
    }
isEdit=true;
    async activate(params) {
        var id = params.id;
        this.data = await this.service.getById(id);
        // this.hasItems=false;
        // if(this.data.Items)
        //     if(this.data.Items.length>0){
        //         for(var item of this.data.Items){
        //             item.Uom=this.data.Uom.Unit;
        //             item.PricePerUnit=this.data.Uom.Unit;
        //         }
        //         this.hasItems=true;
        //     }
    }

    view(data) {
        this.router.navigateToRoute('view', { id: this.data.Id });
    }

    save() {
        if(this.data.SalesContractROs){
            for(var item of this.data.SalesContractROs){
                if(item.Items.length===0){
                    item.Price=item.Price?item.Price:0;
                }
            }
        }
        
        this.service.update(this.data).then(result => {
            this.view();
        }).catch(e => {
            if (e.statusCode == 500) {
                alert("Terjadi Kesalahan Pada Sistem!\nHarap periksa kembali data inputan!\nTidak boleh Qty pada Item bernilai 0!");
            } else {
            this.error = e;
            }
        })
    }
}