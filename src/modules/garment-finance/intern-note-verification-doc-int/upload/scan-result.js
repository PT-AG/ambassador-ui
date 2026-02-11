import { bindable } from 'aurelia-framework';

export class ScanResult {
	@bindable result; // object dari hasil response.json()

	activate(model) {
		// menerima data via compose model
		if (model && 'result' in model) {
			this.result = model.result;
		}
		this._updateString();
	}

	bind() {
		this._updateString();
	}

	resultChanged() {
		this._updateString();
	}

	_updateString() {
		this.jsonString = this.result ? JSON.stringify(this.result, null, 2) : '';
	}

	get hasData() {
		return !!this.result && (typeof this.result === 'object' ? Object.keys(this.result).length > 0 : true);
	}
}

export default ScanResult;
