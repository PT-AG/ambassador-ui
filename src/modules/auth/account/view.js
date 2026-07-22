import {inject, Lazy} from 'aurelia-framework';
import {Router} from 'aurelia-router';
import {Service} from './service';
import { Base64Helper } from '../../../utils/base-64-coded-helper';

@inject(Router, Service)
export class View {
    constructor(router, service) {
        this.router = router;
        this.service = service;
    }

    async activate(params) {
        const decoded = Base64Helper.decode(params.id);
        var id = decoded;
        this.data = await this.service.getById(id);

        // this.employee = {
        //     DigitalId: this.data.digitalId,
        //     Name: `${this.data.profile.firstname || ""} ${this.data.profile.lastname || ""}`.trim()
        // };

        this.data.password = "";
    }

    list() {
        this.router.navigateToRoute('list');
    }

    edit() {
        const encoded = Base64Helper.encode(this.data._id);
        this.router.navigateToRoute('edit', { id: encoded });
    }

    delete() {
        this.service.delete(this.data)
            .then(result => {
                this.list();
            });
    }

    unlock() {
        this.service.unlock(this.data)
            .then(result => {
                this.activate({ id: this.data._id });
            });
    }
}
