import { inject, bindable, BindingEngine, computedFrom } from 'aurelia-framework';
const sizeLoader = require('../../../../loader/size-loader');

@inject(BindingEngine)
export class ROGarmentSizeBreakdownDetail {
    controlOptions = {
        control: {
            length: 12
        }
    };
    
    constructor(bindingEngine) {
        this.bindingEngine = bindingEngine;
    }

    get sizeLoader() {
        return sizeLoader;
    }

    sizeView = (size) => {
        return `${size.Name}`
    }

    @bindable selectedSize;
    selectedSizeChanged(newValue, oldValue) {
        if (newValue) { 
            this.data.Size = newValue.Size || newValue.Name;
            this.data.SizeId = newValue.Id || newValue.SizeId || 0;
        } else {
            this.data.Size = null;
            this.data.SizeId = 0;
        }
    }

    activate(context) {
        this.context = context;
        this.data = this.context.data;
        this.columns = this.context.context.columns;
        this.options = this.context.options;
        this.readOnly = this.options.readOnly;
        this.error = this.context.error;

        this.selectedSize = this.data.Size || this.data.SizeId
            ? {
                Id: this.data.SizeId || 0,
                Size: this.data.Size
            }
            : null;
    }
}