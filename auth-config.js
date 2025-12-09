export default {
    endpoint: "auth",
    configureEndpoints: ["auth", "core", "production-azure", "purchasing-azure", "inventory-azure", "customs-report", "sales", "finance", "garment-production", "packing-inventory", "attendance"],
    loginUrl: "authenticate",
    profileUrl: "me",

    authTokenType: "Bearer",
    accessTokenProp: "data",

    storageChangedReload: true
};
