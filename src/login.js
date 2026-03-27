import { Aurelia, inject } from 'aurelia-framework';
import { AuthService } from "aurelia-authentication";
import { Config } from "aurelia-api";
import '../styles/signin.css';
import JSEncrypt from 'jsencrypt';
import { PasswordValidator } from './utils/password-validator';

@inject(AuthService, Config)
export class Login {
    // username = "dev";
    // password = "Standar123";

    username="";
    password="";

    usernameError = "";
    passwordError = "";
    generalError = "";

    error = false;
    disabledButton = false;
    
    constructor(authService, config) {
        this.authService = authService;
        this.authEndpoint = config.getEndpoint('auth');
    }

    login() {
        this.error = false;

        this.usernameError = "";
        this.passwordError = "";
        this.generalError = "";

        if (!this.username) {
            this.usernameError = "Username wajib diisi";
        }

        if (!this.password) {
            this.passwordError = "Password wajib diisi";
        }

        if (this.usernameError || this.passwordError) {
            return;
        }

        this.disabledButton = true;
        const PUBLIC_KEY =`-----BEGIN PUBLIC KEY-----MIIBCgKCAQEAyUDO910BLcBrwdscKorajZKQJdR9TNnR/oqNcTpL10C4Ts9JQq4djGlcxdIG09rm23x5r54/eFmthu4lpeSBEPsS9O4ai0SF0mA39n5lvfNzWJ/JNBYswXU0S2BoTKdClbme+Z1hhqwksej+y2r+AzxiUay23Tn/AvIRxmPQg/66lD6zNyTWHOHAowhdOLUF8GagwdNOeCC0BZDdjP7Iyrk0d5XYeffMAcNR2vLTDpreMcjda7fGHbDTu8khsFTpFDwub0Pg96lxbFV9i//dZ7sPl+RpIrrLV9alCuDyz4+86Sl1jVqbwyh4j4XjgYck1CcmDg5cWN5iB9MnHJZaAQIDAQAB-----END PUBLIC KEY-----`;
        
        const credentials = {
            username: this.username,
            password: this.password,
            nonce: crypto.randomUUID(),
            timestamp: new Date().toISOString()
        };

        const encryptor = new JSEncrypt.JSEncrypt();
        encryptor.setPublicKey(PUBLIC_KEY);
        const authEncrypted = encryptor.encrypt(JSON.stringify(credentials));
        //return this.authService.login({ "username": this.username, "password": this.password })
        return this.authService.login({ authEncrypted })
            .then(response => {
                console.log("success logged " + response);

                // Update last login dengan source 'login'
                // this.authEndpoint.update('me', null, { source: 'login' })
                //     .then(() => console.log('Last login updated (source: login)'))
                //     .catch(err => console.error('Error updating last login on sign in:', err));

                this.statusMessage = PasswordValidator.validate(this.password);
                
                if (this.statusMessage) {
                    alert(this.statusMessage);
                    this.disabledButton = false;
                    window.location.href = `#/changepass?Username=${this.username}`;
                } else {
                    location.reload();
                }
            })
            .catch(err => {
                this.error = true;
                this.disabledButton = false;

                const defaultMsg = "Username atau password salah";

                if (err && typeof err.json === 'function') {
                    return err.json()
                        .then(d => {
                            let msg = defaultMsg;
                            try {
                                if (d) msg = d.message || d.Message || d.error || JSON.stringify(d) || msg;
                            } catch (e) {
                            }
                            this.generalError = msg;
                        })
                        .catch(() => {
                            this.generalError = err.statusText || defaultMsg;
                        });
                }

                let msg = defaultMsg;
                try {
                    if (err) {
                        if (err.response && err.response.data) {
                            const d = err.response.data;
                            msg = d.message || d.Message || d.error || JSON.stringify(d) || msg;
                        } else if (err.data) {
                            const d = err.data;
                            msg = d.message || d.Message || d.error || JSON.stringify(d) || msg;
                        } else if (err.message) {
                            msg = err.message;
                        } else if (typeof err === 'string') {
                            msg = err;
                        } else if (err.statusText) {
                            msg = err.statusText;
                        }
                    }
                } catch (e) {}

                this.generalError = msg;
                
            });
    }

}