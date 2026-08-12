import { bindable, inject, containerless, computedFrom, BindingEngine } from "aurelia-framework";
import { BindingSignaler } from 'aurelia-templating-resources';
import { Service } from "./service";

var AccountLoader = require('../../../loader/account-loader');

@containerless()
@inject(Service, BindingSignaler, BindingEngine)
export class DataForm {
    @bindable readOnly = false;
    @bindable data = {};
    @bindable title;
    @bindable error = {};

    @bindable selectedStaff;
    @bindable selectedManager1;
    @bindable selectedManager2;

    constructor(service, bindingSignaler, bindingEngine) {
        this.service = service;
        this.signaler = bindingSignaler;
        this.bindingEngine = bindingEngine;
    }

    get accountLoader() {
        return AccountLoader;
    }

    accountView = (account) => {
        return account ? (account.username || account) : "";
    }

    controlOptions = {
        label: {
            length: 4
        },
        control: {
            length: 5
        }
    }

    bind(context) {
        this.context = context;
        this.data = this.context.data;
        this.error = this.context.error;

        if (this.data) {
            this.selectedStaff = this.data.Name;
            this.selectedManager1 = this.data.Manager1;
            this.selectedManager2 = this.data.Manager2;
        }
    }

    dataChanged(newValue) {
        if (newValue) {
            this.selectedStaff = newValue.Name;
            this.selectedManager1 = newValue.Manager1;
            this.selectedManager2 = newValue.Manager2;
        }
    }

    selectedStaffChanged(newValue) {
        if (newValue) {
            this.data.Name = typeof newValue === "object" ? newValue.username : newValue;
        } else {
            this.data.Name = null;
        }
    }

    selectedManager1Changed(newValue) {
        if (newValue) {
            this.data.Manager1 = typeof newValue === "object" ? newValue.username : newValue;
        } else {
            this.data.Manager1 = null;
        }
    }

    selectedManager2Changed(newValue) {
        if (newValue) {
            this.data.Manager2 = typeof newValue === "object" ? newValue.username : newValue;
        } else {
            this.data.Manager2 = null;
        }
    }
}