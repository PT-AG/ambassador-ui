import { inject, bindable, computedFrom } from 'aurelia-framework';

export class Profile {
    @bindable readOnly = false;
    @bindable data = {};
    @bindable error = {};
    genders = ["male", "female"];
    
    constructor(router, service) {
    }

    controlOptions = {
        label: {
            length: 3
        },
        control: {
            length: 4,
        }
    }
}
