import { inject } from 'aurelia-framework';
import { Service } from "./service";
import { Router } from 'aurelia-router';

@inject(Router, Service)
export class List {
    constructor(router, service) {
        this.service = service;
        this.router = router;
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
            });
    }

    reset() {
        this.keyword = "";
    }
}