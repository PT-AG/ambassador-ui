import { inject, useView } from 'aurelia-framework';
import { DialogController } from 'aurelia-dialog';
import { Service, PurchasingService } from '../../service';
import { ServiceCore } from '../../service-core';

@inject(DialogController, Service, PurchasingService, ServiceCore)
@useView("modules/merchandiser/cost-calculation/template/data-form/do-items-dialog.html")
export class DOItemsDialog {
    data = {};
    error = {};

    constructor(controller, service, prService, coreService) {
        this.controller = controller;
        this.answer = null;
        this.service = service;
        this.prService = prService;
        this.coreService = coreService;
    }

    options = {
        showColumns: false,
        showToggle: false,
        clickToSelect: true,
        height: 500
    }

    columns = [
        { field: "isSelected", radio: true, sortable: false},
        { field: "RONo", title: "Nomor RO" },
        { field: "POSerialNumber", title: "No. PO" }, 
        { field: "ProductName", title: "Kategori" },
        { field: "ProductCode", title: "Kode Barang" },
        { field: "Composition.Composition", title: "Komposisi", sortable: false },
        { field: "Const.Const", title: "Konstruksi", sortable: false },
        { field: "Yarn.Yarn", title: "Yarn", sortable: false },
        { field: "Width.Width", title: "Width", sortable: false },
        { field: "Colour", title: "Color" },
        { field: "DesignColor", title: "Design Color" },
        { field: "RemainingQuantity", title: "Jumlah Tersedia" },
        { field: "Uom.Unit", title: "Satuan" },
    ];

    loader = (info) => {
        this.selectedData = [];

        var order = {};
        if (info.sort)
            order[info.sort] = info.order;

        var arg = {
            page: parseInt(info.offset / info.limit, 10) + 1,
            size: info.limit,
            keyword: info.search,
            order: order,
            filter: JSON.stringify(this.filter),
        }

        return this.prService.searchdoItems(arg)
            .then(result => {
                    console.log(result)
                result.data.map(data => {
                    return data;
                });

                let data = [];
                for (const d of result.data) {
                    data.push(Object.assign({
                        DOItemId: d.Id,
                        PRMasterItemId: d.Id,
                        POSerialNumber: d.POSerialNumber,
                        RONo: d.RO,
                        Article: d.Article,

                        Category: {
                            Id: d.CategoryId,
                            name: d.ProductName,
                        },
                        Product: {
                            Id: d.ProductId,
                            Code: d.ProductCode,
                            Name: d.ProductName,
                        },
                        Description: d.DesignColor,
                        Uom: {
                            Id: d.SmallUomId,
                            Unit: d.SmallUomUnit
                        },
                        BudgetPrice: d.PricePerDealUnit,
                        PriceUom: {
                            Id: d.SmallUomId,
                            Unit: d.SmallUomUnit
                        },
                        Quantity : d.RemainingQuantity,
                        AvailableQuantity : d.RemainingQuantity,
                        SplitQuantity:d.SplitQuantity
                    }, d));
                }
                let fabricItemsProductIds = data
                            .filter(i => i.Product.Name === "FABRIC")
                            .map(i => i.Product.Id);

                        if (fabricItemsProductIds.length) {
                            return this.coreService.getGarmentProductsByIds(fabricItemsProductIds)
                                .then(garmentProductsResult => {
                                    data.filter(i => i.Product.Name === "FABRIC")
                                        .forEach(i => {
                                            const product = garmentProductsResult.find(d => d.Id == i.Product.Id);

                                            i.Product = product;
                                            i.Composition = product;
                                            i.Const = product;
                                            i.Yarn = product;
                                            i.Width = product;
                                        });

                                    return {
                                        total: result.info.total,
                                        data: data
                                    }
                                });
                        } else {
                            return {
                                total: result.info.total,
                                data: data
                            }
                        }
            });
    }

    activate(params) {
        this.CCId = params.CCId;
        this.filter = {};
    }

    select() {
        if (this.selectedData && this.selectedData.length > 0) {
            console.log(this.selectedData)
            if((this.selectedData.SplitQuantity==null || this.selectedData.SplitQuantity<=0)&& this.selectedData.ProductName=="FABRIC"){
                alert("Data yang dipilih belum di Racking.")
            }
            else{
                this.controller.ok(this.selectedData[0]);
            }
        } else {
            alert("Belum ada yang dipilih!")
        }
    }
}
