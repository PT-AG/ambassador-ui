import { inject, Lazy } from "aurelia-framework";
import { Router } from "aurelia-router";
import { Service } from "./service";
import { Base64Helper } from "../../../utils/base-64-coded-helper";

@inject(Router, Service)
export class Edit {
  constructor(router, service) {
    this.router = router;
    this.service = service;
    this.data = {};
    this.error = {};
  }

  async activate(params) {
    const decoded = Base64Helper.decode(params.id);
    var id = decoded;

    this.data = await this.service.getById(id);
  }

  cancelCallback(event) {
    const encoded = Base64Helper.encode(this.data.Id);
    this.router.navigateToRoute("view", { id: encoded });
    //this.router.navigateToRoute('view', { id: this.data.Id });
  }

  saveCallback(event) {
    this.error = {};
    var hasError = false;

    if (!this.data.Name || this.data.Name.trim() === "") {
      this.error.Name = "Nama harus diisi";
      hasError = true;
    }

    if (this.data.Rate === undefined || this.data.Rate === null || this.data.Rate === "" || isNaN(this.data.Rate)) {
      this.error.Rate = "Rate harus diisi";
      hasError = true;
    } else if (Number(this.data.Rate) < 0) {
      this.error.Rate = "Rate tidak boleh lebih kecil dari 0";
      hasError = true;
    }

    if (!this.data.COACodeCredit || this.data.COACodeCredit.trim() === "") {
      this.error.COACodeCredit = "COA harus diisi";
      hasError = true;
    } else {
      var coaPattern = /^\d{4}\.\d{2}$/;
      if (!coaPattern.test(this.data.COACodeCredit.trim())) {
        this.error.COACodeCredit = "Format COA salah. Contoh: 1111.11 (4 digit.2 digit)";
        hasError = true;
      }
    }

    if (!this.data.Date) {
      this.error.Date = "Tanggal Berlaku harus diisi";
      hasError = true;
    }

    if (hasError) {
      return;
    }

    this.service
      .update(this.data)
      .then((result) => {
        const encoded = Base64Helper.encode(this.data.Id);
        this.router.navigateToRoute("view", { id: encoded });
      })
      .catch((e) => {
        this.error = e;
      });
  }
}
