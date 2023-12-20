import { inject, Lazy } from "aurelia-framework";
import { Router } from "aurelia-router";
import { Service, CoreService } from '../service';

@inject(Router, Service,CoreService)
export class Copy {
    constructor(router, service,coreService) {
        this.router = router;
        this.service = service;
        this.coreService=coreService;
        this.data = {};
        this.error = {};
    }

    identityProperties = [
        "Id",
        "Active",
        "CreatedUtc",
        "CreatedBy",
        "CreatedAgent",
        "LastModifiedUtc",
        "LastModifiedBy",
        "LastModifiedAgent",
        "IsDeleted",
    ];

    async activate(params) {
        this.id = params.id;
        this.data = await this.service.getById(this.id);
        this.copiedFrom = { SCNo: this.data.SalesContractNo };

        this.data.buyer = this.data.BuyerBrandCode + " - " +this.data.BuyerBrandName;
        var buyerBrand = await this.coreService.getBuyerBrandById(this.data.BuyerBrandId);
        var buyer = await this.coreService.getBuyerById(buyerBrand.Buyers.Id);
        this.type = buyer.Type;
        this.data.SCType = this.type;
        this.clearDataProperties();
        this.selectedBuyer = buyerBrand;
        if (this.data.AccountBankId || this.data.AccountBank.Id) {
            const accId = this.data.AccountBankId ? this.data.AccountBankId : this.data.AccountBank.Id;
            this.selectedAccountBank = await this.service.getAccountBankById(accId);
        }
    }

    clearDataProperties() {
        this.identityProperties.concat([
            "SalesContractNo",
            "SalesContractROs"
        ]).forEach(prop => delete this.data[prop]);
        this.readOnly=false;
        if(this.type=="Ekspor"){
            this.data.SalesContractROs=[];
            this.data.SalesContractROs.push({
                buyer: this.data.BuyerBrandId,
                type: this.data.SCType,
                Amount:0
            })
        }
    }

    list() {
        this.router.navigateToRoute("list");
    }

    copy() {
        this.service
            .create(this.data)
            .then(result => {
                alert("Data berhasil dibuat");
                this.list();
            })
            .catch(e => {
                if (e.statusCode == 500) {
                    alert("Terjadi Kesalahan Pada Sistem!\nHarap Simpan Kembali!");
                } else {
                    this.error = e;
                }
            });
    }
}
