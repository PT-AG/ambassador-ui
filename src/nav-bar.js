import { inject, computedFrom } from 'aurelia-framework';
import { AuthService } from "aurelia-authentication";
import { Router } from "aurelia-router";

@inject(AuthService,Router)
export class NavBar {
    timeFormatted = "";
    timer = null;
    showNotification = false;
    countdown = "";
    isWarning = false; // true jika waktu kurang dari 5 menit
    isBlinkOn = true;

    constructor(authService,router) {
        this.authService = authService;
        this.router = router;
    }

    @computedFrom('authService.authenticated')
    get isAuthenticated() {
       if (this.authService.authenticated) {
            this.authService.getMe()
                .then((result) => {
                    this.me = result.data;
                    if (this.me && this.me.expiredDateTime) {
                        this.startCountdown(this.me.expiredDateTime);
                    }
                })
        }
        else {
            this.me = null;
        }

        return this.authService.authenticated;
    }

    attached() {
        this.updateTime();
        this.timer = setInterval(() => { 
            this.updateTime();
        }, 1000);
    }

    detached() {
        clearInterval(this.timer);
        if (this.countdownTimer) clearInterval(this.countdownTimer);
    }

    updateTime() {
        const now = new Date();
        this.timeFormatted = now.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
        });
    }

    startCountdown(expiredStr) {
        if (this.countdownTimer) {
            clearInterval(this.countdownTimer);
            this.countdownTimer = null;
        }

        const parseLocalDateTime = (s) => {
            if (!s) return null;
            const clean = s.trim().replace('T', ' ');
            const [dPart, tPart = '00:00:00'] = clean.split(' ');
            const [yyyy, mm, dd] = dPart.split('-').map(x => parseInt(x, 10));
            const [hh = 0, min = 0, sec = 0] = tPart.split(':').map(x => parseInt(x, 10));
            return new Date(yyyy, mm - 1, dd, hh, min, sec);
        };

        const expire = parseLocalDateTime(expiredStr);
        if (!expire || isNaN(expire.getTime())) {
            this.showNotification = false;
            this.countdown = "";
            return;
        }

        this.showNotification = true;
        this.countdown = "";

        this.countdownTimer = setInterval(() => {
            const now = new Date();
            let diffMs = expire.getTime() - now.getTime();
            if (diffMs < 0) diffMs = 0;

            const remainingSeconds = Math.floor(diffMs / 1000);

            if (remainingSeconds <= 0) {
            this.countdown = "...";
            this.showNotification = true;
            clearInterval(this.countdownTimer);
            this.countdownTimer = null;

            this.logout();
            return;
            }

            // // munculkan notif hanya saat <= 5 menit (300 detik)
            // if (remainingSeconds <= 6 * 60) {
            // this.showNotification = true;
            // } else {
            // this.showNotification = false;
            // }

            const hours = Math.floor(remainingSeconds / 3600);
            const minutes = Math.floor((remainingSeconds % 3600) / 60);
            const seconds = remainingSeconds % 60;

            const hhStr = String(hours).padStart(2, '0');
            const mmStr = String(minutes).padStart(2, '0');
            const ssStr = String(seconds).padStart(2, '0');

            const wasWarning = this.isWarning;
            this.isWarning = remainingSeconds <= 5 * 60;
          
            if (this.isWarning && !wasWarning) {
                this.startBlinking();
            }
            if (!this.isWarning && wasWarning) {
                this.stopBlinking();
            }
            this.countdown = `${hhStr}:${mmStr}:${ssStr}`;


        }, 1000);
    }
    startBlinking() {
        if (this.blinkTimer) return;
        this.isBlinkOn = true;
        this.blinkTimer = setInterval(() => {
            this.isBlinkOn = !this.isBlinkOn;
        }, 500); // kedip setiap 500ms
    }

    stopBlinking() {
        if (this.blinkTimer) {
            clearInterval(this.blinkTimer);
            this.blinkTimer = null;
        }
        this.isBlinkOn = true;
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
