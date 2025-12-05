import { Container } from 'aurelia-dependency-injection';
import { Config } from "aurelia-api";

const resource = 'employees/by-digitalId';

module.exports = function (keyword) {
    var config = Container.instance.get(Config);
    var endpoint = config.getEndpoint("attendance");

    return endpoint.find(resource, { keyword: keyword, size: 10 })
        .then(results => {
            return results.data;
        });
}
