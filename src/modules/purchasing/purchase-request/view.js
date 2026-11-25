import {inject, Lazy} from 'aurelia-framework';
import {Router} from 'aurelia-router';
import {Service} from './service';
import { Base64Helper } from '../../../utils/base-64-coded-helper';


@inject(Router, Service)
export class View {
    hasCancel = true;
    hasEdit = false;
    hasDelete = false;
    hasUnpost = false;
    prId = "";

    constructor(router, service) {
        this.router = router;
        this.service = service;
    }

    async activate(params, routeConfig, navigationInstruction) {
        var locale = 'id-ID';
        var moment = require('moment');
        moment.locale(locale);
        const instruction = navigationInstruction && navigationInstruction.getAllInstructions()[0];
        const parentInstruction = instruction && instruction.parentInstruction;
        const settings = (parentInstruction && parentInstruction.config && parentInstruction.config.settings) || {};
        this.byUser = settings.byUser !== false;

        const decoded = Base64Helper.decode(params.id);
        var id = decoded;
        this.prId = id;
        this.data = await this.service.getById(id, this.byUser);

        if (this.byUser) {
            if (!this.data.isPosted) {
                this.hasEdit = true;
                this.hasDelete = true;
            } else if (!this.data.isUsed && !this.data.isApprovedStaff) {
                this.hasUnpost = true;
            }
        }

        this.data.unit.toString = function () {
            return [this.division.name, this.name]
                .filter((item, index) => {
                    return item && item.toString().trim().length > 0;
                }).join(" - ");
        }
        this.data.budget.toString = function () {
            return [this.code, this.name]
                .filter((item, index) => {
                    return item && item.toString().trim().length > 0;
                }).join(" - ");
        }
        this.data.category.toString = function () {
            return [this.code, this.name]
                .filter((item, index) => {
                    return item && item.toString().trim().length > 0;
                }).join(" - ");
        }
        this.data.items.forEach(item => {
            item.product.toString = function () {
                return [this.code, this.name]
                    .filter((item, index) => {
                        return item && item.toString().trim().length > 0;
                    }).join(" - ");
            }
        })
    }

    cancel(event) {
        this.router.navigateToRoute('list');
    }

    edit(event) {
        const encoded = Base64Helper.encode(this.data._id);
        this.router.navigateToRoute('edit', { id: encoded });
    }

    delete(event) {
        this.service.delete(this.data).then(result => {
            this.cancel();
        });
    }

    unpost(event) {
        this.service.unpost(this.prId).then(result => {
            this.cancel();
        }).catch(e => {
            this.error = e;
        })
    }
}