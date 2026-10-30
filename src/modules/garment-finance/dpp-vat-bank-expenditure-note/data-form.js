import { inject, bindable, computedFrom } from 'aurelia-framework';
import { Service } from './service';
import { PurchasingService } from './purchasing-service';
import moment from 'moment';
import numeral from 'numeral';

const BankLoader = require('../shared/bank-account-loader');
const SupplierLoader = require('../shared/garment-supplier-loader');
// const CurrencyLoader = require('../shared/garment-currency-loader');
const CurrencyLoader = require('../../../loader/garment-currencies-by-latest-date-loader');

@inject(Service, PurchasingService)
export class DataForm {
    @bindable title;
    @bindable readOnly;

    formOptions = {
        cancelText: "Kembali",
        saveText: "Simpan",
        deleteText: "Hapus",
        editText: "Ubah",
    };

    controlOptions = {
        label: {
            length: 4,
        },
        control: {
            length: 4,
        },
    };

    typingAmount = null;
    typingOtherExpense = null;

    constructor(service, purchasingService) {
        this.service = service;
        this.purchasingService = purchasingService;
    }

    bind(context) {
        this.context = context;
        this.data = this.context.data;
        this.error = this.context.error;

        console.log(this);

        this.isNotEditable = this.context.isNotEditable;

        this.cancelCallback = this.context.cancelCallback;

        const originalSaveCallback = this.context.saveCallback;
        if (originalSaveCallback) {
            this.saveCallback = (event) => {
                if (this.typingAmount !== null && this.typingAmount !== undefined) {
                    this.data.Amount = this.typingAmount;
                }
                if (this.typingOtherExpense !== null && this.typingOtherExpense !== undefined) {
                    this.data.OtherExpense = this.typingOtherExpense;
                }
                originalSaveCallback(event);
            };
        } else {
            this.saveCallback = this.context.saveCallback;
        }

        if (!this.data.IsPosted) {
            this.deleteCallback = this.context.deleteCallback;
            this.editCallback = this.context.editCallback;
        }

        if (!this.readOnly) {
            this.collection = {
                columns: ['__check', 'No NI', 'Tanggal NI', 'Tanggal Jatuh Tempo', 'Supplier', 'PPN', 'PPh', 'Total Harga ((DPP + PPN) - PPh)', 'Mata Uang', 'Total Outstanding', '']
            };
        } else {
            this.collection = {
                columns: ['No NI', 'Tanggal NI', 'Tanggal Jatuh Tempo', 'Supplier', 'PPN', 'PPh', 'Total Harga ((DPP + PPN) - PPh)', 'Mata Uang', 'Total Outstanding', '']
            };
        }

        this.bankAccount = this.data.Bank || null;
        this.currency = this.data.Currency || null;
        this.supplier = this.data.Supplier || null;

        this.sameCurrency = true;
        this.bankCurrency = null;
        this.currencyCodeValue = null;

        this.collectionOptions = {
            readOnly: this.readOnly,
            calculateTotal: () => {
                this.calculateAmount();
            }
        };

        this.typingAmount = null;
        this.typingOtherExpense = null;
        this.data.Amount = this.data.Amount || 0;
        this.data.OtherExpense = this.data.OtherExpense || 0;
        this.lastOtherExpense = this.data.OtherExpense;
    }

    onCheckAll(event) {
        var isChecked = event.detail.target.checked;
        if (this.data && this.data.Items) {
            for (var item of this.data.Items) {
                item.Select = isChecked;
                if (item.InternalNote && item.InternalNote.Items) {
                    for (var itemInvoice of item.InternalNote.Items) {
                        itemInvoice.SelectInvoice = isChecked;
                    }
                }
                item.OutstandingAmount = isChecked ? 0 : ((item.InternalNote && item.InternalNote.TotalAmount) || 0);
            }
        }
        this.calculateAmount();
    }

    onTableChange(event) {
        this.calculateAmount();
    }

    onAmountInput(event) {
        if (event && event.target) {
            let val = event.target.value;
            if (!val || val.trim() === "") {
                this.typingAmount = 0;
            } else {
                let num = Number(val.replace(/,/g, ''));
                this.typingAmount = isNaN(num) ? 0 : num;
            }
        }
    }

    onAmountBlur(event) {
        if (this.typingAmount !== null && this.typingAmount !== undefined) {
            this.data.Amount = this.typingAmount;
        }
        this.typingAmount = null;
    }

    onOtherExpenseInput(event) {
        if (event && event.target) {
            let val = event.target.value;
            if (!val || val.trim() === "") {
                this.typingOtherExpense = 0;
            } else {
                let num = Number(val.replace(/,/g, ''));
                this.typingOtherExpense = isNaN(num) ? 0 : num;
            }
            this.syncAmountWithOtherExpense(this.typingOtherExpense);
        }
    }

    // Pembayaran Keluar = total NI + biaya lain-lain, jadi ikut berubah saat biaya lain-lain diubah
    syncAmountWithOtherExpense(newOther) {
        let previous = Number(this.lastOtherExpense) || 0;
        let current = Number(newOther) || 0;
        let delta = current - previous;
        if (delta !== 0) {
            this.data.Amount = (Number(this.data.Amount) || 0) + delta;
            this.typingAmount = null;
        }
        this.lastOtherExpense = current;
    }

    onOtherExpenseBlur(event) {
        if (this.typingOtherExpense !== null && this.typingOtherExpense !== undefined) {
            this.syncAmountWithOtherExpense(this.typingOtherExpense);
            this.data.OtherExpense = this.typingOtherExpense;
        }
        this.typingOtherExpense = null;
    }

    calculateAmount() {
        this.typingAmount = null;
        let totalAmount = 0;
        let hasSelection = false;

        if (this.data && this.data.Items && this.data.Items.length > 0) {
            for (let item of this.data.Items) {
                let niTotal = (item.InternalNote && item.InternalNote.TotalAmount) ? item.InternalNote.TotalAmount : 0;
                let invoices = (item.InternalNote && item.InternalNote.Items) || [];
                let hasInvoices = invoices.length > 0;

                if (item.Select) {
                    hasSelection = true;
                    if (hasInvoices) {
                        let allInvoicesSelected = invoices.every(inv => inv.SelectInvoice);
                        let anyInvoiceSelected = invoices.some(inv => inv.SelectInvoice);

                        if (allInvoicesSelected || !anyInvoiceSelected) {
                            totalAmount += niTotal;
                            item.OutstandingAmount = 0;
                        } else {
                            let dppTotal = item.InternalNote.DPP || invoices.reduce((acc, inv) => acc + ((inv.Invoice && inv.Invoice.Amount) ? inv.Invoice.Amount : 0), 0);
                            let selectedDpp = invoices.filter(inv => inv.SelectInvoice).reduce((acc, inv) => acc + ((inv.Invoice && inv.Invoice.Amount) ? inv.Invoice.Amount : 0), 0);
                            let paid = dppTotal > 0 ? Math.round((selectedDpp / dppTotal) * niTotal * 100) / 100 : selectedDpp;
                            totalAmount += paid;
                            item.OutstandingAmount = Math.max(0, Math.round((niTotal - paid) * 100) / 100);
                        }
                    } else {
                        totalAmount += niTotal;
                        item.OutstandingAmount = 0;
                    }
                } else if (hasInvoices && invoices.some(inv => inv.SelectInvoice)) {
                    hasSelection = true;
                    let dppTotal = item.InternalNote.DPP || invoices.reduce((acc, inv) => acc + ((inv.Invoice && inv.Invoice.Amount) ? inv.Invoice.Amount : 0), 0);
                    let selectedDpp = invoices.filter(inv => inv.SelectInvoice).reduce((acc, inv) => acc + ((inv.Invoice && inv.Invoice.Amount) ? inv.Invoice.Amount : 0), 0);
                    let paid = dppTotal > 0 ? Math.round((selectedDpp / dppTotal) * niTotal * 100) / 100 : selectedDpp;
                    totalAmount += paid;
                    item.OutstandingAmount = Math.max(0, Math.round((niTotal - paid) * 100) / 100);
                } else {
                    item.OutstandingAmount = niTotal;
                }
            }
        }

        let other = (this.typingOtherExpense !== null && this.typingOtherExpense !== undefined)
            ? this.typingOtherExpense
            : (Number(this.data && this.data.OtherExpense) || 0);
        this.lastOtherExpense = other;

        if (hasSelection) {
            this.data.Amount = totalAmount + other;
        } else if (!this.readOnly) {
            this.data.Amount = 0;
        }
    }

    get bankLoader() {
        return BankLoader;
    }

    get currencyLoader() {
        return CurrencyLoader;
    }

    get supplierLoader() {
        return SupplierLoader;
    }

    bankView = (bank) => {
        return bank.BankName + " " + bank.Currency.Code + " - " + bank.AccountNumber
    }

    @bindable bankAccount;
    bankAccountChanged(newValue, oldValue) {
      this.data.Bank = newValue;
      if (newValue) {
        this.bankCurrency = newValue.Currency.Code;
        if (this.bankCurrency == "IDR" && this.currencyCodeValue != "IDR" && this.currencyCodeValue != null && !this.readOnly) {
            this.sameCurrency = false;
        }
        else {
            this.sameCurrency = true;
        }
      }
    }

    @bindable currency;
    async currencyChanged(newValue, oldValue) {
        this.data.Currency = newValue;

        if (newValue) {
            this.currencyCodeValue = this.data.Currency.Code;
            if (this.supplier && !this.readOnly) {
                let newItems = await this.purchasingService.dppVATBankExpenditureNotes({ supplierId: this.supplier.Id, currencyCode: this.currency.Code })
                    .then((items) => {
                        return items.map((item) => {
                            item.Id = 0;
                            item.InternalNote.Items = item.InternalNote.Items.map((internalNoteItem) => {
                                internalNoteItem.Id = 0;
                                return internalNoteItem;
                            })

                            return item;
                        })
                    });

                if (newItems) {
                    this.data.Items = this.data.Items.map((item) => {
                        var newItem = newItems.find((element => element.InternalNote.Id == item.InternalNote.Id));

                        if (newItem) {
                            let existingIds = (item.InternalNote.Items || []).map(i => i.Invoice && i.Invoice.Id);
                            let additions = newItem.InternalNote.Items.filter(i => !existingIds.includes(i.Invoice && i.Invoice.Id));
                            item.InternalNote.Items = (item.InternalNote.Items || []).concat(additions);
                        }

                        return item;
                    })

                    let items = newItems.filter((element) => {
                        let exist = this.data.Items.find((item) => item.InternalNote.Id == element.InternalNote.Id);

                        return !exist
                    });
                    this.data.Items = this.data.Items.concat(items);
                }
            }
            if (this.bankCurrency == "IDR" && this.currencyCodeValue != "IDR" && this.currencyCodeValue != null && !this.readOnly) {
                this.sameCurrency = false;
            }
            else {
                this.sameCurrency = true;
            }
        } else {
            this.data.Items = [];
        }
    }

    @bindable supplier;
    async supplierChanged(newValue, oldValue) {
        this.data.Supplier = newValue;

        if (newValue) {
            if (this.currency && !this.readOnly) {
                let newItems = await this.purchasingService.dppVATBankExpenditureNotes({ supplierId: newValue.Id, currencyCode: this.currency.Code })
                    .then((items) => {
                        return items.map((item) => {
                            item.Id = 0;
                            item.InternalNote.Items = item.InternalNote.Items.map((internalNoteItem) => {
                                internalNoteItem.Id = 0;
                                return internalNoteItem;
                            })

                            return item;
                        })
                    });

                if (newItems) {
                    this.data.Items = this.data.Items.map((item) => {
                        var newItem = newItems.find((element => element.InternalNote.Id == item.InternalNote.Id));

                        if (newItem) {
                            let existingIds = (item.InternalNote.Items || []).map(i => i.Invoice && i.Invoice.Id);
                            let additions = newItem.InternalNote.Items.filter(i => !existingIds.includes(i.Invoice && i.Invoice.Id));
                            item.InternalNote.Items = (item.InternalNote.Items || []).concat(additions);
                        }

                        return item;
                    })

                    let items = newItems.filter((element) => {
                        let exist = this.data.Items.find((item) => item.InternalNote.Id == element.InternalNote.Id);

                        return !exist
                    });
                    this.data.Items = this.data.Items.concat(items);
                }

            }
        } else {
            this.data.Items = [];
        }
    }

    @computedFrom("data.Amount", "data.OtherExpense", "typingAmount", "typingOtherExpense")
    get totalPaid() {
        let amount = (this.typingAmount !== null && this.typingAmount !== undefined)
            ? this.typingAmount
            : (Number(this.data && this.data.Amount) || 0);

        // Pembayaran Keluar sudah termasuk biaya lain-lain
        return amount;
    }

    set totalPaid(val) {
        // no-op to allow bindings safely
    }

    @computedFrom("data.Amount", "data.OtherExpense", "typingAmount", "typingOtherExpense")
    get totalPaidFormatted() {
        return numeral(this.totalPaid || 0).format("0,000.0000");
    }

    @computedFrom("data.Currency.Code", "data.Bank.Currency.Code", "currencyCodeValue", "bankCurrency")
    get currencyCode() {
        return (this.data && this.data.Currency && this.data.Currency.Code)
            || (this.data && this.data.Bank && this.data.Bank.Currency && this.data.Bank.Currency.Code)
            || this.currencyCodeValue
            || "";
    }
}
