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

// comment out if you don't want a Promise polyfill (remove also from webpack.common.js)
import * as Bluebird from 'bluebird';
Bluebird.config({ warnings: false });

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

            //dibawah ini PRD
            var core = "https://com-ambassador-service-core-v8.azurewebsites.net/v1/";
            var auth = "https://com-ambassador-service-auth-v8.azurewebsites.net/v1/";
            var productionAzure = "https://com-ambassador-service-finishing-printing.azurewebsites.net/v1/";
            var purchasingAzure = "https://com-ambassador-service-purchasing-v8.azurewebsites.net/v1/";
            var inventoryAzure = "https://com-ambassador-service-inventory-v8.azurewebsites.net/v1/";
            var customsReport = "https://com-ambassador-service-support.azurewebsites.net/v1/";
            const sales = "https://com-ambassador-service-sales-v8.azurewebsites.net/v1/";
            var finance = "https://com-ambassador-service-finance-accounting-v8.azurewebsites.net/v1/";
            var garmentProduction = "https://com-ambassador-service-garment-v8.azurewebsites.net/";
            var packingInventory = "https://com-ambassador-service-packing-inventory-v8.azurewebsites.net/v1/";
            var ItInven = "https://it-inventory-etl-service-v8.azurewebsites.net/api/";


            // //dibawah ini utk debuging
            // var core = "https://com-ambassador-service-core-v8.azurewebsites.net/v1/";
            //  var auth = "https://com-ambassador-service-auth-v8.azurewebsites.net/v1/";
            // // var production = "https://dl-production-webapi-dev.azurewebsites.net/v1/";
            //  var productionAzure = "https://com-ambassador-service-finishing-printing-dev.azurewebsites.net/v1/";
            // // var purchasing = "https://dl-purchasing-webapi-dev.azurewebsites-dev.net/v1/";
            //  //var purchasingAzure = "https://com-ambassador-service-purchasing-dev.azurewebsites.net/v1/";
            //  var purchasingAzure = "http://localhost:55763/v1/";

            // // var garmentPurchasing = "https://dl-purchasing-garment-webapi.azurewebsites.net/v1/";
            // // var inventory = "https://dl-inventory-webapi.azurewebsites.net/v1/";
            //  var inventoryAzure = "https://com-ambassador-service-inventory-dev.azurewebsites.net/v1/";
            // // var garmentMasterPlan = "https://8dl-garment-master-plan-webapi-dev.azurewebsites.net/v1/";
            // // var spMasterPlan = "https://dl-sp-master-plan-webapi-dev.mybluemix.net/v1/";
            // // var spinning = "https://com-ag-service-spinning-dev.azurewebsites.net/";
            // // var intPurchasing = "https://com-ag-service-internal-transfer-dev.azurewebsites.net/v1/";
            //  var customsReport = "https://com-ambassador-service-support-dev.azurewebsites.net/v1/";
            // // var merchandiser = "https://com-ag-service-md-dev.azurewebsites.net/v1/";
            // // const dealTracking = 'https://com-ag-service-deal-tracking-dev.azurewebsites.net/v1/';
            //  const sales = "https://com-ambassador-service-sales-v8.azurewebsites.net/v1/";
            // // var weaving = "https://com-ag-service-weaving-dev.azurewebsites.net/";
            //  var finance = "https://com-ambassador-service-finance-accounting-dev.azurewebsites.net/v1/";
            //  //bawah ini v8
            //  var garmentProduction = "http://localhost:53460/";

            //  //bawah ini v2
            //  //var garmentProduction = "http://localhost:57914/";

            // var packingInventory = "https://com-ambassador-service-packing-inventory-dev.azurewebsites.net/v1/";
            // // var dyeing = "https://dyeing-printing-etl-service-dev.azurewebsites.net/api/";
            // // const garmentShipping = "https://garment-etl-service-dev.azurewebsites.net/api/";
            // var ItInven = "https://it-inventory-etl-service.azurewebsites.net/api/";



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
            config.registerEndpoint('ItInven', ItInven, { headers: { Accept: '*/*', 'Sec-Fetch-Site': 'cross-site' }, mode: 'cors' });
        })
        .plugin("aurelia-authentication", baseConfig => {
            baseConfig.configure(authConfig);

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
    aurelia.setRoot('app');

    // if you would like your website to work offline (Service Worker), 
    // install and enable the @easy-webpack/config-offline package in webpack.config.js and uncomment the following code:
    /*
    const offline = await System.import('offline-plugin/runtime');
    offline.install();
    */
}