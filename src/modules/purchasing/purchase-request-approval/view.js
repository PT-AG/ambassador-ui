import { inject } from 'aurelia-framework';
import { Router } from 'aurelia-router';
import moment from 'moment';
import { Service } from '../purchase-request/service';
import { Dialog } from '../../../au-components/dialog/dialog';
import { RejectReason } from '../approve-unit-payment-order-staff/dialog-template/reject-reason';
import { Base64Helper } from '../../../utils/base-64-coded-helper';

const APPROVAL_LABEL = {
    staff: "Staff",
    manager1: "Manager 1",
    manager2: "Manager 2"
};

function attachDisplayToString(target, parts) {
    if (!target) return;
    target.toString = function () {
        return parts
            .filter(item => item && item.toString().trim().length > 0)
            .join(" - ");
    };
}

@inject(Router, Service, Dialog)
export class View {
    hasCancel = true;
    hasEdit = false;
    hasDelete = false;
    hasUnpost = false;
    hasApprove = false;
    hasReject = false;
    title = "Detail Approval Purchase Request";
    type = "staff";
    prId = "";

    constructor(router, service, dialog) {
        this.router = router;
        this.service = service;
        this.dialog = dialog;
    }

    async activate(params, routeConfig, navigationInstruction) {
        moment.locale('id-ID');
        const instruction = navigationInstruction && navigationInstruction.getAllInstructions()[0];
        const parentInstruction = instruction && instruction.parentInstruction;
        const config = (parentInstruction && parentInstruction.config) || {};
        const settings = config.settings || {};

        this.title = config.title || "Detail Approval Purchase Request";
        this.type = settings.type || "staff";

        const id = Base64Helper.decode(params.id);
        this.prId = id;
        this.data = await this.service.getById(id, false);

        if (this.data) {
            if (this.data.unit) {
                const divisionName = this.data.unit.division ? this.data.unit.division.name : "";
                attachDisplayToString(this.data.unit, [divisionName, this.data.unit.name]);
            }
            if (this.data.budget) {
                attachDisplayToString(this.data.budget, [this.data.budget.code, this.data.budget.name]);
            }
            if (this.data.category) {
                attachDisplayToString(this.data.category, [this.data.category.code, this.data.category.name]);
            }
            (this.data.items || []).forEach(item => {
                if (item.product) {
                    attachDisplayToString(item.product, [item.product.code, item.product.name]);
                }
            });

            this.hasApprove = this._canApprove(this.data, this.type);
            this.hasReject = this.hasApprove && !this.data.isUsed;
        }
    }

    _canApprove(data, type) {
        if (!data || !data.isPosted || data.isRejected) return false;
        if (type === "staff") return !data.isApprovedStaff;
        if (type === "manager1") return data.isApprovedStaff && !data.isApprovedManager1;
        if (type === "manager2") return data.isApprovedStaff && data.isApprovedManager1 && !data.isApprovedManager2;
        return false;
    }

    cancel() {
        this.router.navigateToRoute('list');
    }

    approve() {
        const label = APPROVAL_LABEL[this.type] || this.type;
        if (!confirm(`Yakin ingin menyetujui Purchase Request ini (${label})?`)) return;

        this.service.approve(this.prId, this.type)
            .then(() => {
                alert(`Purchase Request berhasil di-approve ${label}.`);
                this.cancel();
            })
            .catch(err => {
                alert((err && err.message) || "Terjadi kesalahan saat approve.");
            });
    }

    reject() {
        this.dialog.show(RejectReason, { title: "Reject Purchase Request", message: "Silakan masukkan alasan reject:" })
            .then(response => {
                if (response.wasCancelled) return;

                const reason = (response.output || "").trim();
                if (!reason) {
                    alert("Alasan tidak boleh kosong.");
                    return;
                }

                this.service.reject(this.prId, reason)
                    .then(() => {
                        alert("Purchase Request berhasil ditolak.");
                        this.cancel();
                    })
                    .catch(err => {
                        alert((err && err.message) || "Terjadi kesalahan saat reject.");
                    });
            });
    }
}
