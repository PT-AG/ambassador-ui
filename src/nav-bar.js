import { inject, computedFrom } from 'aurelia-framework';
import { AuthService } from 'aurelia-authentication';

@inject(AuthService)
export class NavBar {
    me = null;

    constructor(authService) {
        this.authService = authService;
    }

    attached() { }

    @computedFrom('authService.authenticated')
    get isAuthenticated() {
        if (this.authService.authenticated) {
            if (!this.me) {
                this.authService.getMe()
                    .then((result) => {
                        this.me = result.data;
                    });
            }
        } else {
            this.me = null;
        }

        return this.authService.authenticated;
    }

    logout() {
        this.authService.logout("#/login");
    }

    changePass() {
        window.location.href = `#/changepass?Username=${this.me.username}`;
    }
}
