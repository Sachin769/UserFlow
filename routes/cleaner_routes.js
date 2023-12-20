"use strict"
const express = require("express");
const routes = express();
const businessAuth = require("../controller/business_auth");
const cleanerController = require("../controller/cleaner_controller");


routes.post("/new-registeration",businessAuth.createNewCleanerReg);
routes.post("/login",businessAuth.sendCleanerLoginOTP);
routes.post("/verify-otp",businessAuth.verifyCleanerOTP);
routes.post("/update-profile",businessAuth.verifyCleanerToken,businessAuth.updateProfileCleaner);
routes.post("/insert-or-update-cleaner-documents", businessAuth.verifyCleanerToken,businessAuth.insertOrUpdateCleanerDocuements);
routes.post("/insert-cleaner-bank-details",businessAuth.verifyCleanerToken,cleanerController.insertBankDetailsCleaner);
routes.post("/insert-cleaner-attendance",businessAuth.verifyCleanerToken,cleanerController.insertCleanerAttendance);
routes.get("/get-cleaner-particular-date-attendance",businessAuth.verifyCleanerToken,cleanerController.getCleanerParticularDateAttendance);
routes.get("/cleaner-upcoming-jobs",businessAuth.verifyCleanerToken,cleanerController.upcomingCleanerJobs);
routes.get("/cleaner-active-jobs-list",businessAuth.verifyCleanerToken,cleanerController.cleanerAllActiveJobs);
routes.get("/cleaner-particular-active-jobs",businessAuth.verifyCleanerToken,cleanerController.cleanerParticularActiveJobs);
routes.post("/insert-cleaner-start-work",businessAuth.verifyCleanerToken,cleanerController.insertCleanerStartWorking);
routes.post("/insert-start-working-image",businessAuth.verifyCleanerToken,cleanerController.updateStartingWorkImage);
routes.post("/insert-end-work-image",businessAuth.verifyCleanerToken,cleanerController.updateEndingWorkImage);
routes.post("/insert-cleaner-end-work",businessAuth.verifyCleanerToken,cleanerController.updateCleanerEndWork);
// routes.post("/insert-cleaner-work-progress",businessAuth.verifyApiKey,businessAuth.verifyCleanerToken,businessAuth.insertCleanerWorkProgress);

module.exports = routes;

