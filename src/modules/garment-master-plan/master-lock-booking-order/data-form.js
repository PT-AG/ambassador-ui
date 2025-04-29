import { bindable, inject, containerless, computedFrom, BindingEngine } from "aurelia-framework";
import { BindingSignaler } from 'aurelia-templating-resources';
import { Service } from "./service";
var moment = require('moment');

@containerless()
@inject(Service, BindingSignaler, BindingEngine)
export class DataForm {
    @bindable readOnly = false;
    @bindable isEdit = false;
    @bindable data = {};
    @bindable error = {};
    @bindable title;
    @bindable selectedUnit;

    constructor(service, bindingSignaler, bindingEngine) {
        this.service = service;
        this.signaler = bindingSignaler;
        this.bindingEngine = bindingEngine;
    }

    controlOptions = {
        label: {
            length: 4
        },
        control: {
            length: 5
        }
    }
    //create array of month in Bahasa Indonesia then capitalize all words
    months = [
        { Month: "JANUARI" },
        { Month: "FEBRUARI" },
        { Month: "MARET" },
        { Month: "APRIL" },
        { Month: "MEI" },
        { Month: "JUNI" },
        { Month: "JULI" },
        { Month: "AGUSTUS" },
        { Month: "SEPTEMBER" },
        { Month: "OKTOBER" },
        { Month: "NOVEMBER" },
        { Month: "DESEMBER" }
    ]

    async bind(context) {
        this.context = context;
        this.data = this.context.data;
        this.error = this.context.error;
        this.isView = this.context.isView;

        if (this.data.Id == undefined) {
            this.data.Items = this.months;
        } else {
            this.data.Items = this.data.Items;
        }
        this.fillTableItem();

    }

    fillTableItem() {
        //PREPARING
        let columns = [];
        columns.push({
            field: "IsBlock",
            title: "",
            // checkbox: true,
            sortable: false,
            width: 50,
            align: "center",
            valign: "middle",
            formatter: (value, row, index) => {
                window.updateIsBlock = (index, value) => {
                    // Handle checkbox change ke model data
                    this.data.Items[index].IsBlock = value;
                };

                const checked = value ? "checked" : "";
                const disabled = this.isView ? "disabled" : "";

                return `<input type="checkbox" ${checked} ${disabled} onchange="window.updateIsBlock(${index}, this.checked)">`;
            }
        });
        columns.push({
            field: "Month",
            title: "Bulan",
            width: 250,
            align: "left",
            valign: "middle"
        })

        var bootstrapTableOptions = {
            columns: columns,
            data: this.data.Items,
            fixedColumns: false,
            fixedNumber: 1,
        };

        $(this.tableItem)
            .bootstrapTable("destroy")
            .bootstrapTable(bootstrapTableOptions);

    }

    activate() { }

    attached() { }
}
