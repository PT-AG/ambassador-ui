var generalRoutes = require("./general");
var masterRoutes = require("./master");
var inventoryRoutes = require("./inventory");
var publicRoutes = require("./public");
var purchasingRoutes = require("./purchasing");
var authRoutes = require("./auth");
var garmentPurchasingRoutes = require("./garment-purchasing");
var garmentMasterPlanRoutes = require("./garment-master-plan");
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
  authRoutes,
  expeditionRoutes,
  merchandiserRoutes,
  accountingRoutes,
  garmentProductionRoutes,
  garmentShippingRoutes,
  garmentSubconRoutes,
  garmentSampleRoutes,
  customs,
);
