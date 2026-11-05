import { RestService } from '../../../utils/rest-service';

const serviceUri = 'garment-do-items';

class Service extends RestService {
    constructor(http, aggregator, config, endpoint) {
        super(http, aggregator, config, "purchasing-azure");
    }

    search(info) {
        var endpoint = `${serviceUri}/by-po`;
        return super.list(endpoint, info);
    }

    getById(id) {
        var endpoint = `${serviceUri}/${id}`;
        return super.get(endpoint);
    }

    update(data) {
        var endpoint = `${serviceUri}/${data.Id}`;
        return super.put(endpoint, data);
    }

    getStelling(id) {
        var endpoint = `${serviceUri}/stelling/${id}`;
        return super.get(endpoint);
    }

    generateExcel(args) {
        var params = {};
        if (args.productcode) params.productcode = args.productcode;
        if (args.po) params.po = args.po;
        if (args.unitcode) params.unitcode = args.unitcode;
        if (args.ctg) params.ctg = args.ctg;
        if (args.urn) params.urn = args.urn;

        var query = Object.keys(params)
            .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
            .join('&');

        var endpoint = `${serviceUri}/by-po/download${query ? `?${query}` : ''}`;
        return super.getXls(endpoint);
    }

    getPdfById(id) {
        var endpoint = `${serviceUri}/stelling/${id}`;
        return super.getPdf(endpoint);
    }
    
    getBarcodeById(id) {
        var endpoint = `${serviceUri}/barcode/${id}`;
        return super.getPdf(endpoint);
    }
}

export { Service }
