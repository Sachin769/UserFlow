"use strict"
const jwt = require("jsonwebtoken");
const joi = require("joi");
const CryptoJS = require("crypto-js");
const bcrypt = require('bcrypt');
const httpContext = require('express-http-context');
const NodeGeocoder = require('node-geocoder');
const path = require("path");


const businessModel = require("../model/business_model");
const response = require("../utils/api_response").response;
const { constantFilePath } = require("../utils/constant_file_path");
let dataSet = {};



module.exports.verifyApiKey = async (req, resp, next) => {
    try {
        const requestedApiKey = req.headers.cw_api_key;
        if (!(requestedApiKey)) {
            dataSet = response(422, 'Authorization code missing!', requestedApiKey);
            resp.status(422).json(dataSet);
            return;
        }
        let currentDate = new Date();
        currentDate = currentDate.getUTCDate() + '/' + (currentDate.getUTCMonth() + 1) + '/' + currentDate.getUTCFullYear();
        const apiKey = process.env.SERVER_API_KEY + currentDate;
        const decryptedApiKey = CryptoJS.AES.decrypt(requestedApiKey, process.env.SERVER_API_KEY_SALT).toString(CryptoJS.enc.Utf8);
        if (decryptedApiKey !== apiKey) {
            dataSet = response(422, 'Authorization Code Invalid!', req.headers.mq_api_key);
            resp.status(422).json(dataSet);
            return;
        }
        next();
    } catch (e) {
        dataSet = response(422, "Error During Verify Server Api", e.message);
        resp.status(422).json(dataSet);
    }
}

module.exports.verifyUserToken = async (req, resp, next) => {
    try {
        if (!(req.headers.authorization)) {
            dataSet = response(422, "Authorization Code is Missing");
            resp.status(422).json(dataSet);
            return;
        }
        const access_token = req.headers.authorization;
        const validateToken = jwt.verify(req.headers.authorization, process.env.ACCESS_TOKEN_SALT);
        const fetchUserProfile = await businessModel.fetchUserProfileViaId(validateToken.login_id);
        if (fetchUserProfile.code === 500) {
            return resp.status(500).json(fetchUserProfile);
        }
        if (access_token !== fetchUserProfile.access_token) {
            dataSet = response(422, "Invalid Token", access_token);
            resp.status(422).json(dataSet);
            return;
        }
        httpContext.set("loginDetails", validateToken);
        next();
    } catch (e) {
        dataSet = response(422, "Error During New User Registeration", e.message);
        resp.status(422).json(dataSet);
    }
}

module.exports.verifyCleanerToken = async (req, resp, next) => {
    try {
        if (!(req.headers.authorization)) {
            dataSet = response(422, "Authorization Code is Missing");
            resp.status(422).json(dataSet);
            return;
        }
        const access_token = req.headers.authorization;
        const validateToken = jwt.verify(req.headers.authorization, process.env.ACCESS_TOKEN_SALT);
        const fetchUserProfile = await businessModel.fetchCleanerProfileViaId(validateToken.login_id);
        if (fetchUserProfile.code === 500) {
            return resp.status(500).json(fetchUserProfile);
        }
        if (access_token !== fetchUserProfile.access_token) {
            dataSet = response(422, "Invalid Token", access_token);
            resp.status(422).json(dataSet);
            return;
        }
        httpContext.set("loginDetails", validateToken);
        next();
    } catch (e) {
        dataSet = response(422, "Error During Verify Cleaner Token");
        resp.status(422).json(dataSet);
    }
}


module.exports.fetchCountryList = async (req, resp) => {
    try {
        const fetchCountryList = await businessModel.fetchCountryList();
        if (fetchCountryList.code === 500) {
            return resp.status(500).json(fetchCountryList);
        }
        dataSet = response(200, "Country List", fetchCountryList);
        resp.status(200).json(dataSet);
    } catch (e) {
        dataSet = response(422, "Error During Fetch Country List");
        resp.status(422).json(dataSet);
    }
}

module.exports.fetchStateList = async (req, resp) => {
    try {
        const fetchStateList = await businessModel.fetchStateList(req.query);
        if (fetchStateList.code === 500) {
            return resp.status(500).json(fetchStateList);
        }
        dataSet = response(200, "Country List", fetchStateList);
        resp.status(200).json(dataSet);
    } catch (e) {
        dataSet = response(422, "Error During Fetch Country List", e.message);
        resp.status(422).json(dataSet);
    }
}

module.exports.fetchDistrictList = async (req, resp) => {
    try {
        const fetchDistrictList = await businessModel.fetchDistrictList(req.query);
        if (fetchDistrictList.code === 500) {
            return resp.status(500).json(fetchDistrictList);
        }
        dataSet = response(200, "Country List", fetchDistrictList);
        resp.status(200).json(dataSet);
    } catch (e) {
        dataSet = response(422, "Error During Particular Cleaner Information", e.message);
        resp.status(422).json(dataSet);
    }
}

module.exports.insertNewRegisteration = async (req, resp) => {
    try {
        const validatedUserReg = await validateNewUserReg.validateAsync(req.body);
        const fetchUserProfile = await businessModel.fetchUserProfileExist(req.body);
        if (fetchUserProfile.code === 500) {
            return resp.status(500).json(fetchUserProfile);
        }
        if (fetchUserProfile > 0) {
            dataSet = response(200, "Already Exists With Same Mobile Number");
            resp.status(200).json(dataSet);
            return;
        }
        // const timestamp = Date.now(); // Current timestamp in milliseconds
        // const random = Math.floor(Math.random() * 10000); // Random number between 0 and 9999
        // const uniqueNumber = (timestamp + random) % 10000; // Combine and limit to 4 digits
        // const fourDigitOTP = uniqueNumber.toString().padStart(4, '0');
        // req.body.mobile_otp = fourDigitOTP;
        // //third party send mobile otp here then add in req.body.mobile_otp
        req.body.mobile_otp = "1234";
        const insertNewUserReg = await businessModel.insertNewUser(req.body);
        if (insertNewUserReg.code === 500) {
            return resp.status(500).json(insertNewUserReg);
        }
        dataSet = response(200, "OTP is Sent To Your Registered Mobile No.");
        resp.status(200).json(dataSet);
    } catch (e) {
        dataSet = response(422, "Error During New User Registeration");
        resp.status(422).json(dataSet);
    }
}

module.exports.sendUserLoginOTP = async (req, resp) => {
    try {
        const validatedLoginOTP = await validateUserLoginOTP.validateAsync(req.body);
        const fetchUserExist = await businessModel.fetchUserProfile(req.body);
        if (fetchUserExist.code === 500) {
            return resp.status(500).json(fetchUserExist);
        }
        if (fetchUserExist.length <= 0) {
            dataSet = response(200, "Invalid Mobile No");
            return resp.status(200).json(dataSet);
        }
        // const timestamp = Date.now(); // Current timestamp in milliseconds
        // const random = Math.floor(Math.random() * 10000); // Random number between 0 and 9999
        // const uniqueNumber = (timestamp + random) % 10000; // Combine and limit to 4 digits
        // const fourDigitOTP = uniqueNumber.toString().padStart(4, '0');
        // req.body.mobile_otp = fourDigitOTP;
        // //third party send mobile otp here then add in req.body.mobile_otp
        //here third party send OTP to mobile no then add in req.body.mobile_otp
        req.body.mobile_otp = "1234";
        const updateOTP = await businessModel.updateUserOTP(fetchUserExist[0]._id, req.body);
        if (updateOTP.code === 500) {
            return resp.status(500).json(updateOTP);
        }
        dataSet = response(200, "OTP is Sent To Your Registered Email");
        resp.status(200).json(dataSet);
    } catch (e) {
        dataSet = response(422, "Error During User Login", e.message)
        resp.status(422).json(dataSet);
    }
}


module.exports.verifyUserOTP = async (req, resp) => {
    try {
        const validatedMobileOTP = await validateMobileOTP.validateAsync(req.body);
        const fetchUserProfile = await businessModel.fetchUserProfile(req.body);
        if (fetchUserProfile.code === 500) {
            return resp.status(500).json(fetchUserProfile);
        }
        if (fetchUserProfile.length <= 0) {
            dataSet = response(200, "Invalid Mobile No", req.body.mobile_no);
            return resp.status(200).json(dataSet);
        }
        if (req.body.mobile_otp !== fetchUserProfile[0].mobile_otp) {
            dataSet = response(200, "Invalid OTP", req.body.mobile_otp);
            resp.status(200).json(dataSet);
            return;
        }
        if (req.body.mobile_otp === fetchUserProfile[0].mobile_otp) {
            const token = jwt.sign({ login_id: fetchUserProfile[0]._id, mobile_no: fetchUserProfile[0].mobile_no }, process.env.ACCESS_TOKEN_SALT);
            const updateUserToken = await businessModel.updateTokenUser(fetchUserProfile[0]._id, token);
            if (updateUserToken.code === 500) {
                return resp.status(500).json(updateUserToken);
            }
            dataSet = response(200, "Registered Mobile Number Verified", { token });
            resp.status(200).json(dataSet);
            return;
        }
    } catch (e) {
        dataSet = response(422, "Error During Mobile OTP Matching", e.message);
        resp.status(422).json(dataSet);
    }
}

module.exports.updateProfileUser = async (req, resp) => {
    try {
        const validatedProfile = await validateUserProfile.validateAsync(req.body);
        const loginDetails = httpContext.get("loginDetails");
        let imageFilePath;
        if (req.files?.user_profile_photo) {
            const fileExtension = path.extname(req.files.user_profile_photo.name).toLowerCase();
            if (fileExtension === ".jpg" || fileExtension === ".jpeg" || fileExtension === ".png") {
                const inputFile = req.files.user_profile_photo;
                const destFileName = loginDetails.login_id + `${fileExtension}`;
                imageFilePath = path.join("user_profile_photo", destFileName);
                const storeFilePath = path.join(constantFilePath, imageFilePath);
                await inputFile.mv(storeFilePath);
            }
        }
        const updateProfile = await businessModel.updateProfileUserViaId(req.body, imageFilePath);
        if (updateProfile.code === 500) {
            return resp.status(500).json(updateProfile);
        }
        dataSet = response(200, "Profile Updated");
        resp.status(200).json(dataSet);
    } catch (e) {
        dataSet = response(422, "Error During Update User Profile", e.message);
        resp.status(422).json(dataSet);
    }
}

module.exports.insertUserLocationAddress = async (req, resp) => {
    try {
        const validatedUserLocation = await validateuserLocation.validateAsync(req.body);
        //here always one object should come because at starting precure that thing always check 100m within range or not.
        const checkAlreadyAddedLocation = await businessModel.checkAlreadyUserAddedLocation(req.body);
        if (checkAlreadyAddedLocation.code === 500) {
            return resp.status(500).json(checkAlreadyAddedLocation);
        }
        if (checkAlreadyAddedLocation.length > 0) {
            dataSet = response(422, "This Location Already Exist Near 50m", checkAlreadyAddedLocation);
            return resp.status(500).json(dataSet);
        }
        const options = {
            provider: process.env.GOOGLE_MAP_PROVIDER,
            httpAdapter: process.env.HTTP_ADAPTER_NODE_GEOCODER,
            apiKey: process.env.GOOGLE_MAP_API_KEY
        };
        const geoCoder = NodeGeocoder(options);
        const longitude = req.body.longitude;
        const latitude = req.body.latitude;
        const geoCode = await geoCoder.reverse({ lat: latitude, lon: longitude });
        req.body.districtName = geoCode[0].city;
        req.body.countryName = geoCode[0].country;
        req.body.pinCode = geoCode[0].zipcode;
        req.body.stateName = geoCode[0]?.administrativeLevels?.level1long;
        if (req.body.is_default === true) {
            //here always default location for particular user always comes only one object.
            const fetchIsAnyDefaultLocation = await businessModel.fetchUserDefaultLocation();
            if (fetchIsAnyDefaultLocation?.code === 500) {
                return resp.status(500).json(fetchIsAnyDefaultLocation);
            }
            if (fetchIsAnyDefaultLocation) {
                const updateUserLocationDefaultLocation = await businessModel.updateUserDefaultLocation(fetchIsAnyDefaultLocation._id);
                if (updateUserLocationDefaultLocation.code === 500) {
                    return resp.status(500).json(updateUserLocationDefaultLocation);
                }
            }
        }
        const insertUserNewLocation = await businessModel.insertUserNewLocation(req.body);
        if (insertUserNewLocation.code === 500) {
            return resp.status(500).json(insertUserNewLocation);
        }
        if (req.body.is_default === true) {
            const updateUserProfile = await businessModel.updateUserProfileAddress(req.body);
            if (updateUserProfile.code === 500) {
                return resp.status(500).json(updateUserProfile);
            }
        }
        dataSet = response(200, "User Location Added Successfully");
        resp.status(200).json(dataSet);
    } catch (e) {
        dataSet = response(422, "Error During Adding Location", e.message);
        resp.status(422).json(dataSet);
    }
}

module.exports.fetchUserProfile = async (req, resp) => {
    try {
        const fetchUserProfile = await businessModel.fetchUserProfileViaIds();
        if (fetchUserProfile.code === 500) {
            return resp.status(500).json(fetchUserProfile);
        }
        fetchUserProfile.profile_pic = process.env.IMAGE_BASE_URL + "/" + fetchUserProfile.profile_pic;
        dataSet = response(200, "User Profile", fetchUserProfile);
        resp.status(200).json(dataSet);
    } catch (e) {
        dataSet = response(422, "Error During Fetching User Profile", e.message);
        resp.status(422).json(dataSet);
    }
}

module.exports.fetchUserAllCarDetails = async (req, resp) => {
    try {
        const fetchUserAllCarDetails = await businessModel.fetchUserAllCarDetails();
        for (let i = 0; i < fetchUserAllCarDetails.length; i++) {
            const particularUserCarDetails = fetchUserAllCarDetails[i];
            if (particularUserCarDetails.car_image) {
                particularUserCarDetails.car_image = process.env.IMAGE_BASE_URL + "/" + particularUserCarDetails.car_image;
            }
        }
        if (fetchUserAllCarDetails.code === 500) {
            return resp.status(500).json(fetchUserAllCarDetails);
        }
        dataSet = response(200, "User All Car Details", fetchUserAllCarDetails);
        resp.status(200).json(dataSet);
    } catch (e) {
        dataSet = response(422, "Error During Fetching User All Car Details", e.message);
        resp.status(422).json(dataSet);
    }
}

module.exports.fetchParticularUserCarDetails = async (req, resp) => {
    try {
        const validatedParticularUserCarDetails = await validateParticularUserCarDetails.validateAsync(req.query);
        const fetchParticularUserCarDetails = await businessModel.fetchParticularUserCarDetails(req.query);
        if (fetchParticularUserCarDetails.code === 500) {
            return resp.status(500).json(fetchParticularUserCarDetails);
        }
        if (fetchParticularUserCarDetails?.car_image) {
            fetchParticularUserCarDetails.car_image = process.env.IMAGE_BASE_URL + "/" + fetchParticularUserCarDetails.car_image;
        }
        dataSet = response(200, "Particular User Particular Car Details", fetchParticularUserCarDetails);
        resp.status(200).json(dataSet);
    } catch (e) {
        dataSet = response(422, "Error During Fetching User All Car Details", e.message);
        resp.status(422).json(dataSet);
    }
}

module.exports.createNewCleanerReg = async (req, resp) => {
    try {
        const validatedNewCleaner = await validateNewCleaner.validateAsync(req.body);
        const checkCleanerAlreadyExist = await businessModel.fetchCleanerProfileExist(req.body);
        if (checkCleanerAlreadyExist.code === 500) {
            return resp.status(500).json(checkCleanerAlreadyExist);
        }
        if (checkCleanerAlreadyExist > 0) {
            dataSet = response(422, "Already Exists With Same Mobile Number");
            return resp.status(422).json(dataSet);
        }
        //third party send mobile otp req.body.mobile_otp;
        req.body.mobile_otp = "1234";
        const insertNewCleaner = await businessModel.insertNewCleaner(req.body);
        if (insertNewCleaner.code === 500) {
            return resp.status(500).json(insertNewCleaner);
        }
        dataSet = response(200, "OTP is Sent To Your Registered Mobile Number");
        resp.status(200).json(dataSet);
    } catch (e) {
        dataSet = response(422, "Error During New Cleanser Registered");
        resp.status(422).json(dataSet);
    }
}

module.exports.sendCleanerLoginOTP = async (req, resp) => {
    try {
        const validatedCleanerLogin = await validateCleanerLogin.validateAsync(req.body);
        const fetchCleanerProfile = await businessModel.fetchCleanerProfile(req.body);
        if (fetchCleanerProfile.code === 500) {
            return resp.status(500).json(fetchCleanerProfile);
        }
        if (fetchCleanerProfile.length <= 0) {
            dataSet = response(422, "Invalid Mobile No");
            return resp.status(422).json(dataSet);
        }
        // const timestamp = Date.now(); // Current timestamp in milliseconds
        // const random = Math.floor(Math.random() * 10000); // Random number between 0 and 9999
        // const uniqueNumber = (timestamp + random) % 10000; // Combine and limit to 4 digits
        // const fourDigitOTP = uniqueNumber.toString().padStart(4, '0');
        // req.body.mobile_otp = fourDigitOTP;
        //here third party to send mobile otp and add in req.body.mobile_otp
        req.body.mobile_otp = "1234"
        const updateCleanerProfile = await businessModel.udpateCleanerProfile(fetchCleanerProfile[0]._id, req.body);
        if (updateCleanerProfile.code === 500) {
            return resp.status(500).json(updateCleanerProfile);
        }
        dataSet = response(200, "OTP is Sent To Your Registered Mobile No.");
        resp.status(200).json(dataSet);
    } catch (e) {
        dataSet = response(422, "Error During Cleaner Login");
        resp.status(422).json(dataSet);
    }
}


module.exports.verifyCleanerOTP = async (req, resp) => {
    try {
        const validatedMobileOTP = await validateMobileOTP.validateAsync(req.body);
        const fetchCleanerProfile = await businessModel.fetchCleanerProfile(req.body);
        if (fetchCleanerProfile.code === 500) {
            return resp.status(500).json(fetchCleanerProfile);
        }
        if (fetchCleanerProfile.length <= 0) {
            dataSet = response(422, "Invalid Mobile No", req.body.mobile_no);
            resp.status(422).json(dataSet);
        }
        if (req.body.mobile_otp !== fetchCleanerProfile[0].mobile_otp) {
            dataSet = response(422, "Invalid OTP", req.body.mobile_otp);
            resp.status(422).json(dataSet);
            return;
        }
        if (req.body.mobile_otp === fetchCleanerProfile[0].mobile_otp) {
            const token = jwt.sign({ login_id: fetchCleanerProfile[0]._id, mobile_no: fetchCleanerProfile[0].mobile_no }, process.env.ACCESS_TOKEN_SALT);
            const updateUserToken = await businessModel.updateTokenCleaner(fetchCleanerProfile[0]._id, token);
            if (updateUserToken.code === 500) {
                return resp.status(500).json(updateUserToken);
            }
            dataSet = response(200, "Registered Mobile Number Verified", { token });
            resp.status(200).json(dataSet);
            return;
        }
    } catch (e) {
        dataSet = response(422, "Error During Verify OTP");
        resp.status(422).json(dataSet);
    }
}


module.exports.updateProfileCleaner = async (req, resp) => {
    try {
        const validatedCleanerProfile = await validateCleanerProfile.validateAsync(req.body);
        const loginDetails = httpContext.get("loginDetails");
        let imageFilePath;
        // let imageFilePath1;
        // let imageFilePath2;
        if (req.files?.cleaner_profile_photo) {
            const fileExtension = path.extname(req.files.cleaner_profile_photo.name).toLowerCase();
            if(fileExtension === ".png" || fileExtension === ".jpeg" || fileExtension === ".jpg"){
                const inputFile = req.files.cleaner_profile_photo;
                const destFileName = loginDetails.login_id + `${fileExtension}`;
                imageFilePath = path.join("cleaner_profile_photo", destFileName)
                const storeFilePath = path.join(constantFilePath, imageFilePath);
                await inputFile.mv(storeFilePath);
            }else{
                dataSet = response(422,"Please Upload Either PNG or JPG Image");
                return resp.status(422).json(dataSet);
            }

        //     const inputFile1 = req.files.cleaner_aadhar_doc;
        //     const destFileName1 = loginDetails.login_id + ".jpg";
        //     imageFilePath1 = path.join("cleaner_aadhar_card_doc", destFileName1)
        //     const storeFilePath1 = path.join(constantFilePath, imageFilePath1);
        //     await inputFile1.mv(storeFilePath1);

        //     const inputFile2 = req.files.cleaner_pan_card_doc;
        //     const destFileName2 = loginDetails.login_id + ".jpg";
        //     imageFilePath2 = path.join("cleaner_pan_card_doc", destFileName2)
        //     const storeFilePath2 = path.join(constantFilePath, imageFilePath2);
        //     await inputFile2.mv(storeFilePath2);
        }else{
            dataSet = response(422,"Invalid Profile Image");
            return resp.status(422).json(dataSet);
        }
        const updateProfile = await businessModel.updateProfileCleanerViaId(req.body, imageFilePath);
        if (updateProfile.code === 500) {
            return resp.status(500).json(updateProfile);
        }
        dataSet = response(200, "Profile Updated");
        resp.status(200).json(dataSet);
    } catch (e) {
        dataSet = response(422, "Error During Update Cleaner Profile",e.message);
        resp.status(422).json(dataSet);
    }
}

module.exports.insertOrUpdateCleanerDocuements = async (req,resp) => {
    try{
        const validatedClenaerDocuments = await validateClenaerDocuments.validateAsync(req.body);
        //here updation query still pending
        let imageFilePathAadhar;
        let imageFilePathPan;
        if(req.files?.aadhar_doc_file){
            const fileExtension = path.extname(req.files.aadhar_doc_file.name);
            const inputFile1 = req.files.aadhar_doc_file;
            const destFileName1 = loginDetails.login_id + `${fileExtension}`;
            imageFilePathAadhar = path.join("cleaner_aadhar_card_doc", destFileName1)
            const storeFilePath1 = path.join(constantFilePath, imageFilePathAadhar);
            await inputFile1.mv(storeFilePath1);
        }
        if(req.files?.pan_doc_file){
            const fileExtension = path.extname(req.files.pan_doc_file.name);
            const inputFile1 = req.files.pan_doc_file;
            const destFileName1 = loginDetails.login_id + `${fileExtension}`;
            imageFilePathPan = path.join("cleaner_pan_card_doc", destFileName1)
            const storeFilePath1 = path.join(constantFilePath, imageFilePathPan);
            await inputFile1.mv(storeFilePath1);
        }
        const insertClenaerDocument = await businessModel.insertCleanerDocuments(req.body,imageFilePathAadhar,imageFilePathPan);
        if(insertClenaerDocument.code === 500){
            return resp.status(500).json(insertClenaerDocument);
        }
        dataSet = response(200,"Inserted Clenaer Documents Successfully");
        resp.status(200).json(dataSet);
    }catch(e){
        dataSet = response(422,"Error During Insert Or Update Cleaner Documents",e.message);
        resp.status(422).json(dataSet);
    }
}



const validateNewUserReg = joi.object({
    first_name: joi.string().required(),
    last_name: joi.string().required(),
    mobile_no: joi.string().length(10).required(),
})

const validateMobileOTP = joi.object({
    mobile_no: joi.string().length(10).required(),
    mobile_otp: joi.string().length(4).required()
})

const validateUserLoginOTP = joi.object({
    mobile_no: joi.string().length(10).required()
})

const validateUserProfile = joi.object({
    first_name: joi.string().required(),
    last_name: joi.string().required(),
    email: joi.string().required()
})

const validateNewCleaner = joi.object({
    first_name: joi.string().required(),
    last_name: joi.string().required(),
    mobile_no: joi.string().length(10).required()
})

const validateCleanerLogin = joi.object({
    mobile_no: joi.string().length(10).required()
})

const validateCleanerProfile = joi.object({
    first_name: joi.string().required(),
    last_name: joi.string().required(),
    // mobile_no: joi.string().length(10).required(),
    email: joi.string().required(),
    full_address: joi.string().required(),
    state_id: joi.string().required(),
    state_name: joi.string().required(),
    district_id: joi.string().required(),
    district_name: joi.string().required(),
    pincode: joi.string().required()
    // aadhar_number: joi.string().required(),
    // pan_number: joi.string().required()
})

const validateClenaerDocuments = joi.object({
    aadhar_no : joi.string().required(),
    pan_no: joi.string().required()
})

const validateuserLocation = joi.object({
    longitude: joi.number().required(),
    latitude: joi.number().required(),
    full_address: joi.string().required(),
    address_nickname: joi.string().required(),
    is_default: joi.boolean().required(),
    shape: joi.string().required()
})

const validateParticularUserCarDetails = joi.object({
    vehicle_id: joi.string().required()
})