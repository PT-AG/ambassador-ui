import { inject, computedFrom } from 'aurelia-framework';
import { AuthService } from "aurelia-authentication";
import { Router } from "aurelia-router";

@inject(AuthService,Router)
export class NavBar {
    constructor(authService,router) {
        this.authService = authService;
        this.router = router;
    }

    @computedFrom('authService.authenticated')
    get isAuthenticated() {
        return this.authService.authenticated;
    }

    attached() {
        if (this.authService.authenticated) {
            this.authService.getMe()
                .then((result) => {
                    this.me = result.data;
                })
                .catch((err) => {
                    if (err.status == 401) {
                        alert("Sesi anda telah habis, silahkan login kembali.");
                        this.logout();
                    }
                });
        } else {
            this.me = null;
        }
    }

    logout() {
        this.authService.logout("#/login");
    }

    changePass(event) {
        this.router.navigateToRoute("changepass",{
            Username: event,
        });
    }
}
