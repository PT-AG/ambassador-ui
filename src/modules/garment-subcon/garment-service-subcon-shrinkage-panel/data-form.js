import { bindable, inject, computedFrom } from "aurelia-framework";
import { Service } from "./service";

const UnitLoader = require('../../../loader/garment-units-loader');
const UomLoader = require("../../../loader/uom-loader");

@inject(Service)
export class DataForm {
	@bindable readOnly = false;
	@bindable isCreate = false;
	@bindable isEdit = false;
	@bindable isView = false;
	@bindable title;
	@bindable data = {};
	@bindable itemOptions = {};
	@bindable selectedUomUnit;

	constructor(service) {
		this.service = service;
	}

	formOptions = {
		cancelText: "Kembali",
		saveText: "Simpan",
		deleteText: "Hapus",
		editText: "Ubah"
	};

	// UomOptions = ['COLI', 'IKAT', 'CARTON', 'ROLL'];
	controlOptions = {
		label: {
			length: 3
		},
		control: {
			length: 5
		}
	};

	itemsInfo = {
		columns: [
			"No Bon Pengeluaran Unit",
			"Tgl Pengeluaran",
			"Asal Unit",
			""
		]
	}

	get UomPackingLoader() {
		return UomLoader;
	}

	bind(context) {
		this.context = context;
		this.data = this.context.data;

		this.selectedUomUnit = { Unit : this.data.UomUnit }
		
		this.error = this.context.error;
		this.itemOptions = {
			isCreate: this.context.isCreate,
			isEdit: this.context.isEdit,
			isView: this.context.isView,
			checkedAll: this.context.isCreate == true ? false : true,
			UENList: []
		}

		if(this.data && this.data.Items) {
			this.data.Items.forEach(
				item => {
					this.itemOptions.UENList.push(item.UnitExpenditureNo);
				}
			  );
		}
	}

	get addItems() {
		return (event) => {
			this.data.Items.push({});
		};
	}

	get removeItems() {
		return (event) => {

			var _uenno = event.detail.UnitExpenditureNo;
        
            if(this.itemOptions.UENList.includes(_uenno)){
                this.itemOptions.UENList.splice(this.itemOptions.UENList.indexOf(event.detail.UnitExpenditureNo), 1);
            }

			this.error = null;
		};
	}

	selectedUomUnitChanged(newValue){
		if (newValue) {
		  this.data.UomUnit = newValue.Unit;
		} else {
		  this.data.UomUnit = "";
		}
	
		console.log(this.data.UomUnit);
	}

	/*get totalQuantity() {
		var qty = 0;
		if (this.data.Items) {
			for (var item of this.data.Items) {
				if (item.Details) {
					for (var detail of item.Details) {
						qty += detail.Quantity;
					}
				}
			}
		}
		return qty;
	}*/
}
