import { RestService } from '../../../../utils/rest-service'; 

const serviceUri = 'receipt-before-notes/monitoring';

export class Service extends RestService {

    constructor(http, aggregator, config, endpoint) {
        super(http, aggregator, config, "purchasing-azure");
    }

    search(info) {
        console.log(info);
        let endpoint = `${serviceUri}`;
        return super.list(endpoint, info);
        
    }

    getById(id) {
        var endpoint = `${serviceUri}/${id}`;
        return super.get(endpoint);
    }

    
   generateExcel(info) {
        var endpoint = `${serviceUri}/download?urnNo=${info.UrnNo}&supplierName=${info.SupplierName}&doNo=${info.DONo}&dateFrom=${info.dateFrom}&dateTo=${info.dateTo}`;
        
        return super.getXls(endpoint);
        
    }

}
