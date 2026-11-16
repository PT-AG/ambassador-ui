import { inject, bindable, computedFrom } from 'aurelia-framework'
import { Service } from "../service";

const UnitLoader = require('../../../../../../loader/garment-units-loader');

@inject(Service)
export class items {
    @bindable selectedUnit;

    get unitLoader() {
        return UnitLoader;
    }
    
    constructor(service) {
        this.service = service;
    }

    async activate(context) {
        this.context = context;
        this.data = context.data;
        this.error = context.error;
        this.options = context.options;
        this.isEdit = context.context.options.isEdit && this.data.Id > 0;

        if (this.data) {
            this.selectedUnit = this.data.Unit;
        };
    }
}