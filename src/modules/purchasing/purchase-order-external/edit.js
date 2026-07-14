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
        //this.router.navigateToRoute('view', { id: this.data.Id });
    }

    save(event) {
        this.data.unit = {
            _id: "0",
            code: "-",
            name: "-",
            Name: "-"
        };

        if(this.data.items){
            for(var item of this.data.items){
                if(!item.poId || item.poId==0){
                    item.poId= item._id ? item._id : item.Id;
                    delete item._id;
                    delete item.Id;
                    if(item.details)
                        for(var detail of item.details){
                            detail.poItemId= detail._id ? detail._id : detail.Id;
                            delete detail._id;
                            delete detail.Id;
                        }
                }
            }
        }

        this.service.update(this.data).then(result => {
                this.cancel();
            }).catch(e => {
                this.error = e;
            })
    }
}

