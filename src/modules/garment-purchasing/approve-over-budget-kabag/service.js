import { inject, Lazy } from 'aurelia-framework';
import { HttpClient } from 'aurelia-fetch-client';
import { RestService } from '../../../utils/rest-service';

const serviceUri = 'garment-external-purchase-orders/over-budget/for-kabag-approval';
const approveUri = 'garment-external-purchase-orders/approve-over-budget-kabag';
const byIdUri = 'garment-external-purchase-orders';

export class Service extends RestService {

    constructor(http, aggregator, config, endpoint) {
        super(http, aggregator, config, "purchasing-azure");
    }

    search(info) {
        var endpoint = `${serviceUri}`;
        return super.list(endpoint, info);
    }
    
    getById(id) {
        var endpoint = `${byIdUri}/${id}`;
        return super.get(endpoint);
    }

    approve(id) {
        var endpoint = `${approveUri}/${id}`;
        return super.post(endpoint, null);
    }
}
