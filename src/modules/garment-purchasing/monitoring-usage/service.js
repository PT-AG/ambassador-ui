import { inject, Lazy } from 'aurelia-framework';
import { HttpClient } from 'aurelia-fetch-client';
import { RestService } from '../../../utils/rest-service';


const serviceUri = 'garment-do-items/monitoring/usage';
export class Service extends RestService {

    constructor(http, aggregator, config, endpoint) {
        super(http, aggregator, config, "purchasing-azure");
    }

    search(args) {
        var endpoint = `${serviceUri}`;
        return super.list(endpoint, args);
    }
}
