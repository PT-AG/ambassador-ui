import { Container } from 'aurelia-dependency-injection';
import { Config } from "aurelia-api";

const resource = 'garment-external-purchase-orders/subcon-delivery-loader';

module.exports = function (keyword, filter) {

  var config = Container.instance.get(Config);
  var endpoint = config.getEndpoint("purchasing-azure");
  console.log(keyword, filter);
  return endpoint.find(resource, { keyword: keyword, filter: JSON.stringify(filter), size: 10 })
    .then(results => {
    
        return results.data;
      
    });
}
