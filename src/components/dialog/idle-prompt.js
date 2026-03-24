import { inject, useView } from 'aurelia-framework';
import { DialogController } from 'aurelia-dialog';

@inject(DialogController)
@useView("components/dialog/idle-prompt.html")
export class IdlePrompt {
    constructor(controller) {
        this.controller = controller;
    }

    activate(data) {
        this.title = data.title;
        this.message = data.message;
    }
}
