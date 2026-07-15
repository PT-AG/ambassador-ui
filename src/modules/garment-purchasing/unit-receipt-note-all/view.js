import { inject, Lazy } from 'aurelia-framework';
import { Router } from 'aurelia-router';
import { Service } from './service';
import { activationStrategy } from 'aurelia-router';
import { Dialog } from '../../../components/dialog/dialog';
import { AlertView } from './custom-dialog-view/alert-view';
import { Base64Helper } from '../../../utils/base-64-coded-helper';

@inject(Router, Service, Dialog)
export class View {
    hasCancel = true;
    hasEdit = false;
    hasDelete = false;
    constructor(router, service, dialog) {
        this.router = router;
        this.service = service;
        this.dialog = dialog;
    }

    async activate(params) {
        const decoded = Base64Helper.decode(params.id);
        var id = decoded;
        var orderQty=0;
        this.data = await this.service.getById(id);
        if (this.data.Items) {
            this.data.Items.forEach(item => {
                item.showDetails = false;
                orderQty += item.OrderQuantity;
            });
            if (orderQty==0 && !this.data.IsInvoice){
                this.hasDelete=true;
            }
        }

        this.unit = this.data.Unit;
        this.supplier = {Id: this.data.Supplier.Id, code: this.data.Supplier.Code, name: this.data.Supplier.Name};
        this.deliveryOrder = { Id: this.data.DOId, doNo: this.data.DONo };
        this.storage = this.data.Storage;

        this.URNType=this.data.URNType;

        let totalOrderQuantity = this.data.Items.reduce((acc, cur) => acc + cur.OrderQuantity, 0);
        if (!this.data.IsCorrection || totalOrderQuantity === 0) {
            this.hasEdit = true;
        }

        if(this.data.URNType=="PROSES"){
            if(this.data.DRId){
                this.deliveryReturn=await this.service.getDRById(this.data.DRId);
                this.data.DRItems=this.data.Items;
                this.data.ReturnType=this.deliveryReturn.ReturnType;
                this.data.UnitDONo=this.deliveryReturn.UnitDONo;
                var UnitDO= await this.service.getUnitDOById(this.deliveryReturn.UnitDOId);
                var OldUnitDO={};
                if(UnitDO.UnitDOFromId){
                    OldUnitDO=await this.service.getUnitDOById(UnitDO.UnitDOFromId);
                    this.data.UnitFrom=OldUnitDO.UnitSender;
                    this.data.StorageFrom=OldUnitDO.Storage;
                }
            }
            this.hasEdit = false;
        }
        else if(this.data.URNType=="GUDANG LAIN"){
            if(this.data.UENId){
                this.uen=await this.service.getUENById(this.data.UENId);
                this.data.UnitSender= this.uen.UnitSender.Code + " - " + this.uen.UnitSender.Name;
                this.data.StorageSender=this.uen.Storage.name;
            }
            this.hasDelete = false;
        }
        else if(this.data.URNType=="GUDANG SISA"){
            this.expenditure={
                ExpenditureNo:this.data.ExpenditureNo
            };

            this.category=this.data.Category;
        }
        else if(this.data.URNType=="SISA SUBCON"){
            this.uen={
                UENNo:this.data.UENNo
            };
        }
        this.hasDelete = false;
        this.hasEdit = false;
    }

    cancel(event) {
        this.router.navigateToRoute('list');
    }

    edit(event) {
        const encoded = Base64Helper.encode(this.data._id);
        this.router.navigateToRoute('edit', { id: encoded });
    }

    delete() {
        this.dialog.show(AlertView,this.data)
        .then(response => {
            this.data.DeletedReason = response.output.DeletedRemark;

            this.service.delete(this.data).then(result => {
                this.cancel();
            });
        });
    }

    showDetail(item) {
        if (item.showDetails)
            item.showDetails = false;
        else
            item.showDetails = true;
    }
}
