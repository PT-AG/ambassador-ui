import { inject, bindable, computedFrom } from "aurelia-framework";
import { Service } from "../service";

@inject(Service)
export class Item {
  @bindable selectedAvalExpenditureNo;

  constructor(service) {
    this.service = service;
  }

  activate(context) {
    this.context = context;
    this.data = context.data;
    this.error = context.error;
    this.options = context.context.options;
    this.readOnly = context.options.readOnly;
    this.isCreate = context.context.options.isCreate;
    this.isEdit = context.context.options.isEdit;

    if (this.data.AvalExpenditureNo || this.data.AvalExpenditureNo) {
      this.selectedAvalExpenditureNo = {
        AvalExpenditureNo: this.data.AvalExpenditureNo,
      };
    }
  }

  removeItems = function () {
    this.bind();
  };

  get bonNoLoader() {
    return (keyword) => {
      var info = {
        keyword: keyword,
        filter: JSON.stringify({
          IsBC: false,
        }),
      };
      return this.service.getBonNo(info).then((result) => {
        var noList = [];
        for (var a of result.data) {
          if (noList.length == 0) {
            var same = this.context.context.items.find(
              (x) => x.data.AvalExpenditureNo == a.AvalExpenditureNo
            );
            if (!same) {
              noList.push(a);
            }
          } else {
            var same = this.context.context.items.find(
              (x) => x.data.AvalExpenditureNo == a.AvalExpenditureNo
            );
            var dup = noList.find(
              (d) => d.AvalExpenditureNo == a.AvalExpenditureNo
            );
            if (!dup && !same) {
              noList.push(a);
            }
          }
        }
        return noList;
      });
    };
  }

  uomView = (data) => {
    return `${data.Unit || data.unit || ""}`;
  };

  selectedAvalExpenditureNoChanged(newValue) {
    if (newValue) {
      this.data.AvalExpenditureNo = newValue.AvalExpenditureNo;
      this.data.AvalExpenditureId = newValue.Id;

      let quantity = 0;
      let Uom = {};
      newValue.Items.forEach((element) => {
        switch (newValue.AvalType) {
          case "AVAL BAHAN PENOLONG":
            this.data.ProductName = "AV004";
            quantity += element.Quantity;
            Uom = element.Uom;
            break;

          case "AVAL KOMPONEN":
            this.data.ProductName = "AV002";
            quantity += element.ActualQuantity;
            Uom.Unit = "KG";
            Uom.Id = 0;
            break;

          default:
            this.data.ProductName = "AV001";
            quantity += element.ActualQuantity;
            Uom.Unit = "KG";
            Uom.Id = 0;
            break;
        }
      });

      this.data.Quantity = quantity;
      this.data.Uom = Uom;
    }
  }
}
