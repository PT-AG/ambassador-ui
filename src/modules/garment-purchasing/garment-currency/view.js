import {inject, Lazy} from 'aurelia-framework';
import {Router} from 'aurelia-router';
import {Service} from './service';
import { Base64Helper } from '../../../utils/base-64-coded-helper';


@inject(Router, Service)
export class View {
    constructor(router, service) {
        this.router = router;
        this.service = service;
    }

    async activate(params) {
      const decoded = Base64Helper.decode(params.id);
      var id = decoded;

      this.data = await this.service.getById(id);
      if (this.data && (this.data.IsUsed || this.data.isUsed)) {
          this.editCallback = null;
          this.deleteCallback = null;
      }
    }

    bind(context) {
        this.context = context;
        this.data = this.data || (this.context && this.context.data);
        this.error = this.context && this.context.error;

        if (this.data && (this.data.IsUsed || this.data.isUsed)) {
            this.editCallback = null;
            this.deleteCallback = null;
        }
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
        this.service.delete(this.data)
            .then(result => {
                this.cancelCallback();
            });
    }
}

