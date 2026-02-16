import { inject, bindable, computedFrom } from 'aurelia-framework';
import { Service, SalesService, CoreService } from "../service";

const CuttingInLoader = require('../../../../loader/garment-cutting-in-by-ro-loader');

@inject(Service, SalesService, CoreService)
export class Item {
    @bindable selectedCuttingIn;

    ROList = [];

    constructor(service, salesService, coreService) {
        this.service = service;
        this.salesService = salesService;
        this.coreService = coreService;
    }

    get cuttingInFilter() {
        //this.selectedCuttingIn = null;
        if (this.data.Unit && this.data.Buyer) {
            return {
                UnitId: this.data.Unit.Id,
                CuttingFrom: "PREPARING",
                CuttingType: "MAIN FABRIC",
                BuyerCode: this.data.Buyer.Code
            };
        } else {
            return {
                UnitId: 0,
                CuttingFrom: "PREPARING",
                CuttingType: "MAIN FABRIC",
                BuyerCode: ""
            };
        }
    }

    activate(context) {
        this.context = context;
        this.data = context.data;
        this.error = context.error;

        this.isCreate = context.context.options.isCreate;
        this.isEdit = context.context.options.isEdit;
        this.itemOptions = context.context.options;
        this.ROList = this.itemOptions.ROList;

        if (this.data) {
            this.selectedCuttingIn = {
                RONo: this.data.RONo,
                Article: this.data.Article
            }
        }

        this.isShowing = true;
        if (this.data.Details) {
            if (this.data.Details.length > 0) {
                this.isShowing = true;
            }
        }
    }

    itemsColumnsCreate = [
        "Keterangan",
        "Jumlah",
        "Jumlah Keluar",
        ""
    ];

    itemsColumns = [
        "Keterangan",
        "Jumlah Keluar",
        ""
    ];

    toggle() {
        if (!this.isShowing)
            this.isShowing = true;
        else
            this.isShowing = !this.isShowing;
    }

    comodityView = (comodity) => {
        return `${comodity.Code} - ${comodity.Name}`
    }

    get cuttingInLoader() {
        return async (keyword) => {
            console.log(this.data);
            
            var info = {
                keyword: keyword,
                filter: this.data.Unit && this.data.Buyer && this.data.BuyerBrand ?
                    JSON.stringify({
                        UnitId: this.data.Unit.Id,
                        CuttingFrom: "PREPARING",
                        CuttingType: "MAIN FABRIC",
                        BuyerCode: this.data.BuyerBrand.Code
                    }) : JSON.stringify({
                        UnitId: 0,
                        CuttingFrom: "PREPARING",
                        CuttingType: "MAIN FABRIC",
                        BuyerCode: ""
                    }),
                size: 10
            };

            return this.service.getCuttingInByROLoader(info).then((result) => {
                return result.data.filter(x => !this.ROList.includes(x.RONo));
            });
        }
    }

    async selectedCuttingInChanged(newValue, oldValue) {
        if (this.isCreate) {
            if (newValue) {
                if (this.data.Details.length > 0) {
                    this.data.Details.splice(0);
                }

                this.ROList.push(newValue.RONo);
                this.data.RONo = newValue.RONo;
                this.data.Article = newValue.Article;
                let noResult = await this.salesService.getCostCalculationByRONo({ size: 1, filter: JSON.stringify({ RO_Number: this.data.RONo }) });
                if (noResult.data.length > 0) {
                    this.data.Comodity = noResult.data[0].Comodity;
                } else {
                    const comodityCodeResult = await this.salesService.getHOrderKodeByNo({ no: this.data.RONo });
                    const comodityCode = comodityCodeResult.data[0];
                    if (comodityCode) {
                        const comodityResult = await this.coreService.getGComodity({ size: 1, filter: JSON.stringify({ Code: comodityCode }) });
                        this.data.Comodity = comodityResult.data[0];
                    }
                }
                let ssCuttingItems = [];
                let ssCutting = await this.service.searchItem({ size: 100, filter: JSON.stringify({ RONo: this.data.RONo }) });

                if (ssCutting.data.length > 0) {
                    for (var ssC of ssCutting.data) {
                        for (var ssCItem of ssC.Details) {
                            for (var scSize of ssCItem.Sizes) {
                                var item = {};
                                item.cuttingInDetailId = scSize.CuttingInDetailId;
                                item.qty = scSize.Quantity;
                                if (ssCuttingItems[scSize.CuttingInDetailId]) {
                                    ssCuttingItems[scSize.CuttingInDetailId].qty += scSize.Quantity;
                                } else {
                                    ssCuttingItems[scSize.CuttingInDetailId] = item;
                                }
                            }
                        }
                    }
                }
                
                Promise.resolve(this.service.getCuttingIn({ filter: JSON.stringify({ RONo: this.data.RONo, UnitId: this.data.Unit.Id, CuttingType: "MAIN FABRIC" }) }))
                    .then(result => {
                        for (var cuttingInHeader of result.data) {
                            for (var cuttingInItem of cuttingInHeader.Items) {
                                for (var cuttingInDetail of cuttingInItem.Details) {
                                    var qtyOut = 0;
                                    var detail = {};

                                    if (ssCuttingItems[cuttingInDetail.Id]) {
                                        qtyOut += ssCuttingItems[cuttingInDetail.Id].qty;
                                    }
                                    
                                    if (this.data.Details.length == 0) {
                                        detail.CuttingInQuantity = cuttingInDetail.CuttingInQuantity - qtyOut;
                                        detail.DesignColor = cuttingInDetail.DesignColor;
                                        this.data.Details.push(detail);
                                    } else {
                                        var exist = this.data.Details.find(a => a.DesignColor == cuttingInDetail.DesignColor);
                                        if (!exist) {
                                            detail.CuttingInQuantity = cuttingInDetail.CuttingInQuantity - qtyOut;
                                            detail.DesignColor = cuttingInDetail.DesignColor;
                                            this.data.Details.push(detail);
                                        } else {
                                            var idx = this.data.Details.indexOf(exist);
                                            exist.CuttingInQuantity += cuttingInDetail.CuttingInQuantity - qtyOut;
                                            this.data.Details[idx] = exist;
                                        }
                                    }
                                }
                            }
                        }
                    }
                );
            } else {

                this.context.selectedCuttingInViewModel.editorValue = "";

                if (this.ROList.includes(this.data.RONo)) {
                    this.ROList.splice(this.ROList.indexOf(this.data.RONo), 1);
                }

                this.data.RONo = null;
                this.data.Article = null;
                this.data.Comodity = null;
                this.data.Items.splice(0);
            }
        }
    }
}