var generalRoutes = require("./general");
var masterRoutes = require("./master");
var inventoryRoutes = require("./inventory");
var publicRoutes = require("./public");
var purchasingRoutes = require("./purchasing");
var reportRoutes = require("./report");
var authRoutes = require("./auth");
var garmentPurchasingRoutes = require("./garment-purchasing");
var garmentMasterPlanRoutes = require("./garment-master-plan");
var migrationLog = require("./migration-log");
var garmentMasterPlanRoutes = require("./garment-master-plan");
var customsReportRoutes = require("./customs-report");
let expeditionRoutes = require("./expedition");
let merchandiserRoutes = require("./merchandiser");
let accountingRoutes = require("./accounting");
let garmentProductionRoutes = require("./garment-production");
let customs = require("./customs");
let garmentShippingRoutes = require("./garment-shipping");
let garmentSubconRoutes = require("./garment-subcon");
let garmentFinance = require("./garment-finance");
let garmentSampleRoutes = require("./garment-sample");

export default [].concat(
  publicRoutes,
  generalRoutes,
  masterRoutes,
  purchasingRoutes,
  inventoryRoutes,
  garmentPurchasingRoutes,
  garmentMasterPlanRoutes,
  garmentFinance,
  customsReportRoutes,
  authRoutes,
  expeditionRoutes,
  merchandiserRoutes,
  migrationLog,
  reportRoutes,
  accountingRoutes,
  garmentProductionRoutes,
  garmentShippingRoutes,
  garmentSubconRoutes,
  garmentSampleRoutes,
  customs,
);
