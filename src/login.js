import { Aurelia, inject } from 'aurelia-framework';
import { AuthService } from "aurelia-authentication";
import '../styles/signin.css';

@inject(AuthService)
export class Login {
    username="";
    password="";
    error = false;
    disabledButton = false;

    constructor(authService) {
        this.authService = authService;
    }

    login() {
        this.error = false;
        this.disabledButton = true;

        return this.authService.login({ "username": this.username, "password": this.password })
            .then(response => {
                location.reload();
            })
            .catch(err => {
                this.error = true;
                this.disabledButton = false;
            });
    }
} 