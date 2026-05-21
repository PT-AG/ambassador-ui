import { inject, Lazy } from 'aurelia-framework';
import { Router } from 'aurelia-router';
import { Service,SalesService } from './service';


@inject(Router, Service, SalesService)
export class Edit {
    hasCancel = true;
    hasSave = true;

    constructor(router, service,salesService) {
        this.router = router;
        this.service = service;
        this.salesService=salesService;
    }

    bind() {
        this.error = {};
    }

    async activate(params) {
        var id = params.id;
        this.data = await this.service.getById(id);

        if (this.data) {
            if (this.data.UnitRequest) {
                this.unitRequest = this.data.UnitRequest;
            }

            if (this.data.UnitSender) {
                this.unitSender = this.data.UnitSender;
            }

            if (this.data.Storage) {
                this.storage = this.data.Storage;
            }

            if (this.data.StorageRequest) {
                this.storageRequest = this.data.StorageRequest;
            }
            if (this.data.Supplier) {
                this.supplier = this.data.Supplier;
            }

            if (this.data.RONo) {
                if(this.data.UnitDOType=="TRANSFER"){
                    var RO="";
                    for(var a of this.data.Items){
                        RO=a.RONo; break;
                    }
                    // this.RONoJob = {
                    //     RONo: this.data.RONo,
                    //     Items: []
                    // };
                    this.RONoJob = this.data.RONo,
                    // this.RONo = {
                    //     RONo: RO,
                    //     Items: []
                    // };
                    this.RONo = RO
                }
                else{
                    // this.RONo = {
                    //     RONo: this.data.RONo,
                    //     Items: []
                    // };
                    this.RONo = this.data.RONo
                }
            }
            var costcal=await this.salesService.searchCCByRONo(this.data.RONo);
            if (this.data.Items) {
                for (let item of this.data.Items) {
                    item.IsSave = true;
                    item.IsDisabled = false;
                    if( item.CCMaterialId>0){
                        var cc= costcal.CostCalculationGarment_Materials.find(a=>a.Id==item.CCMaterialId);
                        if(cc){
                            item.AvailableQuantity=cc.RemainingQuantity;
                        }
                    }
                }
            }

            if(this.data.UnitDOType)
            {
                this.unitDOType = this.data.UnitDOType;
            }
        }
    }

    cancel(event) {
        this.router.navigateToRoute('view', { id: this.data.Id });
    }

    save(event) {
        this.service.update(this.data).then(result => {
            this.cancel();
        }).catch(e => {
            this.error = e;
        })
    }
}

