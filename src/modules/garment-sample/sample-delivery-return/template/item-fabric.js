import {bindable, computedFrom} from 'aurelia-framework'

export class GarmentDeliveryReturnItemFabric {
    activate(context) {
        this.context = context;
        this.data = context.data;
        this.options = context.context.options;
        this.error = context.error;
        this.contextOptions = context.context.options;
        this.readOnly =this.context.readOnly;
console.log(this.readOnly)
        if (this.options.returnType === "RETUR") {
           // this.readOnly = true;
            this.options.isEdit=false;
        }

    }

    changeCheckBox() {
        this.context.context.options.checkedAll = this.context.context.items.reduce((acc, curr) => acc && curr.data.IsSave, true);
      }
}