import { inject, Lazy } from 'aurelia-framework';
import { HttpClient } from 'aurelia-fetch-client';
import { Container } from 'aurelia-dependency-injection';
import { Config } from "aurelia-api";
import { RestService } from '../../../utils/rest-service';

const serviceUri = 'external-purchase-orders';

export class Service extends RestService {

    constructor(http, aggregator, config, endpoint) {
        super(http, aggregator, config, "purchasing-azure");
    }

    search(info) {
        return super.list(serviceUri, info);
    }

    getById(id) {
        return super.get(`${serviceUri}/${id}`);
    }

    approveKabag(id) {
        return super.post(`${serviceUri}/approve-kabag/${id}`, {});
    }

}
