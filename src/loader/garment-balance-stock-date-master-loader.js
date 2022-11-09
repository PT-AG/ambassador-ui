import { Container } from 'aurelia-dependency-injection';
import { Config } from "aurelia-api";

const resource = 'balance-stock-date-master';

module.exports = function (keyword, filter) {

    var config = Container.instance.get(Config);
    var endpoint = config.getEndpoint("inventory-azure");

    return endpoint.find(resource, { keyword: keyword, filter: JSON.stringify(filter), size: 1 })
    .then(results => {
        console.log(results);
        return results.data
    });
}
