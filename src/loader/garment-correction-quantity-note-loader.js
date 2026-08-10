import { Container } from 'aurelia-dependency-injection';
import { Config } from "aurelia-api";

const resource = 'garment-correction-quantity-notes/by-user';

module.exports = function (keyword, filter) {

    var config = Container.instance.get(Config);
    var endpoint = config.getEndpoint("purchasing-azure");

    return endpoint.find(resource, { keyword: keyword, filter: JSON.stringify(filter), size: 10 })
        .then(results => {
            return results.data.map(correctionNote => {
                correctionNote.toString = function () {
                    var correctionNo = this.no || this.CorrectionNo || (this.pr ? this.pr.no : '') || '';
                    return `${correctionNo}`;
                }
                return correctionNote;
            });
        });
}
