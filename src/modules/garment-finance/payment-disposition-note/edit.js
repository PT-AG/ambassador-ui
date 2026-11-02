import { inject, Lazy, bindable, computedFrom } from 'aurelia-framework';
import { Router } from 'aurelia-router';
import { Dialog } from '../../../components/dialog/dialog'
import { Base64Helper } from '../../../utils/base-64-coded-helper';

import Service from './service';


@inject(Router, Service, Dialog)
export class Edit {

    controlOptions = {
        label: {
            length: 4,
        },
        control: {
            length: 4,
        },
    };

    formOptions = {
        cancelText: 'Kembali',
        saveText: 'Simpan',
    };

    @bindable totalPaymentTrigger = 0;
    typingOtherExpense = null;

    constructor(router, service, dialog) {
        this.router = router;
        this.service = service;
        this.dialog = dialog;

        this.collection = {
            columns: ['__check', 'No. Disposisi', 'Tanggal Disposisi', 'Tanggal Jatuh Tempo', 'Nomor Proforma/Invoice', 'Supplier', 'Kategori', 'PPN', 'Total Pembayaran', 'Total Yang sudah dibayar', 'Total Yang dibayar', 'Selisih Total Yang Dibayar', 'Mata Uang'],
        };
    }

    bind() {
        this.error = {};
    }

    Items = [];
    async activate(params) {
        const decoded = Base64Helper.decode(params.id);
        var id = decoded;
        this.data = await this.service.getById(id);

        this.Items = this.data.Items.map((item) => {
            item.Select = true;
            return item;
        });
        for(var a of this.data.Items){
            a.SupplierName=this.data.Supplier ? this.data.Supplier.Name : a.SupplierName;
            a.Currency=this.data.AccountBank && this.data.AccountBank.Currency ? this.data.AccountBank.Currency.Code : a.CurrencyCode;
            let totalPaid = Number(a.TotalPaid) || 0;
            let totalPaidPayment = Number(a.TotalPaidPayment) || 0;
            let totalPaidPaymentBefore = Number(a.TotalPaidPaymentBefore) || 0;
            a.TotalPaidPaymentAccumulated = parseFloat((totalPaidPaymentBefore + totalPaidPayment).toFixed(4));
            a.DiffTotalPaidPayment = Math.max(0, parseFloat((totalPaid - a.TotalPaidPaymentAccumulated).toFixed(4)));
            let parts = totalPaidPayment.toFixed(2).split('.');
            a.displayTotalPaidPayment = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',') + '.' + parts[1];
        }

        this.collectionOptions={
            IDR: this.isIDR,
            rate: this.data.CurrencyRate,
            SameCurrency: this.sameCurrency,
            onPaymentChange: () => {
                this.totalPaymentTrigger++;
            }
        };
    }

    cancelCallback(event) {
            const encoded = Base64Helper.encode(this.data.Id);
            this.router.navigateToRoute('view', { id: encoded });
    }

    saveCallback(event) {
      if (this.typingOtherExpense !== null && this.typingOtherExpense !== undefined) {
          this.data.OtherExpense = this.typingOtherExpense;
      }
      for (let item of this.Items) {
          if (item.typingPayment !== undefined && item.typingPayment !== null) {
              item.TotalPaidPayment = item.typingPayment;
              item.typingPayment = null;
          }
      }
      this.data.Items = this.Items.filter((item) => item.Select);
      var hasOverpaid = this.data.Items.some(item => (Number(item.TotalPaidPaymentAccumulated) || 0) > (Number(item.TotalPaid) || 0));
      if (hasOverpaid) {
          alert("Total yang dibayar tidak boleh melebihi Total Pembayaran");
          return;
      }
      var dataPrep = this.data;
      console.log(this.data);

      this.dialog.prompt("Apakah anda yakin akan menyimpan data?", "Simpan Data")
          .then(response => {
              if (response == "ok") {
                this.service.update(dataPrep).then(result => {
                  this.cancelCallback();
              })
              .catch(e => {
                  this.error = e;
                });
              }
          });
    }

    get isIDR() {
        return this.data && this.data.AccountBank && this.data.AccountBank.Currency && this.data.AccountBank.Currency.Code === "IDR";
    }

    onOtherExpenseInput(e) {
        let val = e && e.target ? e.target.value : '';
        let num = parseFloat(String(val).replace(/,/g, ''));
        this.typingOtherExpense = isNaN(num) ? 0 : num;
        this.totalPaymentTrigger++;
    }

    onOtherExpenseBlur(e) {
        if (this.typingOtherExpense !== null && this.typingOtherExpense !== undefined) {
            this.data.OtherExpense = this.typingOtherExpense;
        }
        this.typingOtherExpense = null;
        this.totalPaymentTrigger++;
    }

    onTableInput(e) {
        this.totalPaymentTrigger++;
    }

    onTableChange(e) {
        this.totalPaymentTrigger++;
    }

    @computedFrom('totalPaymentTrigger', 'data.OtherExpense', 'typingOtherExpense', 'data.CurrencyRate', 'data.CurrencyCode', 'data.AccountBank')
    get grandTotal() {
      const _ = this.totalPaymentTrigger;
      let result = 0;
      let viewResult = 0;
      let rate = (this.data && (this.data.CurrencyCode === "IDR" || !this.data.CurrencyRate)) ? 1 : (this.data && Number(this.data.CurrencyRate) || 1);
      if (this.Items && this.Items.length > 0) {
          for (let detail of this.Items) {
              if (detail.Select) {
                  let payment = detail.typingPayment !== undefined && detail.typingPayment !== null
                      ? detail.typingPayment
                      : (Number(detail.TotalPaidPayment) || 0);
                  result += payment;
                  viewResult += (payment * rate);
              }
          }
      }
      let otherExpense = this.typingOtherExpense !== null && this.typingOtherExpense !== undefined ? this.typingOtherExpense : (this.data ? (Number(this.data.OtherExpense) || 0) : 0);
      result += otherExpense;
      viewResult += (otherExpense * rate);
      this.data.Amount = result;
      if (this.isIDR)
          return viewResult;
      else
          return result;
  }

    onCheckAll(event) {
        var isChecked = event.detail.target.checked;
        for (var item of this.Items) {
            item.Select = isChecked;
            var totalPaid = Number(item.TotalPaid) || 0;
            var before = Number(item.TotalPaidPaymentBefore) || 0;
            var remaining = Math.max(0, parseFloat((totalPaid - before).toFixed(4)));

            if (isChecked) {
                if ((Number(item.TotalPaidPayment) || 0) === 0) {
                    item.TotalPaidPayment = remaining;
                    var parts = remaining.toFixed(2).split('.');
                    item.displayTotalPaidPayment = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',') + '.' + parts[1];
                    item.TotalPaidPaymentAccumulated = parseFloat((before + remaining).toFixed(4));
                    item.DiffTotalPaidPayment = 0;
                }
            } else {
                item.TotalPaidPayment = 0;
                item.displayTotalPaidPayment = "0.00";
                item.TotalPaidPaymentAccumulated = before;
                item.DiffTotalPaidPayment = remaining;
            }
        }
        this.totalPaymentTrigger++;
    }
}
