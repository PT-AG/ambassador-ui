import { inject, Lazy } from 'aurelia-framework';
import { HttpClient } from 'aurelia-fetch-client';
import { RestService } from '../../../utils/rest-service';
import { Container } from 'aurelia-dependency-injection';
import { Config } from "aurelia-api";

const serviceUri = 'garment-disposition-purchase';
const serviceEPOUri = 'garment-external-purchase-orders';

export class Service extends RestService {

    constructor(http, aggregator, config, endpoint) {
        super(http, aggregator, config, "purchasing-azure");
    }

    search(info) {
        var endpoint = `${serviceUri}/all`;
        return super.list(endpoint, info);
    }

    getById(id) {
        var endpoint = `${serviceUri}/all/${id}`;
        return super.get(endpoint);
    }

    getPdfById(id) {
        var endpoint = `${serviceUri}/${id}`;
        return super.getPdf(endpoint);
    }

    approve(id) {
        var endpoint = `${serviceUri}/approve-kabag/${id}`;
        return super.post(endpoint, {});
    }
} 

const servicePurchSectionUri = 'master/purchasing-sections';
export class ServiceCore extends RestService {
    constructor(http, aggregator, config, endpoint) {
        super(http, aggregator, config, "core");
    }

    searchSection(info) {
        var endpoint = `${servicePurchSectionUri}`;
        return super.list(endpoint, info);
    }
}