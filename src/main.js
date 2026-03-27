// we want font-awesome to load as soon as possible to show the fa-spinner
import 'font-awesome/css/font-awesome.css';
import 'bootstrap/dist/css/bootstrap.css';
import '../styles/styles.css';
import '../styles/styles.components.css';
import '../styles/styles.login.css';
import '../styles/styles.theme.css';
import '../styles/dashboard.css';
import 'bootstrap';
import authConfig from "../auth-config";
import { Config } from "aurelia-api";
import { AuthService } from 'aurelia-authentication';
let authService;
let authEndpoint;
let idleEventsActive = false;

// comment out if you don't want a Promise polyfill (remove also from webpack.common.js)
import * as Bluebird from 'bluebird';
Bluebird.config({ warnings: false });

// === Idle Timeout / Auto-Logout ===
const IDLE_TIMEOUT_MINUTES = 1;
let idleTimer;
let warningTimer;
let warningPopup;
let countdownInterval;
let currentWarningEndAt = null;

let idleEvents = ['mousemove', 'keydown', 'mousedown', 'touchstart', 'scroll'];
let warningActive = false;

/**
 * Cek apakah expiredDateTime adalah DateTime.MinValue (0001-01-01T00:00:00).
 * Jika ya, berarti session tidak memiliki batas waktu.
 */
function isDateTimeMinValue(dateStr) {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    return d.getFullYear() <= 1;
}

function enableIdleEvents() {
    if (!idleEventsActive) {
        idleEvents.forEach(event => {
            window.addEventListener(event, resetIdleTimer);
        });
        idleEventsActive = true;
    }
}

function disableIdleEvents() {
    if (idleEventsActive) {
        idleEvents.forEach(event => {
            window.removeEventListener(event, resetIdleTimer);
        });
        idleEventsActive = false;
    }
}

/**
 * Update last login ke server.
 * @param {string} source - Asal request: 'popup' | 'im-here'
 */
function updateLastLogin(source) {
    const body = source ? { source } : {};
    return authEndpoint.update('me', null, body)
        .then(() => {
            return authService.getMe();
        })
        .then((result) => {
            // result.data berisi user terbaru termasuk expiredDateTime
            return result.data;
        })
        .catch((error) => {
            console.error('Error updating last login time:', error);
            return null;
        });
}

function showWarningPopup() {
    // Jangan tampilkan popup jika sudah di halaman login
    if (window.location.hash.indexOf('#/login') !== -1) return;
    // Jika popup sudah ada, jangan buat lagi
    if (document.getElementById('idle-warning-popup')) return;
    warningActive = true;

    // Update last login dan ambil expiredDateTime untuk countdown
    updateLastLogin('popup').then((me) => {
        // Jika expiredDateTime adalah DateTime.MinValue, session tidak dibatasi waktu
        if (me && isDateTimeMinValue(me.expiredDateTime)) {
            console.log('Session has no expiration (DateTime.MinValue). Skipping warning popup.');
            warningActive = false;
            return;
        }

        let warningEndAt;
        if (me && me.expiredDateTime) {
            // Gunakan expiredDateTime dari server untuk countdown
            warningEndAt = new Date(me.expiredDateTime).getTime();
        } else {
            // Fallback: 1 jam dari sekarang jika expiredDateTime tidak tersedia
            warningEndAt = Date.now() + (3600 * 1000);
        }

        currentWarningEndAt = warningEndAt;
        const initialSecondsLeft = Math.max(0, Math.ceil((warningEndAt - Date.now()) / 1000));
        renderWarningPopup(warningEndAt, initialSecondsLeft);
    });
}

function renderWarningPopup(warningEndAt, initialSecondsLeft) {
    // Cek ulang jika popup sudah hilang saat menunggu response API
    if (!warningActive) return;
    warningPopup = document.createElement('div');
    warningPopup.id = 'idle-warning-popup';
    warningPopup.style.position = 'fixed';
    warningPopup.style.top = '0';
    warningPopup.style.left = '0';
    warningPopup.style.width = '100vw';
    warningPopup.style.height = '100vh';
    warningPopup.style.background = 'rgba(0,0,0,0.3)';
    warningPopup.style.display = 'flex';
    warningPopup.style.justifyContent = 'center';
    warningPopup.style.alignItems = 'center';
    warningPopup.style.zIndex = '9999';
    warningPopup.innerHTML = `
        <div style="background:white;padding:32px;border-radius:8px;box-shadow:0 2px 8px #0003;text-align:center;">
            <h3>Anda akan logout otomatis dalam <span id="idle-countdown">${formatDuration(initialSecondsLeft)}</span></h3>
            <p>Silakan klik tombol di bawah jika Anda masih aktif.</p>
            <button class="btn btn-primary" id="idle-warning-btn" style="padding:8px 24px;font-size:16px;">I'm here</button>
        </div>
    `;
    document.body.appendChild(warningPopup);
    document.getElementById('idle-warning-btn').onclick = () => {
        updateLastLogin('im-here'); // Kirim ke backend bahwa user masih aktif
        hideWarningPopup();   // harus duluan agar warningActive = false
        resetIdleTimer();     // baru set idle timer baru
    };
    let blinkOn = true;
    countdownInterval = setInterval(() => {
        const remainingMs = Math.max(0, warningEndAt - Date.now());
        const secondsLeft = Math.ceil(remainingMs / 1000);
        const countdownSpan = document.getElementById('idle-countdown');
        if (countdownSpan) {
            countdownSpan.textContent = formatDuration(secondsLeft);

            if (secondsLeft <= 300 && remainingMs > 0) {
                countdownSpan.style.color = '#d9534f';
                countdownSpan.style.fontWeight = '700';
                blinkOn = !blinkOn;
                countdownSpan.style.opacity = blinkOn ? '1' : '0.2';
            } else {
                countdownSpan.style.color = '';
                countdownSpan.style.fontWeight = '';
                countdownSpan.style.opacity = '1';
            }
        }
        if (remainingMs <= 0) {
            clearInterval(countdownInterval);
            forceLogout();
        }
    }, 1000);
}

function formatDuration(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function hideWarningPopup() {
    if (warningPopup) {
        warningPopup.remove();
        warningPopup = null;
    }
    clearInterval(countdownInterval);
    warningActive = false;
    currentWarningEndAt = null;
}

function forceLogout() {
    hideWarningPopup();
    if (authService) {
        authService.logout().then(() => {
            window.location.href = '#/login';
        });
    } else {
        window.localStorage.clear();
        window.location.href = '#/login';
    }
}

function onVisibilityChange() {
    if (document.visibilityState !== 'visible') return;
    if (window.location.hash.indexOf('#/login') !== -1) return;

    // Jika popup warning aktif dan ada expiredDateTime, cek langsung
    if (warningActive && currentWarningEndAt) {
        if (Date.now() >= currentWarningEndAt) {
            forceLogout();
            return;
        }
    }

    // Jika tidak ada popup, cek ke server apakah session sudah expired
    if (authService && authService.isAuthenticated()) {
        authService.getMe()
            .then((result) => {
                if (result && result.data && result.data.expiredDateTime) {
                    if (isDateTimeMinValue(result.data.expiredDateTime)) return;
                    const expiredAt = new Date(result.data.expiredDateTime).getTime();
                    if (Date.now() >= expiredAt) {
                        forceLogout();
                    }
                }
            })
            .catch((error) => {
                console.error('Error checking session on visibility change:', error);
            });
    }
}

function resetIdleTimer() {
    clearTimeout(idleTimer);
    clearTimeout(warningTimer);
    if (warningActive) return; // Jangan reset timer jika popup warning sedang tampil
    hideWarningPopup();
    idleTimer = setTimeout(() => {
        showWarningPopup(); // Munculkan popup setelah 15 menit
    }, IDLE_TIMEOUT_MINUTES * 60 * 1000);
}

function setupIdleTimeout() {
    idleEvents.forEach(event => {
        window.addEventListener(event, resetIdleTimer);
    });
    document.addEventListener('visibilitychange', onVisibilityChange);
    resetIdleTimer();
}

export async function configure(aurelia) {
    aurelia.use
        .standardConfiguration()
        .feature('au-components')
        .feature('components')
        .feature('converters')

        .plugin("aurelia-api", config => {
            var offset = new Date().getTimezoneOffset() / 60 * -1;
            var defaultConfig = {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'x-timezone-offset': offset
                }
            }

            var core = "https://com-ambassador-service-core-dev.azurewebsites.net/v1/";
            var auth = "https://com-ambassador-service-auth-dev.azurewebsites.net/v1/";
            var productionAzure = "https://com-ambassador-service-finishing-printing.azurewebsites.net/v1/";
            var purchasingAzure = "https://com-ambassador-service-purchasing-dev.azurewebsites.net/v1/";
            var inventoryAzure = "https://com-ambassador-service-inventory-dev.azurewebsites.net/v1/";
            var customsReport = "https://com-ambassador-service-support.azurewebsites.net/v1/";
            const sales = "https://com-ambassador-service-sales-dev.azurewebsites.net/v1/";
            var finance = "https://com-ambassador-service-finance-accounting-dev.azurewebsites.net/v1/";
            var garmentProduction = "https://com-ambassador-service-garment-dev.azurewebsites.net/";
            var packingInventory = "https://com-ambassador-service-packing-inventory-dev.azurewebsites.net/v1/";
            var ItInven = "https://it-inventory-etl-service.azurewebsites.net/api/";
            var attendance = "https://ambassador-hr-portal-attendance-service-dev.azurewebsites.net/v1/";

            config.registerEndpoint('auth', auth);
            config.registerEndpoint('core', core);
            config.registerEndpoint('production-azure', productionAzure, defaultConfig);
            config.registerEndpoint('purchasing-azure', purchasingAzure, defaultConfig);
            config.registerEndpoint('inventory-azure', inventoryAzure, defaultConfig);
            config.registerEndpoint('customs-report', customsReport, defaultConfig);
            config.registerEndpoint('sales', sales, defaultConfig);
            config.registerEndpoint('finance', finance, defaultConfig);
            config.registerEndpoint('garment-production', garmentProduction, defaultConfig);
            config.registerEndpoint('packing-inventory', packingInventory, defaultConfig);
            config.registerEndpoint('attendance', attendance, defaultConfig);
            config.registerEndpoint('ItInven', ItInven, { headers: { Accept: '*/*', 'Sec-Fetch-Site': 'cross-site' }, mode: 'cors' });
        })
        .plugin("aurelia-authentication", baseConfig => {
            baseConfig.configure(authConfig);
            authService = aurelia.container.get(AuthService);

            if (baseConfig.client && baseConfig.client.client) {
                var offset = new Date().getTimezoneOffset() / 60 * -1;
                baseConfig.client.client.withDefaults({
                    headers: {
                        'x-timezone-offset': offset
                    }
                })
            }
        })
        .plugin('aurelia-dialog', config => {
            config.useDefaults();
            config.settings.lock = true;
            config.settings.centerHorizontalOnly = false;
            config.settings.startingZIndex = 5;
        })
        .plugin('aurelia-dragula')
        .plugin('aurelia-bootstrap')
        .plugin('aurelia-google-analytics', (config) => {
            config.init('UA-138671841-2');
            config.attach({
                logging: {
                    // Set to `true` to have some log messages appear in the browser console.
                    enabled: true
                },
                pageTracking: {
                    // Set to `false` to disable in non-production environments.
                    enabled: true,
                    // Configure fragments/routes/route names to ignore page tracking for
                    ignore: {
                        fragments: [], // Ignore a route fragment, login fragment for example: ['/login']
                        routes: [], // Ignore a route, login route for example: ['login']
                        routeNames: [] // Ignore a route name, login route name for example: ['login-route']
                    },
                    // Optional. By default it gets the title from payload.instruction.config.title.
                    getTitle: (payload) => {
                        // For example, if you want to retrieve the tile from the document instead override with the following.
                        return document.title;
                    },
                    // Optional. By default it gets the URL fragment from payload.instruction.fragment.
                    getUrl: (payload) => {
                        // For example, if you want to get full URL each time override with the following.
                        return window.location.href;
                    }
                },
                clickTracking: {
                    // Set to `false` to disable in non-production environments.
                    enabled: true,
                    // Optional. By default it tracks clicks on anchors and buttons.
                    filter: (element) => {
                        // For example, if you want to also track clicks on span elements override with the following.
                        return element instanceof HTMLElement &&
                            (element.nodeName.toLowerCase() === 'a' ||
                                element.nodeName.toLowerCase() === 'button' ||
                                element.nodeName.toLowerCase() === 'span');
                    }
                },
                exceptionTracking: {
                    // Set to `false` to disable in non-production environments.
                    enabled: true
                }
            });
        })
        .developmentLogging();

    // Uncomment the line below to enable animation.
    // aurelia.use.plugin('aurelia-animator-css');
    // if the css animator is enabled, add swap-order="after" to all router-view elements

    // Anyone wanting to use HTMLImports to load views, will need to install the following plugin.
    // aurelia.use.plugin('aurelia-html-import-template-loader')

    await aurelia.start();
    authEndpoint = aurelia.container.get(Config).getEndpoint('auth');

    // Cek expiredDateTime saat refresh halaman
    if (authService && authService.isAuthenticated()) {
        try {
            const result = await authService.getMe();
            if (result && result.data && result.data.expiredDateTime) {
                if (!isDateTimeMinValue(result.data.expiredDateTime)) {
                    const expiredAt = new Date(result.data.expiredDateTime).getTime();
                    if (Date.now() >= expiredAt) {
                        await authService.logout();
                        window.location.href = '#/login';
                        aurelia.setRoot('login');
                        return;
                    }
                }
            }

            // Update last login saat reload halaman
            await updateLastLogin('reload');
        } catch (error) {
            console.error('Error checking session on page load:', error);
            // Jika gagal cek, arahkan ke login untuk keamanan
            await authService.logout();
            window.location.href = '#/login';
            aurelia.setRoot('login');
            return;
        }
    }

    aurelia.setRoot('app');

    // Setup idle timeout
    setupIdleTimeout();

    // if you would like your website to work offline (Service Worker), 
    // install and enable the @easy-webpack/config-offline package in webpack.config.js and uncomment the following code:
    /*
    const offline = await System.import('offline-plugin/runtime');
    offline.install();
    */
}