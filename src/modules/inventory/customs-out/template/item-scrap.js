import { inject, bindable, computedFrom } from "aurelia-framework";
import { Service, GarmentService} from "../service";

@inject(Service,GarmentService)
export class Item {
  @bindable selectedAvalExpenditureNo;

  constructor(service,garmentService) {
    this.service = service;
    this.garmentService=garmentService;
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
        filter:{
            "Items.Any(ScrapClassificationName.Contains('FASILITAS'))":true
        }
      };
      return this.garmentService.getBonNo(info).then((result) => {
        var noList = [];
        console.log(result.data)
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
      this.data.AvalExpenditureId = 0;
      this.data.ScrapOutId=newValue.Id;

      let quantity = 0;
      let Uom = {};
      newValue.Items.forEach((element) => {
            this.data.ProductName = "FAS-AVAL";
            quantity += element.Quantity;
            Uom = element.Uom;
      });

      this.data.Quantity = quantity;
      this.data.Uom = Uom;
    }
  }
}
