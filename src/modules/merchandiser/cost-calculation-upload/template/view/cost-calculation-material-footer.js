import { inject, bindable, computedFrom } from 'aurelia-framework';
import { Container } from 'aurelia-dependency-injection';
import { Config } from "aurelia-api"

export class CostCalculationMaterialFooter {
    activate(context) {
        this.context = context;
    }

    get totalOngkir() {
        let totalOngkir = 0;
        for (let item of this.context.items) {
            if (item.data) {
                totalOngkir += item.data.TotalShippingFee ? Number(item.data.TotalShippingFee) : 0;
            }
        }
        return totalOngkir;
    }

    get totalMaterial() {
        let totalMaterial = 0;
        for (let item of this.context.items) {
            if (item.data) {
                totalMaterial += item.data.Total ? Number(item.data.Total) : 0;
            }
        }
        return totalMaterial;
    }
}