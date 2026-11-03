import {inject, Lazy} from 'aurelia-framework';
import {HttpClient} from 'aurelia-fetch-client';
import {RestService} from '../../../utils/rest-service'; 
import {MasterDataUsageService} from '../../../utils/master-data-usage-service';

const serviceUri = "master/garment-buyers";
 
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
      data.isUsed = await MasterDataUsageService.isUsed('sales', 'garment-buyer', id, data.Code);
    }
    return data;
  }

  create(data) {
    var endpoint = `${serviceUri}`;
    return super.post(endpoint, data);
  }

  update(data) {
    var endpoint = `${serviceUri}/${data.Id}`;
    return super.put(endpoint, data);
  }

  async delete(data) {
    var isUsed = await MasterDataUsageService.isUsed('sales', 'garment-buyer', data.Id, data.Code);
    if (isUsed) {
      alert("Data sudah digunakan di transaksi dan tidak dapat dihapus.");
      return Promise.reject("Data sudah digunakan di transaksi dan tidak dapat dihapus.");
    }
    var endpoint = `${serviceUri}/${data.Id}`;
    return super.delete(endpoint, data);
  }

  getByCode(code) {
    var endpoint = `${serviceUri}?keyword=${code}`;
    return super.get(endpoint);
  }

  post(data) {
    var endpoint = `${serviceUri}/posting`;
    return super.put(endpoint, data);
  } 

  nonActived(id) {
    var endpoint = `${serviceUri}/nonactived/${id}`;
    return super.put(endpoint);
  }
}
