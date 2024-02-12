import {
  inject,
  bindable,
  containerless,
  computedFrom,
  BindingEngine,
} from "aurelia-framework";
import { Service } from "./service";

@inject(Service)
export class DataForm {
  @bindable readOnly = false;
  @bindable isEdit = false;
  @bindable title;

  constructor(service) {
    this.service = service;
  }

  controlOptions = {
    label: {
      length: 3,
    },
    control: {
      length: 5,
    },
  };

  bcTypeOptions = ["BC 24"];

  async bind(context) {
    this.context = context;
    this.data = context.data;
    this.error = context.error;

    this.options = {
      isCreate: this.context.isCreate,
      isEdit: this.context.isEdit,
      isView: this.context.isView,
    };
  }

  itemsInfo = {
    columns: [
      { header: "No Bon Aval Keluar" },
      { header: "Kode Barang" },
      { header: "Jumlah" },
      { header: "Satuan" },
      { header: "Harga" },
    ],
    onAdd: function () {
      this.context.ItemsCollection.bind();
      this.data.Items.push({});
    }.bind(this),
    onRemove: function () {
      return (event) => {
        this.error = null;
      };
    }.bind(this),
  };
}
