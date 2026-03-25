import { Aurelia, inject, computedFrom } from 'aurelia-framework';
import { AuthService } from 'aurelia-authentication';
import { DialogService } from 'aurelia-dialog';
import { IdlePrompt } from './components/dialog/idle-prompt';
import { AuthStep } from './utils/auth-step';
import routes from './routes/index';

@inject(AuthService, DialogService)

export class App {
  idleTimer = null;
  idleTimeout = 15 * 60 * 1000;

  constructor(authService, dialogService) {
    this.authService = authService;
    this.dialogService = dialogService;

    this.resetIdleTimer = this.resetIdleTimer.bind(this);
  }

  attached() {
    this.startIdleTracking();
  }

  startIdleTracking() {
    const events = ['mousemove', 'mousedown', 'keypress', 'touchstart', 'scroll'];
    events.forEach(evt => window.addEventListener(evt, this.resetIdleTimer));

    this.resetIdleTimer();
  }

  resetIdleTimer() {
    if (this.idleTimer) clearTimeout(this.idleTimer);

    if (this.isAuthenticated) {
      this.idleTimer = setTimeout(() => {
        this.logoutDueToInactivity();
      }, this.idleTimeout);
    }
  }

  logoutDueToInactivity() {
    if (this.isShowingDialog) return;
    this.isShowingDialog = true;

    this.dialogService.open({
      viewModel: IdlePrompt,
      model: {
        title: 'Sesi Akan Berakhir',
        message: 'Apakah Anda masih di sini?'
      }
    }).then(response => {
      this.isShowingDialog = false;
      if (!response.wasCancelled) {
        // User klik Im Here
        this.resetIdleTimer();
      } else {
        // User klik Logout atau tutup
        this.authService.logout("#/login");
      }
    });
  }

  // Penting: Bersihkan listener jika komponen dilepas (unmounted)
  detached() {
    const events = ['mousemove', 'mousedown', 'keypress', 'touchstart', 'scroll'];
    events.forEach(evt => window.removeEventListener(evt, this.resetIdleTimer));
    if (this.idleTimer) clearTimeout(this.idleTimer);
  }

  configureRouter(config, router) {
    config.title = 'Aurelia';
    config.addPipelineStep('authorize', AuthStep);
    config.map(routes);
    this.router = router;
  }

  @computedFrom('authService.authenticated')
  get isAuthenticated() {
    return this.authService.authenticated;
  }
}
