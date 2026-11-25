import { inject, Lazy } from 'aurelia-framework';
import { HttpClient } from 'aurelia-fetch-client';
import { RestService } from '../../../utils/rest-service';


const serviceUri = 'purchase-requests/by-user';
const allServiceUri = 'purchase-requests';

export class Service extends RestService {

    constructor(http, aggregator, config, endpoint) {
        super(http, aggregator, config, "purchasing-azure");
    }

    _getResource(byUser = true) {
        return byUser === false ? allServiceUri : serviceUri;
    }

    search(info, byUser = true) {
        var endpoint = `${this._getResource(byUser)}`;
        return super.list(endpoint, info);
    }

    getById(id, byUser = true) {
        var endpoint = `${this._getResource(byUser)}/${id}`;
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

    post(data) {
        var endpoint = `${allServiceUri}/post`;
        return super.post(endpoint, data);
    }

    getPdfById(id, byUser = true) {
        var endpoint = `${this._getResource(byUser)}/${id}`;
        return super.getPdf(endpoint);
    }

    unpost(id) {
        var endpoint = `${allServiceUri}/unpost/${id}`;
        return super.put(endpoint);
    }

    approve(id, level) {
        var endpoint = `${allServiceUri}/approve-${level}/${id}`;
        return super.post(endpoint, {});
    }

    reject(id, reason) {
        var endpoint = `${allServiceUri}/rejected/${id}`;
        return super.put(endpoint, { Reason: reason });
    }
} 
