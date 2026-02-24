import { inject, Lazy } from 'aurelia-framework';
import { Router } from 'aurelia-router';
import { Service } from './service';


@inject(Router, Service)
export class View {
    hasCancel = true;
    hasView = true;
    hasCreate = false;
    hasEdit = false;
    isBC = false;

    constructor(router, service) {
        this.router = router;
        this.service = service;
    }
    isReceived = false;
    
   
    async activate(params) {
        var id = params.id;
        this.isCustomsDisplay = "Ya";
        this.data = await this.service.getById(id);
        this.supplier = this.data.supplier;

         const arg = {
            page: 1,
            size: 100, 
            order: JSON.stringify({}),
            keyword: "",
            filter: JSON.stringify({})
        };

        
        this.dataBC = await this.service.searchBC(arg);
        const allDoNo = this.dataBC.data.flatMap(item =>
            item.items.map(f => f.deliveryOrder.doNo)
        );
     
        if (allDoNo.includes(this.data.doNo)) {
            this.isBC = true;
        }

       // this.dataBC = this.dataBC.data.items.deliveryOrder.doNo;
        // console.log(this.dataBC);
        // if (this.dataBC.data.length > 0) {
        //     this.bcId = this.dataBC.data[0].Id;
        // } else {
        //     this.bcId = 0;
        // }
        // if(this.data.isCustoms==true)
        //     this.isCustomsDisplay="Ya"
        // else
        //     this.isCustomsDisplay="Tidak"
        // if (this.data.customsId==0) {
        //     this.hasDelete = true;
        //     this.hasEdit = true;
        // }
    }

    cancel(event) {
        this.router.navigateToRoute('list');
    }

    // edit(event) {
    //     this.router.navigateToRoute('edit', { id: this.data.Id });
    // }

    // delete(event) {
    //     this.service.delete(this.data).then(result => {
    //         this.cancel();
    //     });
    // }
}
