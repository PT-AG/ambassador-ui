import { inject, Lazy } from 'aurelia-framework';
import { Router } from 'aurelia-router';
import { Service } from './service';
import { Base64Helper } from '../../../utils/base-64-coded-helper';


@inject(Router, Service)
export class View {
  constructor(router, service) {
    this.router = router;
    this.service = service;
  }
    hasCancel = true;
    hasEdit = true;
    hasDelete = true;
  async activate(params) {
    const decoded = Base64Helper.decode(params.id);
    var id = decoded;
    this.data = await this.service.getById(id);
    
    if(this.data.Currency){
        this.selectedCurrency=this.data.Currency;
    }

    if(this.data.Supplier){
        this.selectedSupplier=this.data.Supplier;
    }

    if(this.data.Division){
        this.selectedDivision=this.data.Division;
    }

    if(this.data.Category){
        this.selectedCategory=this.data.Category;
    }
    if(this.data.Position !=1){
      this.hasDelete=false;
    }
    if(this.data.Position !=1 && this.data.Position !=6){
      this.hasEdit=false;
    }
  }

  // cancelCallback(event) {
  //   this.router.navigateToRoute('list');
  // }

  // editCallback(event) {
  //   this.router.navigateToRoute('edit', { id: this.data.Id });
  // }

  // deleteCallback(event) {
  //   this.service.delete(this.data)
  //     .then(result => {
  //       this.cancelCallback();
  //     });
  // }

  cancel(event) {
        this.router.navigateToRoute('list');
    }

    edit(event) {
      const encoded = Base64Helper.encode(this.data.Id);
      this.router.navigateToRoute('edit', { id: encoded });
    }

    delete(event) {
        this.service.delete(this.data).then(result => {
            this.cancel();
        });
    }
}
