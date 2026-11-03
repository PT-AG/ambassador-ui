import { Container } from 'aurelia-dependency-injection';
import { Config } from 'aurelia-api';

export class MasterDataUsageService {
    static async isUsed(serviceName, type, id, code) {
        try {
            const config = Container.instance.get(Config);
            const endpoint = config.getEndpoint(serviceName);
            const info = { type: type, id: id };
            if (code) {
                info.code = code;
            }
            const result = await endpoint.find('master-data-usage/is-used', info);
            return result && (result.isUsed || result.IsUsed) ? true : false;
        } catch (e) {
            console.error('Error checking master data usage:', e);
            return false;
        }
    }
}

