import { inject } from 'aurelia-framework';
import { Service } from "./service";
import { Router } from 'aurelia-router';
import moment from 'moment';

var PurchaseQuantityCorrectionLoader = require('../../../loader/garment-correction-quantity-note-loader');
var SupplierLoader = require('../../../loader/garment-supplier-loader');

@inject(Router, Service)
export class List {
  constructor(router, service) {
        this.service = service;
        this.router = router;

    }
    get purchaseQuantityCorrectionLoader(){
        return PurchaseQuantityCorrectionLoader;
       
    }
    get supplierLoader(){
        return SupplierLoader;
    }
  searching() {
        var info = {
            no : this.no ? this.no : "",
            supplier : this.supplier ? (this.supplier.name || this.supplier.code || this.supplier) : "",
            dateFrom : this.dateFrom ? moment(this.dateFrom).format("YYYY-MM-DD") : "",
            dateTo : this.dateTo ? moment(this.dateTo).format("YYYY-MM-DD") : ""
        }
        this.service.search(info.no,info.supplier,info.dateFrom,info.dateTo)
            .then(result => {
                var data = result.data ? result.data : result;
                this.data = [];
                var counter = 1;
                
                var filterNo = info.no ? (typeof info.no === "string" ? info.no : (info.no.pr ? info.no.pr.no : info.no.no)) : "";
                var filterSupplier = info.supplier ? (info.supplier.name || info.supplier.code || info.supplier) : "";

                for (var row of data) {
                    var pr = row.pr ? row.pr : row;
                    
                    if (filterNo && pr.no !== filterNo) continue;
                    if (filterSupplier && pr.supplier !== filterSupplier) continue;

                    // Hapus filter strict pr.itemsProdId === pr.fulProdId agar data muncul
                    var _data = {};
                    _data.no = pr.no;
                    _data.date = pr.date;
                    _data.index = counter;
                    _data.noPOEks = pr.noPOEks;
                    _data.correctionType = pr.correctionType || '-';
                    _data.currencyCode = pr.currencyCode || pr.currrencyCode || '-';
                    _data.deliveryorderNo = pr.deliveryorderNo;
                    _data.supplierCode = pr.supplierCode;
                    _data.supplier = pr.supplier;
                    _data.deliveryorderNo = pr.deliveryorderNo;
                    _data.deliveryorderDate = pr.deliveryorderDate;
                    _data.noPR = pr.noPR;
                    _data.noRefPR = pr.noRefPR || '-';
                    _data.noRO = pr.noRO;
                    _data.itemCode = pr.itemCode;
                    _data.itemName = pr.itemName;
                    _data.qty = pr.qty || 0;
                    _data.unitCode = pr.uomUnit || pr.unitCode || '-';
                    _data.pricePerUnit = pr.pricePerUnit || 0;
                    _data.priceTotal = pr.priceTotal || 0;

                    if (pr.fulfillments) {
                        var correction = pr.fulfillments.corrections ? pr.fulfillments.corrections : pr.fulfillments.correction;
                        
                        if (correction) {
                            if (Array.isArray(correction) && correction.length > 0) {
                                var lastCorr = correction[correction.length - 1];
                                _data.qtyBegin = lastCorr.correctionQuantity;
                                _data.correctionPricePerUnit = lastCorr.correctionPricePerUnit;
                                _data.correctionPriceTotal = lastCorr.correctionPriceTotal;
                            } else if (!Array.isArray(correction) && correction.Quantity !== undefined) {
                                _data.qtyBegin = pr.fulfillments.deliveredQuantity;
                                _data.correctionPricePerUnit = pr.pricePerUnit;
                                _data.correctionPriceTotal = _data.qtyBegin * _data.correctionPricePerUnit;
                                _data.qty = correction.Quantity;
                                _data.pricePerUnit = pr.pricePerUnit;
                                _data.priceTotal = _data.qty * _data.pricePerUnit;
                                _data.unitCode = pr.uomUnit || '-';
                            } else {
                                _data.qtyBegin = pr.fulfillments.deliveredQuantity || 0;
                                _data.correctionPricePerUnit = pr.fulfillments.pricePerDealUnit || 0;
                                _data.correctionPriceTotal = (_data.correctionPricePerUnit * _data.qtyBegin) || 0;
                            }
                        } else {
                            _data.qtyBegin = pr.fulfillments.deliveredQuantity || 0;
                            _data.correctionPricePerUnit = pr.fulfillments.pricePerDealUnit || 0;
                            _data.correctionPriceTotal = (_data.correctionPricePerUnit * _data.qtyBegin) || 0;
                        }
                    } else {
                        _data.qtyBegin = 0;
                        _data.correctionPricePerUnit = 0;
                        _data.correctionPriceTotal = 0;
                    }

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
            supplier: this.supplier ? (this.supplier.name || this.supplier.code || this.supplier) : "",
            dateFrom: this.dateFrom ? moment(this.dateFrom).format("YYYY-MM-DD") : "",
            dateTo: this.dateTo ? moment(this.dateTo).format("YYYY-MM-DD") : ""
        };
        this.service.generateExcel(info.no, info.supplier, info.dateFrom, info.dateTo);
    }
}