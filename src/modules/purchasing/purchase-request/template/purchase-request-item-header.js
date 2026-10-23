export class PurchaseRequestItemHeader {
    activate(context) {
        this.context = context;
        this.options = (context && context.options) || {};
    }

    toggleAll() {
        if (this.options) {
            this.options.isShowingAll = !this.options.isShowingAll;
            if (this.context && this.context.items) {
                for (let item of this.context.items) {
                    if (item.data) {
                        item.data.isShowing = this.options.isShowingAll;
                    }
                }
            }
        }
    }
}
