import { inject, Lazy } from "aurelia-framework";
import { HttpClient } from "aurelia-fetch-client";
import { RestService } from "../../../utils/rest-service";
import { Container } from "aurelia-dependency-injection";
import { Config } from "aurelia-api";
import moment from "moment";

const serviceUri = "garment-unit-delivery-orders";
const doItemsUri = "garment-do-items";
const doItemsMoreUri = "garment-do-items/unit-delivery-order/more";
const garmentEPOServiceUri = "garment-external-purchase-orders/unit-do/by-ro";
const garmentURNforUnitDO = "garment-unit-receipt-notes/unit-delivery-order";
const garmentUEN = "garment-unit-expenditure-notes";

class BaseService extends RestService {
  list(endpoint, info, header) {
    var _info = Object.assign({}, info);

    if (_info.order && typeof _info.order === "object")
      _info.order = JSON.stringify(_info.order);
    else
      delete _info.order;

    var promise = this.endpoint.find(endpoint, _info);
    this.publish(promise);
    return promise
      .catch((e) => {
        this.publish(promise);
        return Promise.reject(e);
      })
      .then((result) => {
        this.publish(promise);
        return Promise.resolve(result);
      });
  }

  get(endpoint, header, info) {
    var promise = this.endpoint.find(endpoint, info);
    this.publish(promise);
    return promise
      .catch((e) => {
        this.publish(promise);
        return Promise.reject(e);
      })
      .then((result) => {
        this.publish(promise);
        return this.parseResult(result);
      });
  }
}

export class Service extends BaseService {
  constructor(http, aggregator, config, endpoint) {
    super(http, aggregator, config, "purchasing-azure");
  }

  search(info) {
    var endpoint = `${serviceUri}/by-user`;
    // var endpoint = `${serviceUri}`;
    return super.list(endpoint, info);
  }

  searchAllUnitDO(info) {
    var endpoint = `${serviceUri}`;
    return super.list(endpoint, info);
  }

  getTotalQtyDO(info) {
    var endpoint = `${serviceUri}/total-qty-do`;
    return super.list(endpoint, info);
  }

  searchDOItems(info) {
    var endpoint = `${doItemsUri}/unit-delivery-order`;
    return super.list(endpoint, info);
  }

  searchMoreDOItems(info) {
    var endpoint = `${doItemsMoreUri}`;
    return super.list(endpoint, info);
  }

  searchDOItemById(id) {
    var endpoint = `${doItemsUri}/${id}`;
    return super.get(endpoint);
  }

  getById(id) {
    var endpoint = `${serviceUri}/${id}`;
    return super.get(endpoint);
  }

  create(data) {
    var endpoint = `${serviceUri}`;
    return super.post(endpoint, data);
  }

  update(data) {
    var endpoint = `${serviceUri}/${data._id}`;
    return super.put(endpoint, data);
  }

  delete(data) {
    var endpoint = `${serviceUri}/${data._id}`;
    return super.delete(endpoint, data);
  }

  getPdfById(id) {
    var endpoint = `${serviceUri}/${id}`;
    return super.getPdf(endpoint);
  }

  searchUnitReceiptNote(info) {
    var endpoint = `${unitReceiptNoteUri}`;
    return super.list(endpoint, info);
  }

  getGarmentEPOByRONo(info) {
    var endpoint = `${garmentEPOServiceUri}`;
    return super.list(endpoint, info);
  }

  getgarmentURNforUnitDO(info) {
    var endpoint = `${garmentURNforUnitDO}`;
    return super.list(endpoint, info);
  }

  getGarmentUEN(info) {
    var endpoint = `${garmentUEN}`;
    return super.list(endpoint, info);
  }
}

const UnitServiceUri = "master/units";
export class CoreService extends BaseService {
  constructor(http, aggregator, config, endpoint) {
    super(http, aggregator, config, "core");
  }

  getSampleUnit(info) {
    var endpoint = `${UnitServiceUri}`;
    return super.list(endpoint, info);
  }
}

const serviceUriCC = "cost-calculation-garments";
export class SalesService extends BaseService {
  constructor(http, aggregator, config, endpoint) {
    super(http, aggregator, config, "sales");
  }

  searchCCByRO(info) {
    var endpoint = `${serviceUriCC}`;
    return super.list(endpoint, info);
  }

  searchCCByRONo(ro) {
    var endpoint = `${serviceUriCC}/by-ro/${ro}`;
    return super.get(endpoint);
  }

  getMaterialsByROAndPOSerial(info) {
    var endpoint = `${serviceUriCC}/materials/by-ro-poserial`;
    return super.list(endpoint, info);
  }

  searchCCById(id) {
    var endpoint = `${serviceUriCC}/${id}`;
    return super.get(endpoint);
  }
}
