"use strict"
const express = require("express");
const routes = express();
const crmController = require("../controller/crm_controller");

routes.get("/fetch-all-user-details",crmController.allUserDetailsForCRM);
routes.get("/fetch-all-cleaner-details",crmController.allCleanerDetailsCRM);
routes.get("/fetch-user-profile",crmController.crmFetchUserProfile);
routes.get("/fetch-cleaner-profile",crmController.crmFetchCleanerProfile);


module.exports = routes;