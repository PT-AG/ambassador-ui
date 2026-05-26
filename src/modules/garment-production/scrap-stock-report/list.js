import { inject, bindable } from 'aurelia-framework';
import { Service } from "./service";
import { Router } from 'aurelia-router';
var moment = require('moment');

const ScrapDestinationLoader = require('../../../loader/garment-scrap-destination-loader');
const ScrapClassificationLoader = require('../../../loader/garment-scrap-classification-loader');

@inject(Router, Service)
export class List {
    constructor(router, service) {
        this.service = service;
        this.router = router;
        this.today = new Date();
    }

    info = { page: 1, size: 50 };
    controlOptions = {
        label: {
            length: 4
        },
        control: {
            length: 4
        }
    };

    destinationView = (unit) => {
        return `${unit.Code} - ${unit.Name}`;
    }
    
    get destinationLoader() {
        return ScrapDestinationLoader;
    }

    classificationView = (unit) => {
        return `${unit.Code} - ${unit.Name}`;
    }

    get classificationLoader() {
        return ScrapClassificationLoader;
    }

    search() {
        this.info.page = 1;
        this.info.total = 0;
        this.searching();
    }

    ExportToExcel() {
        var info = {
            page: this.info.page,
            size: this.info.size,
            dateFrom: this.dateFrom ? moment(this.dateFrom).format("YYYY-MM-DD") :  moment(this.today).format("YYYY-MM-DD"),
            dateTo: this.dateTo ? moment(this.dateTo).format("YYYY-MM-DD") :  moment(this.today).format("YYYY-MM-DD"),
            destination: this.destination ? this.destination.Id : "",
            classification: this.classification ? this.classification.Id : "",
        };
            
        this.service.generateExcel(info);
    }

    searching() {
        var args = {
            page: this.info.page,
            size: this.info.size,
            dateFrom: this.dateFrom ? moment(this.dateFrom).format("YYYY-MM-DD") :  moment(this.today).format("YYYY-MM-DD"),
            dateTo: this.dateTo ? moment(this.dateTo).format("YYYY-MM-DD") :  moment(this.today).format("YYYY-MM-DD"),
            destination: this.destination ? this.destination.Id : "",
            classification: this.classification ? this.classification.Id : "",
        };

        this.service.search(args)
            .then(result => {
                this.data = result.data;
                this.info.total = result.info.total
            });
    }

    reset() {
        this.dateFrom = "",
        this.dateTo = ""
        this.destination = null;
        this.classification = null;
    }

    dateFromChanged(e) {
        var _startDate = new Date(e.srcElement.value);
        var _endDate = new Date(this.dateTo);
        this.dateMin = moment(_startDate).format("YYYY-MM-DD");

        if (_startDate > _endDate || !this.dateTo) {
            this.dateTo = e.srcElement.value;
        }
    }

    changePage(e) {
        var page = e.detail;
        this.info.page = page;
        this.searching();
    }
}
