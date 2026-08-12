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

    @bindable selectedName;
    @bindable selectedApprovalPR;
    @bindable selectedApprovalCC;
    @bindable selectedApprovalRO;

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
            this.selectedName = this.data.Name;
            this.selectedApprovalPR = this.data.ApprovalPR;
            this.selectedApprovalCC = this.data.ApprovalCC;
            this.selectedApprovalRO = this.data.ApprovalRO;
        }
    }

    dataChanged(newValue) {
        if (newValue) {
            this.selectedName = newValue.Name;
            this.selectedApprovalPR = newValue.ApprovalPR;
            this.selectedApprovalCC = newValue.ApprovalCC;
            this.selectedApprovalRO = newValue.ApprovalRO;
        }
    }

    selectedNameChanged(newValue) {
        if (newValue) {
            this.data.Name = typeof newValue === "object" ? newValue.username : newValue;
        } else {
            this.data.Name = null;
        }
    }

    selectedApprovalPRChanged(newValue) {
        if (newValue) {
            this.data.ApprovalPR = typeof newValue === "object" ? newValue.username : newValue;
        } else {
            this.data.ApprovalPR = null;
        }
    }

    selectedApprovalCCChanged(newValue) {
        if (newValue) {
            this.data.ApprovalCC = typeof newValue === "object" ? newValue.username : newValue;
        } else {
            this.data.ApprovalCC = null;
        }
    }

    selectedApprovalROChanged(newValue) {
        if (newValue) {
            this.data.ApprovalRO = typeof newValue === "object" ? newValue.username : newValue;
        } else {
            this.data.ApprovalRO = null;
        }
    }
}