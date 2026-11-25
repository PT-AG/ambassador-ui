import {inject, bindable, computedFrom} from 'aurelia-framework'
import moment from 'moment';
var UnitLoader = require('../../../loader/unit-loader');
var BudgetLoader = require('../../../loader/budget-loader');
var CategoryLoader = require('../../../loader/category-loader');

export class DataForm {
    @bindable readOnly = false;
    @bindable data = {};
    @bindable error = {};
    // @bindable prInternal;

    @bindable title;

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

        // if(this.data.internal){
        //     this.prInternal = this.data.internal;
        // }

        this.collectionOptions = { 
            readOnly: this.readOnly,
            statusDetails: this.data.statusDetails || [],
            isShowingAll: false
        };

        if (this.readOnly) {
            this.headerTemplate = "modules/purchasing/purchase-request/template/purchase-request-item-header";
        }
    }

    _formatApprovalDate(value) {
        return value ? moment(value).format("DD MMM YYYY HH:mm") : "-";
    }

    @computedFrom('data.isApprovedStaff', 'data.approvedStaffBy', 'data.approvedStaffDate',
                  'data.isApprovedManager1', 'data.approvedManager1By', 'data.approvedManager1Date',
                  'data.isApprovedManager2', 'data.approvedManager2By', 'data.approvedManager2Date',
                  'data.isRejected', 'data.rejectedBy', 'data.rejectedDate', 'data.reasonRejected')
    get approvalSteps() {
        const d = this.data || {};
        const steps = [
            {
                label: "Approval Staff",
                statusText: d.isApprovedStaff ? "SUDAH" : "BELUM",
                badgeClass: d.isApprovedStaff ? "label-success" : "label-default",
                by: d.approvedStaffBy || "-",
                date: this._formatApprovalDate(d.approvedStaffDate),
                note: ""
            },
            {
                label: "Approval Manager 1",
                statusText: d.isApprovedManager1 ? "SUDAH" : "BELUM",
                badgeClass: d.isApprovedManager1 ? "label-success" : "label-default",
                by: d.approvedManager1By || "-",
                date: this._formatApprovalDate(d.approvedManager1Date),
                note: ""
            },
            {
                label: "Approval Manager 2",
                statusText: d.isApprovedManager2 ? "SUDAH" : "BELUM",
                badgeClass: d.isApprovedManager2 ? "label-success" : "label-default",
                by: d.approvedManager2By || "-",
                date: this._formatApprovalDate(d.approvedManager2Date),
                note: ""
            }
        ];

        if (d.isRejected) {
            steps.push({
                label: "Penolakan (Reject)",
                statusText: "DITOLAK",
                badgeClass: "label-danger",
                by: d.rejectedBy || "-",
                date: this._formatApprovalDate(d.rejectedDate),
                note: d.reasonRejected || "-"
            });
        }

        return steps;
    }

    @computedFrom('data.rejectedDate')
    get formattedRejectedDate() {
        return this.data && this.data.rejectedDate ? this._formatApprovalDate(this.data.rejectedDate) : "-";
    }

    itemsColumns = [
        { header: "Barang", value: "product" },
        { header: "Jumlah", value: "quantity" },
        { header: "Satuan", value: "product.uom" },
        { header: "Keterangan", value: "remark" }
    ]

    unitChanged(e) {
        if (this.data.unit)
        {
            this.data.unitId = this.data.unit.Id || this.data.unit._id || {};
            this.data.unit._id = this.data.unitId;

            if(this.data.unit.Division)
                this.data.unit.Division._id = this.data.unit.Division.Id || "";
        }
    }

    budgetChanged(e) {
        if (this.data.budget)
            this.data.budgetId = this.data.budget._id ? this.data.budget._id : {};
    }

    categoryChanged(e) {
        if (this.data.category)
            this.data.categoryId = this.data.category._id ? this.data.category._id : {};
    }

    // prInternalChanged(e){
    //         if(e==true){
    //             this.data.internal = true;
    //         }else{
    //             this.data.internal = false;
    //         }
    // }

    get unitLoader() {
        return UnitLoader;
    }

    get unitQuery(){
        //var result = { "_CreatedBy" : "router" }
        var result = {};
        return result;   
    }

    get budgetLoader() {
        return BudgetLoader;
    }

    get categoryLoader() {
        return CategoryLoader;
    }

    get addItems() {
        return (event) => {
            this.data.items.push({})
        };
    }
}