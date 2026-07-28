import { inject, Lazy } from 'aurelia-framework';
import { Router } from 'aurelia-router';
import { Service } from './service';
//import { ServiceLocal } from './service-local';
import { Base64Helper } from '../../../utils/base-64-coded-helper';


@inject(Router, Service)
//@inject(Router, ServiceLocal)
export class View {
  hasCancel = true;
  hasEdit = true;
  hasDelete = true;
  constructor(router, service) {
    this.router = router;
    this.service = service;
  }

  async activate(params) {
    const decoded = Base64Helper.decode(params.id);
    var id = decoded;
    this.data = await this.service.getById(id);
    this.currency = this.data.currency;
    this.supplier = this.data.supplier;
  }

  cancel(event) {
    this.router.navigateToRoute('list');
  }
}
