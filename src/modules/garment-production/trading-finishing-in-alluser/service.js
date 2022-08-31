import { RestService } from '../../../utils/rest-service';

const serviceUri = 'finishing-ins';
const tradingFinishingInServiceUri = 'trading-finishing-ins';
const costCalculationServiceUri = 'cost-calculation-garments';
const DOServiceUri = 'garment-delivery-orders';
const URNServiceUri = 'garment-unit-receipt-notes';
const comodityPriceserviceUri = 'comodity-prices';
const UnitServiceUri = "master/units";

class Service extends RestService {
    constructor(http, aggregator, config, endpoint) {
        super(http, aggregator, config, "garment-production");
    }

    search(info) {
        var endpoint = `${serviceUri}`;
        return super.list(endpoint, info);
    }

    create(data) {
        var endpoint = `${tradingFinishingInServiceUri}`;
        return super.post(endpoint, data);
    }

    read(id) {
        var endpoint = `${serviceUri}/${id}`;
        return super.get(endpoint);
    }

    delete(data) {
        var endpoint = `${tradingFinishingInServiceUri}/${data.Id}`;
        return super.delete(endpoint, data);
    }

    getComodityPrice(info) {
        var endpoint = `${comodityPriceserviceUri}`;
        return super.list(endpoint, info);
    }
}

class PurchasingService extends RestService {
    constructor(http, aggregator, config, api) {
        super(http, aggregator, config, "purchasing-azure");
    }

    getGarmentDOById(id) {
        var endpoint = `${DOServiceUri}/${id}`;
        return super.get(endpoint);
    }

    getGarmentURN(info) {
        var endpoint = `${URNServiceUri}`;
        return super.list(endpoint, info);
    }
}

class SalesService extends RestService {
    constructor(http, aggregator, config, api) {
        super(http, aggregator, config, "sales");
    }

    getCostCalculation(info) {
        var endpoint = `${costCalculationServiceUri}`;
        return super.list(endpoint, info);
    }
}

class CoreService extends RestService {
    constructor(http, aggregator, config, endpoint) {
        super(http, aggregator, config, "core");
    }

    getTradingUnit(info) {
        var endpoint = `${UnitServiceUri}`;
        return super.list(endpoint, info);
    }

}

export { Service, PurchasingService, SalesService, CoreService }