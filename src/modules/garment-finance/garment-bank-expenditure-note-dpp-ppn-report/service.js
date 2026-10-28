import { inject, Lazy } from "aurelia-framework";
import { RestService } from "../../../utils/rest-service";

const serviceUri = "dpp-vat-bank-expenditure-notes";

export class Service extends RestService {
  constructor(http, aggregator, config, endpoint) {
    super(http, aggregator, config, "finance");
  }

  search(info) {
    let endpoint = `${serviceUri}/report`;
    return super.list(endpoint, info);
  }

  generateXls(info) {
    let endpoint = `${serviceUri}/report/download/xls?expenditureId=${info.expenditureId || 0}&internalNoteId=${info.internalNoteId || 0}&invoiceId=${info.invoiceId || 0}&supplierId=${info.supplierId || 0}&bankId=${info.bankId || 0}&startDate=${info.startDate}&endDate=${info.endDate}`;
    return super.getXls(endpoint, info);
  }
}
