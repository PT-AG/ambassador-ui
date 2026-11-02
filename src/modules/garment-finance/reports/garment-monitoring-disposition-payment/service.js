import { inject, Lazy } from "aurelia-framework";
import { RestService } from "../../../../utils/rest-service";

const serviceUri = "garment-invoice-purchasing-disposition";

export class Service extends RestService {
	constructor(http, aggregator, config, endpoint) {
		super(http, aggregator, config, "finance");
	}

	search(info) {
		let endpoint = `${serviceUri}/monitoring`;
		return super.list(endpoint, info);
	}

	getXls(info) {
		let endpoint = `${serviceUri}/download?invoiceNo=${info.invoiceNo || ""}&dispositionNo=${info.dispositionNo || ""}&startDate=${info.startDate || ""}&endDate=${info.endDate || ""}&bankId=${info.bankId || 0}`;
		return super.getXls(endpoint);
	}
}
