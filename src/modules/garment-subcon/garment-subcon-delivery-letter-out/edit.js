import { inject } from 'aurelia-framework';
import { Router } from 'aurelia-router';
import { Service,PurchasingService } from './service';

@inject(Router, Service, PurchasingService)
export class View {
    constructor(router, service, purchasingService) {
        this.router = router;
        this.service = service;
        this.purchasingService = purchasingService;
    }
    isEdit=true;
    async activate(params) {
        let id = params.id;
        this.data = await this.service.read(id);

        if (this.data) {
            this.selectedDLType=this.data.DLType;
            this.selectedEPO={
                EPONo: this.data.EPONo,
                Id:this.data.EPOId,
            };
           
            this.selectedContractType=this.data.ContractType;
            this.selectedSubconCategory=this.data.SubconCategory;
        }
        this.getContractQty();
    }

    async getContractQty() {
        //var subconContract = await this.service.readSubconContractById(this.data.SubconContractId);

        var info = {
            keyword : this.data.EPONo
        }

        var epo = await this.purchasingService.getGarmentEPODetail(info);
        console.log(epo);
        for(var _item of epo.data[0].Items){
            this.data.ContractQty += _item.DealQuantity;
        }
        
        if(this.data.SubconCategory=='SUBCON SEWING' || this.data.ContractType=='SUBCON JASA' || this.data.ContractType=='SUBCON BAHAN BAKU'){
            this.service.searchComplete({filter: JSON.stringify({ EPONo:this.data.EPONo})})
            .then((contract)=>{
                console.log(contract)
                var usedQty= 0;
                if(contract.data.length>0){
                    for(var subcon of contract.data){
                        if(subcon.Id!=this.data.Id){
                            for(var subconItem of subcon.Items){
                                usedQty+=subconItem.Quantity;
                            }
                        }
                        else{
                            this.data.savedItems=subcon.Items;
                        }
                    }
                }
                this.data.QtyUsed=usedQty;
            });
        }
    }

    bind() {
        this.error = {};
        this.checkedAll = true;
    }

    cancelCallback(event) {
        this.router.navigateToRoute('view', { id: this.data.Id });
    }

    saveCallback(event) {
        if(this.data.SubconCategory=="SUBCON CUTTING SEWING")
            this.data.UsedQty=this.data.ContractQty-this.data.QtyUsed;
        else{
            this.data.UENId=0;
            //this.data.UsedQty=this.data.ContractQty;
            if(this.data.Items.length>0){
                this.data.UsedQty=this.data.ContractQty-this.data.QtyUsed;
                console.log(this.data.ContractQty,this.data.QtyUsed)
                for(var item of this.data.Items){
                    item.Product={
                        Id:0
                    };
                    item.Uom={
                        Id:0
                    }
                    item.UomOut={
                        Id:0
                    }
                }
            }
        }
        console.log(this.data);
        this.service.update(this.data)
            .then(result => {
                this.cancelCallback();
            })
            .catch(e => {
                this.error = e;
                if (typeof (this.error) == "string") {
                    alert(this.error);
                } else {
                    alert("Missing Some Data");
                }
            })
    }
}