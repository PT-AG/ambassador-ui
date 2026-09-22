import { inject, Lazy } from "aurelia-framework";
import { Router } from "aurelia-router";
import { activationStrategy } from "aurelia-router";
import moment from "moment";
import numeral from "numeral";
import { Service } from "./service";
const UnitPaymentOrderLoader = require("../../../loader/unit-payment-order-loader");
const SupplierLoader = require("../../../loader/supplier-loader");
const DivisionLoader = require("../../../loader/division-loader");

const VBRealizationLoader = require("../loaders/vb-realization-loader");
const VBRequestLoader = require("../loaders/vb-request-loader");
const AccountLoader = require("../loaders/account-loader");
const UnitLoader = require("../loaders/unit-loader");

const BankLoader= require('../../../loader/account-banks-loader');

@inject(
  Router,
  Service
)
export class Create {
    
  
    get bankLoader() {
        return BankLoader;
    }
    columns2 = [
        {
        field: "selected",
        checkbox: true,
        sortable: false,
        },
        {
        field: "CompletedDate",
        title: "Tanggal Terima Kasir",
        formatter: function (value, data, index) {
            return value ? moment(value).format("DD MMM YYYY") : "-";
        },
        },
        { field: "DocumentNo", title: "No Realisasi VB" },
        // {
        // field: "VBRealizationDate",
        // title: "Tanggal Realisasi VB",
        // formatter: function (value, data, index) {
        //     return moment(value).format("DD MMM YYYY");
        // },
        // },
        // { field: "VBRealizationNo", title: "No Realisasi" },
        // {
        // field: "VBType",
        // title: "Tipe VB",
        // formatter: function (value, data, index) {
        //     return value == 1 ? "Dengan PO" : "Non PO";
        // },
        // },
        // { field: "VBRequestName", title: "Pemohon VB" },
        // { field: "UnitName", title: "Unit Pemohon" },
        {
        field: "Amount",
        title: "Nominal Realisasi",
        formatter: function (value, data, index) {
            return numeral(value).format("0,000.00");
        },
        align: "right",
        },
        { field: "CurrencyCode", title: "Mata Uang" },
    ];
    
    tableOptions = {
        pagination: false,
        showColumns: false,
        search: false,
        showToggle: false,
    };

    formOptions = {
        cancelText: "Kembali",
        saveText: "Simpan",
    };

    controlOptions = {
        label: {
        length: 4,
        },
        control: {
        length: 4,
        },
    };

    constructor(
        router,
        service
    ) {
        this.router = router;
        this.service = service;

        this.selectUPO = ["no"];
        this.selectSupplier = ["code", "name"];
        this.selectDivision = ["code", "name"];
        this.documentData = [];
        this.selectedItems = [];

    }

    loader = (info) => {
        let order = {};

        let vbRequestId = 0;
        if (this.data && this.data.vbRequest && this.data.vbRequest.Id)
        vbRequestId = this.data.vbRequest.Id;

        let vbRealizationId = 0;
        if (this.data && this.data.vbRealization && this.data.vbRealization.Id)
        vbRealizationId = this.data.vbRealization.Id;

        let vbRealizationRequestPerson = "";
        if (this.data && this.data.account)
        vbRealizationRequestPerson = this.data.account.username;

        let unitId = 0;
        if (this.data && this.data.unit) unitId = this.data.unit.Id;

        if (info.sort) order[info.sort] = info.order;
        let arg = {
        page: parseInt(info.offset / info.limit, 10) + 1,
        size: info.limit,
        keyword: info.search,
        order: order, // VERIFICATION_DIVISION,
        position: 5,
        filter: JSON.stringify({
            "ReferenceNo==null": true
        }),
        vbId: vbRequestId,
        vbRealizationId: vbRealizationId,
        vbRealizationRequestPerson: vbRealizationRequestPerson,
        unitId: unitId,
        };

        // console.log(this.activeRole);

        return this.service.searchRealization(arg).then((result) => {
        //   console.log(result);
        return {
            total: result.info.Count,
            data: result.data,
        };
        });
    };

    cancelCallback(event) {
        this.router.navigateToRoute("list");
    }

    saveCallback(event) {
        if (this.selectedItems && this.selectedItems.length > 0) {
            const vbIds = this.selectedItems.map((datum) => {
                return datum.Id;
            });
            if(!this.selectedBank){
                alert("harap pilih bank");
                return;
            }

            const args = {
            ListIds: this.selectedItems.map((d) => {
                return {
                    VBRequestId: d.VBRequestDocumentId,
                    VBRealizationId: d.Id,
                };
            }),
            Bank: this.selectedBank, // Replace with actual bank information if needed
            };
            this.service
            .post(args)
            .then(() => {
                alert("Data berhasil dibuat");
                this.documentTable.refresh();
            })
            .catch((e) => {
                this.error = e;
            });
        } else {
            alert("harap pilih data");
        }
    }

    get unitPaymentOrderLoader() {
        return UnitPaymentOrderLoader;
    }

    get supplierLoader() {
        return SupplierLoader;
    }

    get divisionLoader() {
        return DivisionLoader;
    }

    search() {
        // console.log(this.data);
        this.documentTable.refresh();
    }

    get vbRealizationLoader() {
        return VBRealizationLoader;
    }

    get vbRequestLoader() {
        return VBRequestLoader;
    }

    get accountLoader() {
        return AccountLoader;
    }

    get unitLoader() {
        return UnitLoader;
    }

}
