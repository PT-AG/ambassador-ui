import { inject } from 'aurelia-framework';
import { Service } from "./service";
import { Router } from 'aurelia-router';

@inject(Router, Service)
export class List {
    constructor(router, service) {
        this.service = service;
        this.router = router;
        //this.data = [];
        this.filteredData = [];
        this.filters = {
            index: '',
            RO_Number: '',
            PO_SerialNumber: '',
            ProductCode: '',
            ProductName: '',
            Color: '',
            BudgetQuantity: '',
            Quantity: '',
            UomUnit: ''
        };
    }

    typeOptions = ["RO", "PO Serial Number"];

    searching() {
        let args = {
            "keyword" : this.roNo,
            "type": this.selectedType
        }

        this.service.search(args)
            .then(result => {
                this.data = result.data.map((item, index) => {
                    item.index = index + 1;
                    return item;
                });
                this.filterData();
            });
    }

    filterData(field, value) {
        if (field) {
            this.filters[field] = value;
        }

        this.filteredData = this.data.filter(item => Object.keys(this.filters).every(key => {
            let keyword = this.filters[key].trim().toLowerCase();
            let cell = item[key] == null ? '' : String(item[key]).toLowerCase();
            return cell.indexOf(keyword) !== -1;
        }));
    }

    reset() {
        this.roNo = "";
        Object.keys(this.filters).forEach(key => this.filters[key] = '');
        this.filterData();
    }
}