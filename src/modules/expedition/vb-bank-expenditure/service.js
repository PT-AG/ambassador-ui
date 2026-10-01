import { RestService } from "../../../utils/rest-service";

const serviceUri = "vb-bank-expenditures";
const vbRealizationDocumentsUri = "vb-realization-expeditions";

export class Service extends RestService {
  constructor(http, aggregator, config, endpoint) {
    super(http, aggregator, config, "finance");
  }

  searchRealization(info) {
    let endpoint = `${serviceUri}/realization`;
    return super.list(endpoint, info);
  }

  create(data) {
    let endpoint = `${serviceUri}`;
    return super.post(endpoint, data);
  }

  delete(data) {
    let endpoint = `${serviceUri}/${data.Id}`;
    return super.delete(endpoint, data);
  }

  getById(id) {
      let endpoint = `${serviceUri}/${id}`;
      return super.get(endpoint);
  }

  search(info) {
    let endpoint = `${serviceUri}`;
    return super.list(endpoint, info);
  }

  post(data) {
    var endpoint = `${serviceUri}/post`;
    return super.put(endpoint, data);
  }

  getVbRealizationById(id) {
    let endpoint = `vb-realization-documents/${id}`;
    return super
      .get(endpoint)
      .then((data) => data)
      .catch(() => null);
  }

  getPdfById(id) {
      let endpoint = `${serviceUri}/pdf/${id}`;
      return super.getPdf(endpoint);
  }
}