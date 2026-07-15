import { inject, Lazy } from 'aurelia-framework';
import { Router } from 'aurelia-router';
import { Service } from './service';
import { Base64Helper } from '../../../utils/base-64-coded-helper';


@inject(Router, Service)
export class View {
  hasCancel = true;
  hasEdit = true;
  hasDelete = true;

  constructor(router, service) {
    this.router = router;
    this.service = service;
  }

  async activate(params) {
    this.isCustomCategory = true;
    this.hasView = true;
    var locale = 'id-ID';
    this.readOnlyBCDL = true;
    var moment = require('moment');
    moment.locale(locale);
    const decoded = Base64Helper.decode(params.id);
    var id = decoded;
    this.data = await this.service.getById(id);

    // has been created of unit receipt note ?
    var isCreated = {};
    var unitReceiptNotesDeliveryOrderNo = []; // get DeliveryOrderNo

    for (var data of this.data.items) {
      unitReceiptNotesDeliveryOrderNo.push(data.deliveryOrder.Id);
    }
    isCreated = await this.service.isCreatedOfUnitReceiptNotes(unitReceiptNotesDeliveryOrderNo); // search

    let poMasterDistributionRequestFilter = {};
    poMasterDistributionRequestFilter[unitReceiptNotesDeliveryOrderNo.map(id => `DOId==${id}`).join(" || ")] = true;
    const poMasterDistributionRequest = await this.service.searchPOMasterDistributions({
      filter: JSON.stringify(poMasterDistributionRequestFilter),
      // select: JSON.stringify({ Id: 1, DOId: 1 }),
      size: 0
    });

    // if (isCreated > 0) {
    //   this.hasEdit = false;
    //   this.hasDelete = false;
    // }

    this.data.deliveryOrders = this.data.items;


    for (var a of this.data.items) {
      a["selected"] = true;
      a["isView"] = false;
      a["doNo"] = a.deliveryOrder.doNo;
      a["doDate"] = a.deliveryOrder.doDate;
      a["arrivalDate"] = a.deliveryOrder.arrivalDate;
      a["quantity"] = a.quantity;
      a["price"] = a.deliveryOrder.totalAmount;

      var isReceipt;

      for (var item of a.deliveryOrder.items) {
        for (var detail of item.fulfillments) {
          if (detail.receiptQuantity > 0) {
            isReceipt = true;
            break;
          }
        }
      }
      if (a.deliveryOrder.isInvoice === true || isReceipt === true) {
        this.hasEdit = false;
        this.hasDelete = false;
      }

      if (poMasterDistributionRequest && poMasterDistributionRequest.statusCode == 200 && poMasterDistributionRequest.info.total > 0) {
        this.hasDelete = false;
      }

    }
  
    if(this.data.customCategory == true){
      this.selectedCustomCategory == "Fasilitas";
    }else{
      this.selectedCustomCategory == "Non Fasilitas";
    }

    
    this.data.beacukaiDate = moment(this.data.beacukaiDate).format("YYYY-MM-DD");
    this.data.validationDate = moment(this.data.validationDate).format("YYYY-MM-DD");
    this.data.arrivalDate = moment(this.data.arrivalDate).format("YYYY-MM-DD");
  }

  cancel(event) {
    this.router.navigateToRoute('list');
  }

  edit(event) {
    const encoded = Base64Helper.encode(this.data._id);
    this.router.navigateToRoute('edit', { id: encoded });
  }

  delete(event) {
    this.service.delete(this.data)
      .then(result => {
        this.cancel();
      });
  }
}
