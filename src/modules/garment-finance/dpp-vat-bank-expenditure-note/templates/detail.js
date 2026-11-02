export class Detail {

    activate(context) {
        this.context = context;
        this.data = context.data;
        this.options = context.options;
        this.readOnly = context.options.readOnly;
    }

    onCheckInvoice(e) {
        this.data.SelectInvoice = e.target.checked;
        if (this.context && this.context.parentContext && this.context.parentContext.data) {
            let parentData = this.context.parentContext.data;
            if (parentData.InternalNote && parentData.InternalNote.Items) {
                parentData.Select = parentData.InternalNote.Items.some(i => i.SelectInvoice);
            }
            if (this.context.parentContext.viewModel && typeof this.context.parentContext.viewModel.updateOutstanding === 'function') {
                this.context.parentContext.viewModel.updateOutstanding();
            }
        }
        if (this.options && typeof this.options.calculateTotal === 'function') {
            this.options.calculateTotal();
        }
    }
}
