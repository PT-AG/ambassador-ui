export class Item {

    activate(context) {
        this.context = context;
        this.data = context.data;
        this.options = context.options;
        this.readOnly = context.options.readOnly;
        this.isShowing = false;

        if (!this.readOnly) {
            this.collection = {
                columns: ['', 'No. Invoice', 'Tanggal Invoice', 'Nama Barang', 'Kategori', 'Total']
            };
        } else {
            this.collection = {
                columns: ['No. Invoice', 'Tanggal Invoice', 'Nama Barang', 'Kategori', 'Total']
            };
        }

        if (!this.readOnly && this.data) {
            this.updateOutstanding();
        }
    }

    onCheckInternalNotes(e) {
        this.data.Select = e.target.checked;
        if (this.data.InternalNote && this.data.InternalNote.Items) {
            for (var item of this.data.InternalNote.Items) {
                item.SelectInvoice = e.target.checked;
            }
        }
        this.updateOutstanding();
        if (this.options && typeof this.options.calculateTotal === 'function') {
            this.options.calculateTotal();
        }
    }

    updateOutstanding() {
        if (this.readOnly || !this.data) return;

        var total = (this.data.InternalNote && this.data.InternalNote.TotalAmount) ? this.data.InternalNote.TotalAmount : 0;
        var invoices = (this.data.InternalNote && this.data.InternalNote.Items) || [];
        var hasInvoices = invoices.length > 0;

        if (this.data.Select) {
            if (hasInvoices) {
                var allChecked = invoices.every(i => i.SelectInvoice);
                var anyChecked = invoices.some(i => i.SelectInvoice);

                if (allChecked || !anyChecked) {
                    this.data.OutstandingAmount = 0;
                } else {
                    var dppTotal = this.data.InternalNote.DPP || invoices.reduce((acc, i) => acc + ((i.Invoice && i.Invoice.Amount) ? i.Invoice.Amount : 0), 0);
                    var selectedDpp = invoices.filter(i => i.SelectInvoice).reduce((acc, i) => acc + ((i.Invoice && i.Invoice.Amount) ? i.Invoice.Amount : 0), 0);
                    var paid = dppTotal > 0 ? Math.round((selectedDpp / dppTotal) * total * 100) / 100 : selectedDpp;
                    this.data.OutstandingAmount = Math.max(0, Math.round((total - paid) * 100) / 100);
                }
            } else {
                this.data.OutstandingAmount = 0;
            }
        } else {
            if (hasInvoices && invoices.some(i => i.SelectInvoice)) {
                var dppTotal = this.data.InternalNote.DPP || invoices.reduce((acc, i) => acc + ((i.Invoice && i.Invoice.Amount) ? i.Invoice.Amount : 0), 0);
                var selectedDpp = invoices.filter(i => i.SelectInvoice).reduce((acc, i) => acc + ((i.Invoice && i.Invoice.Amount) ? i.Invoice.Amount : 0), 0);
                var paid = dppTotal > 0 ? Math.round((selectedDpp / dppTotal) * total * 100) / 100 : selectedDpp;
                this.data.OutstandingAmount = Math.max(0, Math.round((total - paid) * 100) / 100);
            } else {
                this.data.OutstandingAmount = total;
            }
        }
    }

    get checkedInvoices() {
        if (this.data && this.data.InternalNote && this.data.InternalNote.Items) {
            var anyChecked = false;
            for (var item of this.data.InternalNote.Items) {
                if (item.SelectInvoice) {
                    anyChecked = true;
                    break;
                }
            }
            if (!this.readOnly) {
                this.data.Select = anyChecked;
            }
        }
        this.updateOutstanding();
        return 0;
    }

    get outstanding() {
        if (this.readOnly) {
            return (this.data && this.data.OutstandingAmount) || 0;
        }

        this.updateOutstanding();
        return (this.data && this.data.OutstandingAmount) || 0;
    }

    toggle() {
        this.isShowing = !this.isShowing;
    }
}
