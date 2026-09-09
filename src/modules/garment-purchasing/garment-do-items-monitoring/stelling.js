import { inject, bindable, computedFrom } from 'aurelia-framework';
import {
  Router
} from 'aurelia-router';
import {
  Service
} from './service';


@inject(Router, Service)
export class Stelling {
  hasCancel = true;
  hasSave = true;
  hasView = false;
  hasCreate = true;
  hasEdit = false;

  Id = {};

  constructor(router, service) {
    this.service = service;
    this.router = router;

    this.formOptions = {
      cancelText: "Kembali",
      saveText: "Simpan",
    };
  }

  bind() {
    this.error = {};
    this.checkedAll = true;
  }

  async activate(params) {
    var id = params.id;
    this.Id = id;
    this.savedFilters = params.filter;
    this.data = await this.service.getStelling(id);
    this.uom=this.data[0].Uom;
    this.receipt = this.data.slice(0, 1);

  }

  getPdf(arg) {
    this.service.getPdfById(arg)
      .then((result) => {

      })
      .catch(e => {
        this.error = e;
        this.data = this.service.getStelling(arg);

      })
  }

  cancel(event) {
    this.router.navigateToRoute('list', { filter: this.savedFilters });
  }

}