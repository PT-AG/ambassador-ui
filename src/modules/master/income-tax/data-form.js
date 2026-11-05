import { inject, bindable, containerless, computedFrom, BindingEngine } from 'aurelia-framework';

@containerless()
@inject(BindingEngine)
export class DataForm {
  @bindable title;
  @bindable readOnly = false;
  @bindable data = {};
  @bindable error = {};

  formOptions = {
    cancelText: "Kembali",
    saveText: "Simpan",
    deleteText: "Hapus",
    editText: "Ubah",
  };

  controlOptions = {
    label: {
      length: 4
    },
    control: {
      length: 8
    }
  };

  @computedFrom("data.Id")
  get isEdit() {
    return (this.data.Id || '').toString() != '';
  }

  constructor(bindingEngine) {
    this.bindingEngine = bindingEngine;
  }

  bind(context) {
    this.context = context;
    this.data = this.context.data;
    this.error = this.context.error;

    this.cancelCallback = this.context.cancelCallback;
    this.deleteCallback = this.context.deleteCallback;
    this.editCallback = this.context.editCallback;
    this.saveCallback = this.context.saveCallback;
  }
}
