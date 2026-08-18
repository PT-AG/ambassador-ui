export class PLTemplate {
    constructor() {
        
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
            isEdit:this.isEdit,
        };
        this.data.number=this.data.start?  this.data.start + " - " + this.data.end : "RO";
        console.log(this.data);
        console.log(this.options);
    }
}