import { inject, Lazy } from "aurelia-framework";
import { Router } from "aurelia-router";
import { Service } from "./service";
import { Dialog } from "../../../au-components/dialog/dialog";
import { Base64Helper } from '../../../utils/base-64-coded-helper';

@inject(Router, Service, Dialog)
export class View {
  hasCancel = true;
  hasEdit = true;
  hasDelete = true;
  isShowing = false;
  isShowingAmount = true;

  constructor(router, service, dialog) {
    this.router = router;
    this.service = service;
    this.dialog = dialog;
  }

  async activate(params) {
    const decoded = Base64Helper.decode(params.id);
    let id = decoded;
    this.data = await this.service.getById(id);

    if (this.data.Position > 1 && this.data.Position < 6) {
      this.hasEdit = false;
      this.hasDelete = false;
    }
  }

  cancel(event) {
    this.router.navigateToRoute("list");
  }

  edit(event) {
    const encoded = Base64Helper.encode(this.data.Id);
    this.router.navigateToRoute('edit', { id: encoded });
  }

  delete(event) {
    // this.service.delete(this.data).then(result => {
    //     this.cancel();
    // });
    this.dialog
      .prompt(
        "Apakah anda yakin akan menghapus data ini?",
        "Hapus Data Realisasi VB Non PO"
      )
      .then((response) => {
        if (response.ok) {
          this.service.delete(this.data).then((result) => {
            this.cancel();
          });
        }
      });
  }
}
