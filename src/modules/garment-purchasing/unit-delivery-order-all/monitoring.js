import { inject, bindable } from 'aurelia-framework';
import { Service } from "./service";
import { Router } from 'aurelia-router';
import moment from 'moment';
var UnitLoader = require('../../../loader/garment-units-loader');
var StorageLoader = require('../../../loader/storage-loader');

@inject(Router, Service)
export class List {
    unitDoTypes = ['PROSES', 'TRANSFER', 'SAMPLE', 'SISA', 'SUBCON', 'TRANSFER SAMPLE'];
    info = { page: 1, size: 25 };

    @bindable unit;

    constructor(router, service) {
        this.service = service;
        this.router = router;
        this.data = [];
    }

    get unitLoader() {
        return UnitLoader;
    }

    unitView = (unit) => {
        return `${unit.Name}`
    }

    get storageLoader() {
        return StorageLoader;
    }

    storageView = (storage) => {
        return `${storage.name} - ${storage.unit.name}`
    }

    storageFilter = this.unit ? { UnitName : this.unit.Name } : {};

    attached() {

    }

    activate() {

    }

    search() {
        this.info.page = 1;
        this.info.total = 0;
        this.searching();
    }

    dateFromChanged(e) {
        var _startDate = new Date(e.srcElement.value);
        var _endDate = new Date(this.dateTo);
        this.dateMin = moment(_startDate).format("YYYY-MM-DD");

        if (_startDate > _endDate || !this.dateTo) {
            this.dateTo = e.srcElement.value;
        }
    }

    unitChanged(newValue) {
        this.storage = null;
        this.storageFilter = newValue ? { UnitName : newValue.Name } : {};
    }

    searching() {
        let args = {
            page: this.info.page,
            size: this.info.size,
            unitDoType: this.unitDoType ? this.unitDoType : unitDoTypes[0],
            unit: this.unit ? this.unit.Code : "",
            storage: this.storage ? this.storage.code : "",
            unitDoNo: this.unitDo ? this.unitDo : "",
            roNo: this.roNo ? this.roNo : "",
            dateFrom: this.dateFrom ? moment(this.dateFrom).format("YYYY-MM-DD") : "",
            dateTo: this.dateTo ? moment(this.dateTo).format("YYYY-MM-DD") : "",
        };

        this.service.searchMonitoring(args)
            .then(result => {
                this.data = result.data.map((item, idx) => {
                    item.Date = moment(item.UnitDODate).format("DD MMM YYYY");
                    item.index = idx + 1 + (this.info.page - 1) * this.info.size;
                    return item;
                });
            })
    }

    reset() {
        this.unit = {},
        this.storage = {},
        this.unitDoType = unitDoTypes[0],
        this.unitDo = "",
        this.roNo = "",
        this.dateFrom = "",
        this.dateTo = "",
        this.data = [];
        this.info.page = 1;
    }

    changePage(e) {
        var page = e.detail;
        this.info.page = page;
        this.searching();
    }
}