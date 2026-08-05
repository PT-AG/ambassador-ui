import { inject } from 'aurelia-framework';
import { Service } from "./service";
import { Router } from 'aurelia-router';
import moment from 'moment';

var PurchasePriceCorrectionLoader = require('../../../loader/garment-correction-price-note-loader');
var SupplierLoader = require('../../../loader/garment-supplier-loader');

@inject(Router, Service)
export class List {
    constructor(router, service) {
        this.service = service;
        this.router = router;
    }
    get purchasePriceCorrectionLoader() {
        return PurchasePriceCorrectionLoader;
    }
    get supplierLoader() {
        return SupplierLoader;
    }
    searching() {
        var info = {
            no: this.no ? this.no : "",
            supplier: this.supplier ? this.supplier.code : "",
            dateFrom: this.dateFrom ? moment(this.dateFrom).format("YYYY-MM-DD") : "",
            dateTo: this.dateTo ? moment(this.dateTo).format("YYYY-MM-DD") : ""
        }
        this.service.search(info.no, info.supplier, info.dateFrom, info.dateTo)
            .then(result => {
                this.data = [];
                var counter = 1;
                for (var pr of result) {
                    var _data = {};
                    _data.no = pr.pr.no;
                    _data.date = pr.pr.date;
                    _data.index = counter;
                    _data.correctionType = pr.pr.correctionType;
                    _data.supplierCode = pr.pr.supplierCode;
                    _data.supplier = pr.pr.supplierCode + " - " + pr.pr.supplier;
                    _data.deliveryorderNo = pr.pr.deliveryorderNo;
                    _data.deliveryorderDate = pr.pr.deliveryorderDate;
                    _data.noPOEks = pr.pr.noPOEks;
                    _data.noPR = pr.pr.noPR;
                    _data.noRefPR = pr.pr.noRefPR;
                    _data.noRO = pr.pr.noRO;
                    _data.itemName = pr.pr.itemName;
                    _data.unitCode = pr.pr.uomUnit;
                    
                    var corrections = pr.pr.fulfillments.corrections;

                    // Data Surat Jalan
                    _data.qty_surat_jalan = pr.pr.fulfillments.deliveredQuantity;
                    _data.harga_satuan_surat_jalan = pr.pr.pricePerUnit;
                    _data.harga_total_surat_jalan = _data.qty_surat_jalan * _data.harga_satuan_surat_jalan;
                    
                    // Data Koreksi
                    _data.qty = corrections.Quantity;
                    _data.pricePerUnit = corrections.PricePerDealUnitAfter - corrections.PricePerDealUnitBefore;
                    _data.priceTotal = corrections.PriceTotalAfter - corrections.PriceTotalBefore;

                    this.data.push(_data);
                    counter++;
                }
            });
    }

    reset() {
        this.no = "";
        this.supplier = "";
        this.dateFrom = "";
        this.dateTo = "";
        this.data = [];
    }

    ExportToExcel() {
        var info = {
            no: this.no ? this.no : "",
            supplier: this.supplier ? this.supplier.code : "",
            dateFrom: this.dateFrom ? moment(this.dateFrom).format("YYYY-MM-DD") : "",
            dateTo: this.dateTo ? moment(this.dateTo).format("YYYY-MM-DD") : ""
        };
        this.service.generateExcel(info.no, info.supplier, info.dateFrom, info.dateTo);
    }
}