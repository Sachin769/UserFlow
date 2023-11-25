"use strict"
const express = require("express");
const routes = express();
const businessAuth = require("../controller/business_auth");
const userController = require("../controller/user_controller");

routes.post("/new-registeration",businessAuth.verifyApiKey,businessAuth.insertNewRegisteration);
routes.post("/login",businessAuth.verifyApiKey,businessAuth.sendUserLoginOTP);
routes.post("/verify-mobile-no",businessAuth.verifyApiKey,businessAuth.verifyUserOTP);
routes.post("/update-profile",businessAuth.verifyApiKey,businessAuth.verifyUserToken,businessAuth.updateProfileUser);
routes.post("/insert-user-location",businessAuth.verifyApiKey,businessAuth.verifyUserToken,businessAuth.insertUserLocationAddress);
routes.post("/insert-user-car-details",businessAuth.verifyApiKey,businessAuth.verifyUserToken,userController.insertUserNewCarDetails);
routes.get("/user-profile",businessAuth.verifyApiKey,businessAuth.verifyUserToken,businessAuth.fetchUserProfile);
routes.get("/user-all-location",businessAuth.verifyApiKey,businessAuth.verifyUserToken,userController.fetchUserAllSelectedLocation);
routes.get("/user-all-car-details",businessAuth.verifyApiKey,businessAuth.verifyUserToken,businessAuth.fetchUserAllCarDetails);
routes.get("/particular-user-car-details",businessAuth.verifyApiKey,businessAuth.verifyUserToken,businessAuth.fetchParticularUserCarDetails);
routes.get("/all-active-service",businessAuth.verifyApiKey,businessAuth.verifyUserToken,userController.fetchAllActivePackageService);
routes.get("/all-types-car-listing",businessAuth.verifyApiKey,businessAuth.verifyUserToken,userController.fetchPackageAllCarType);
routes.get("/package-all-shift-listing",businessAuth.verifyApiKey,businessAuth.verifyUserToken,userController.fetchPackageAllShiftList);
routes.get("/fetch-particular-package",businessAuth.verifyApiKey,businessAuth.verifyUserToken,userController.fetchParticularPackage);
routes.get("/fetch-particular-package-feature-info",businessAuth.verifyApiKey,businessAuth.verifyUserToken,userController.fetchParticularPackageFeature);
// routes.get("/fetch-particular-car-type-packge",businessAuth.verifyApiKey,businessAuth.verifyUserToken,userController.fetchParticularCarTypePackage);
// routes.get("/fetch-duration-wise-feature",businessAuth.verifyApiKey,businessAuth.verifyUserToken,userController.fetchDurationWiseFeature);

routes.post("/user-buy-package",businessAuth.verifyApiKey,businessAuth.verifyUserToken,userController.buyPackageUser);
routes.get("/upcoming-booking",businessAuth.verifyApiKey,businessAuth.verifyUserToken,userController.UserUpcomingBooking);
routes.get("/service-based-discount-listing",businessAuth.verifyApiKey,businessAuth.verifyUserToken,userController.serviceBasedDiscountList);
// routes.get("/fetch-service-based-discount",businessAuth.verifyApiKey,businessAuth.verifyUserToken,userController.fetchServiceBasedDiscount);
routes.get("/user-bought-package-list",businessAuth.verifyApiKey,businessAuth.verifyUserToken,userController.fetchUserActivatedPackageList);

routes.get("/fetch-term-and-condition",businessAuth.verifyApiKey,businessAuth.verifyUserToken,userController.fetchTermAndCondition);
routes.get("/fetch-privacy-policy",businessAuth.verifyApiKey,businessAuth.verifyUserToken,userController.fetchAllPrivacyPolicy);


routes.post("/fake-insert-particular-car-image",businessAuth.verifyApiKey,businessAuth.verifyUserToken,userController.updateNewCarImage);
routes.post("/insert-date-time",userController.insertDateTime);
routes.get("/testing-date-time",userController.testingDateTime);
routes.post("/insret-testing-geo-location",userController.insertGeoLocation);
routes.get("/testing-geo-location",userController.testingGeoLocation);

module.exports = routes;