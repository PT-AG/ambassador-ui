import {inject, Lazy} from 'aurelia-framework';
import {HttpClient} from 'aurelia-fetch-client';
import {RestService} from '../../../utils/rest-service';
import {MasterDataUsageService} from '../../../utils/master-data-usage-service';
 
const serviceUri = 'master/suppliers';

export class Service extends RestService {

  constructor(http, aggregator, config, api) {
    super(http, aggregator, config, "core");
  }

  search(info) {
    var endpoint = `${serviceUri}`;
    return super.list(endpoint, info);
  }

  async getById(id) {
    var endpoint = `${serviceUri}/${id}`;
    var data = await super.get(endpoint);
    if (data) {
      data.isUsed = await MasterDataUsageService.isUsed('purchasing-azure', 'supplier', id, data.code || data.Code);
    }
    return data;
  }

  create(data) {
    var endpoint = `${serviceUri}`;
    return super.post(endpoint, data);
  }

  update(data) {
    var endpoint = `${serviceUri}/${data._id}`;
    return super.put(endpoint, data);
  }

  async delete(data) {
    var id = data.Id || data._id;
    var code = data.code || data.Code;
    var isUsed = await MasterDataUsageService.isUsed('purchasing-azure', 'supplier', id, code);
    if (isUsed) {
      alert("Data sudah digunakan di transaksi dan tidak dapat dihapus.");
      return Promise.reject("Data sudah digunakan di transaksi dan tidak dapat dihapus.");
    }
    var endpoint = `${serviceUri}/${data._id}`;
    return super.delete(endpoint, data);
  }

  getByCode(code) {
    var endpoint = `${serviceUri}?keyword=${code}`;
    return super.get(endpoint);
  }

}
