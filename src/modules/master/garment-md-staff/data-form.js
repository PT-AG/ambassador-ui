import { inject, bindable, computedFrom } from 'aurelia-framework';
import { Service } from "./service";

const AccountLoader = require('../../../loader/account-staff-loader');

@inject(Service)
export class DataForm {
    @bindable title;
    @bindable readOnly;
    @bindable selectedStaff;

    formOptions = {
        cancelText: "Kembali",
        saveText: "Simpan",
        deleteText: "Hapus",
        editText: "Ubah",
    }

    constructor(service) {
        this.service = service;
    }

    bind(context) {
        this.context = context;
        this.data = this.context.data;
        this.error = this.context.error;

        if (this.data.Id || this.data._id || this.data.id) 
            this.selectedStaff = { id: 0, username: this.data.name || this.data.Name }

    }

    accountView = (account) => {
        return `${account.username || account.Username}`;
    }

    get accountLoader() {
        return AccountLoader;
    }

    selectedStaffChanged(newValue) {
        if (newValue) {
            this.selectedStaff = newValue;
            this.data.Name = newValue.username;
        }
    }
}