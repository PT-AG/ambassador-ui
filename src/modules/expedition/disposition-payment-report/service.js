import { inject, Lazy } from 'aurelia-framework';
import { RestService } from '../../../utils/rest-service';

const serviceUri = 'payment-disposition-note/report';

export class Service extends RestService {
    constructor(http, aggregator, config, endpoint) {
        super(http, aggregator, config, 'finance');
    }

    search(info) {
        let endpoint = `${serviceUri}`;
        return super.list(endpoint, info);
    }

    getXls(info) {
        let startDate = info.startDate && info.startDate !== 'undefined' ? encodeURIComponent(info.startDate) : '';
        let endDate = info.endDate && info.endDate !== 'undefined' ? encodeURIComponent(info.endDate) : '';
        let endpoint = `${serviceUri}/xls?bankExpenditureId=${info.bankExpenditureId || 0}&dispositionId=${info.dispositionId || 0}&supplierId=${info.supplierId || 0}&divisionId=${info.divisionId || 0}&startDate=${startDate}&endDate=${endDate}&bankId=${info.bankId || 0}`;
        return super.getXls(endpoint);
    }
}