import { RestService } from "../../../utils/rest-service";

const serviceUri = "vb-bank-expenditures/reports";

export class Service extends RestService {
  constructor(http, aggregator, config, endpoint) {
    super(http, aggregator, config, "finance");
  }

  search(info) {
    let endpoint = `${serviceUri}`;
    return super.list(endpoint, info);
  }

  getXls(info) {
    const vbBankExpenditureId = info.vbBankExpenditureId
      ? `vbBankExpenditureId=${info.vbBankExpenditureId}&`
      : "";
    const vbBankExpenditureNo = info.vbBankExpenditureNo
      ? `vbBankExpenditureNo=${encodeURIComponent(info.vbBankExpenditureNo)}&`
      : "";
    const bankAccountId = info.bankAccountId
      ? `bankAccountId=${info.bankAccountId}&`
      : "";
    const vbRealizationId = info.vbRealizationId
      ? `vbRealizationId=${info.vbRealizationId}&`
      : "";
    const vbRealizationNo = info.vbRealizationNo
      ? `vbRealizationNo=${encodeURIComponent(info.vbRealizationNo)}&`
      : "";
    const vbId = info.vbId ? `vbId=${info.vbId}&` : "";
    const vbNo = info.vbNo ? `vbNo=${encodeURIComponent(info.vbNo)}&` : "";
    const vbRequestName = info.vbRequestName
      ? `vbRequestName=${encodeURIComponent(info.vbRequestName)}&`
      : "";
    const unitId = info.unitId ? `unitId=${info.unitId}&` : "";
    const divisionId = info.divisionId ? `divisionId=${info.divisionId}&` : "";
    const dateStart = info.dateStart ? `dateStart=${info.dateStart}&` : "";
    const dateEnd = info.dateEnd ? `dateEnd=${info.dateEnd}` : "";

    const query = `?${vbBankExpenditureId}${vbBankExpenditureNo}${bankAccountId}${vbRealizationId}${vbRealizationNo}${vbId}${vbNo}${vbRequestName}${unitId}${divisionId}${dateStart}${dateEnd}`;

    let endpoint = `${serviceUri}/xls${query}`;
    return super.getXls(endpoint);
  }
}

