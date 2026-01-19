import { RestService } from '../../../utils/rest-service';

const serviceUri = 'garment-shipping/export-sales-dos';
const serviceUriCoverLetter = 'garment-shipping/cover-letters';
const serviceUriPackingList = 'garment-shipping/packing-lists';

class Service extends RestService {
    constructor(http, aggregator, config, endpoint) {
        super(http, aggregator, config, "packing-inventory");
    }

    search(info) {
        var endpoint = `${serviceUri}`;
        return super.list(endpoint, info);
    }

    getById(id) {
        var endpoint = `${serviceUri}/${id}`;
        return super.get(endpoint);
    }

    getPackingListById(id) {
        var endpoint = `${serviceUriPackingList}/${id}`;
        return super.get(endpoint);
    }

    getCoverLetterByInvoice(info) {
        var endpoint = `${serviceUriCoverLetter}`;
        return super.list(endpoint, info);
    }

    create(data) {
        var endpoint = `${serviceUri}`;
        return super.post(endpoint, data);
    }

    update(data) {
        var endpoint = `${serviceUri}/${data.id}`;
        return super.put(endpoint, data);
    }

    delete(data) {
        var endpoint = `${serviceUri}/${data.id}`;
        return super.delete(endpoint, data);
    }
    
    getPdfById(id) {
        var endpoint = `${serviceUri}/pdf/${id}`;
        return super.getPdf(endpoint);
    }
}

const costCalculationServiceUri = 'cost-calculation-garments';
class SalesService extends RestService {
    constructor(http, aggregator, config, api) {
        super(http, aggregator, config, "sales");
    }

    getCostCalculationById(id) {
        var endpoint = `${costCalculationServiceUri}/${id}`;
        return super.get(endpoint);
    }
}


export { Service, SalesService}