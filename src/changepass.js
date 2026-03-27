import { Aurelia, inject } from 'aurelia-framework';
import { AuthService } from "aurelia-authentication";
import { Service } from './modules/auth/account/service';
import '../styles/signin.css';
import { PasswordValidator } from './utils/password-validator';

@inject(AuthService, Service)
export class ChangePass {
    // username = "dev";
    // password = "Standar123";

    username = "";
    // password="";
    error = false;
    disabledButton = false;
    statusMessage = null;

    constructor(authService, service) {
        this.authService = authService;
        this.service = service;
    }

    async activate(params) {
        console.log("param", params);
        this.username = params.Username;
    }

    attached() {
        // Disable sidebar saat halaman changepass dibuka (class)
        const sidebars = document.getElementsByClassName('side-nav-bar');
        for (let sidebar of sidebars) {
            sidebar.style.pointerEvents = 'none';
            //sidebar.style.opacity = '0.5'; // efek visual agar terlihat disabled
        }
    }

    save() {
        this.error = false;
        this.disabledButton = true;
        this.data = {};
        if (this.password1 == this.password2) {

            this.statusMessage = PasswordValidator.validate(this.password1);

            if (this.statusMessage) {
                alert(this.statusMessage);
                this.disabledButton = false;
            } else {
                this.data.username = this.username;
                this.data.password = this.password1;

                this.service.updatePass(this.data)
                    .then(result => {
                        alert("Kata Sandi Berhasil DiUbah");
                        this.authService.logout("#/login");
                        window.location.reload();
                    })
                    .catch(e => {
                        this.error = e;
                        this.disabledButton = false;
                    })
            }
        } else {
            alert("Kata Sandi dan Konfirmasi Kata Sandi harus sama.")
            this.disabledButton = false;
        }
    }
}