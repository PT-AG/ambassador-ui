import { inject, Lazy } from 'aurelia-framework';
import { Router } from 'aurelia-router';
import { Service } from './service';
import { Dialog } from '../../../../au-components/dialog/dialog';
import { Base64Helper } from '../../../../utils/base-64-coded-helper';

@inject(Router, Service, Dialog)
export class View {
	constructor(router, service, dialog) {
		this.router = router;
		this.service = service;
		this.dialog = dialog;
	}

	async activate(params) {
		const decoded = Base64Helper.decode(params.id);
		var id = decoded;
		this.data = await this.service.getById(id);
	}

	list() {
		this.router.navigateToRoute('list');
	}

	cancelCallback(event) {
		this.list();
	}

	editCallback(event) {
		    const encoded = Base64Helper.encode(this.data.Id);
    		this.router.navigateToRoute('edit', { id: encoded });
	}

	deleteCallback(event) {
		this.dialog.prompt('Apakah anda yakin akan menghapus data ini?', 'Hapus Data Penerimaan Kas Bank')
			.then(response => {
				if (response.ok) {
					this.service.delete(this.data)
						.then(result => {
							this.list();
						});
				}
			});
	}
}
