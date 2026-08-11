import {inject} from 'aurelia-framework';
import {Service} from "./service";
import {Router} from 'aurelia-router';
import { Base64Helper } from '../../../utils/base-64-coded-helper';

@inject(Router, Service)
export class List {
    data = [];
    info = { page: 1, keyword: '', order: { isLocked: "desc" } };

    constructor(router, service) {
        this.service = service;
        this.router = router;
        this.accountId = "";
        this.accounts = [];
    }

    async activate() {
        this.info.keyword = '';
        this.info.order = { isLocked: "desc" };
        var result = await this.service.search(this.info);
        this.data = result.data.sort((a, b) => b.isLocked - a.isLocked);
        this.info = result.info;
        this.info.order = { isLocked: "desc" };
    }

    loadPage() {
        var keyword = this.info.keyword;
        this.info.order = { isLocked: "desc" };
        this.service.search(this.info)
            .then(result => {
                this.data = result.data.sort((a, b) => b.isLocked - a.isLocked);
                this.info = result.info;
                this.info.keyword = keyword;
                this.info.order = { isLocked: "desc" };
            })
    }

    changePage(e) {
        var page = e.detail;
        this.info.page = page;
        this.loadPage();
    }
    
    view(data) {
        const encoded = Base64Helper.encode(data._id);
        this.router.navigateToRoute('view', { id: encoded });
    }

    create() {
        this.router.navigateToRoute('create');
    }
}