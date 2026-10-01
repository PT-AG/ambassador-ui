import { inject, BindingEngine } from 'aurelia-framework';

@inject(BindingEngine)
export class PLTemplate {
    constructor(bindingEngine) {
        this.bindingEngine = bindingEngine;
    }

    activate(context) {
        this.context = context;
        this.data = context.data;
        this.error = context.error;
        this.options = context.options;
        this.readOnly = this.options.readOnly;
        this.isCreate = context.context.options.isCreate;
        this.isEdit = context.context.options.isEdit;
        this.sizes = context.context.options.sizes;
        this.itemOptions = {
            error: this.error,
            isCreate: this.isCreate,
            readOnly: this.readOnly,
            isEdit: this.isEdit,
        };
        
        this.data.number = this.data.start ? this.data.start + " - " + this.data.end : "RO";

        this.disposeSubscriptions();
        this.subscriptions = ["cartons", "length", "width", "height"].map(prop =>
            this.bindingEngine
                .propertyObserver(this.data, prop)
                .subscribe((newValue, oldValue) => {
                    if (newValue == oldValue) return;
                    const options = context.context.options;
                    if (options && typeof options.reorderDetailRows === "function") {
                        options.reorderDetailRows();
                    }
                })
        );
    }

    detached() {
        this.disposeSubscriptions();
    }

    disposeSubscriptions() {
        (this.subscriptions || []).forEach(s => s.dispose());
        this.subscriptions = [];
    }
}