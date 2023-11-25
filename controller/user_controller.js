"use strict"
const joi = require("joi");
const NodeGeocoder = require('node-geocoder');

const axios = require("axios");
const httpContext = require('express-http-context');
const path = require("path");
const fs = require("fs");

const { constantFilePath } = require("../utils/constant_file_path");
const response = require("../utils/api_response").response;
const businessModel = require("../model/business_model");
const { dbStatus } = require("../config");

let dataSet = {};


module.exports.insertUserNewCarDetails = async (req, resp) => {
    try {
        const validatedUserNewCarInfo = await validateUserNewCarInfo.validateAsync(req.body);
        const checkAlreadyInsertedCarInfo = await businessModel.fetchUserCarViaVehicleId(req.body.vehicle_id);
        if (checkAlreadyInsertedCarInfo.code === 500) {
            return resp.status(500).json(checkAlreadyInsertedCarInfo);
        }
        if (checkAlreadyInsertedCarInfo > 0) {
            dataSet = response(201, "Already Exists");
            return resp.status(201).json(dataSet);
        }
        // let config = {
        //     method : "post",
        //     url : process.env.RAPID_API_VEHICLE_DETAILS_API + "/GetRcdetails",
        //     headers : {
        //         'X-RapidAPI-Key' : process.env.RAPID_API_KEY,
        //         'X-RapidAPI-Host' : process.env.RAPID_API_HOST,
        //     },
        //     data : {
        //         rcnumber : req.body.vehicle_id
        //     }
        // }
        // console.log("config",config);
        // const response1 = await axios.request(config);
        // console.log("resposne",response1);

        // let data = JSON.stringify({
        //     "rcnumber": "KA19EQ1316"
        // });

        // let config = {
        //     method: 'post',
        //     maxBodyLength: Infinity,
        //     url: 'https://vehicle-details.p.rapidapi.com/V3/GetRcdetails',
        //     headers: {
        //         'content-type': 'application/json',
        //         'X-RapidAPI-Key': '2ca26b6689msh9de8b56178326e1p1cbac3jsnbf165ed754a6',
        //         'X-RapidAPI-Host': 'vehicle-details.p.rapidapi.com'
        //     },
        //     data: data
        // };

        // axios.request(config)
        //     .then((response) => {
        //         console.log(JSON.stringify(response.data));
        //     })
        //     .catch((error) => {
        //         console.log(error);
        //     });

        // let config2 = {
        //     method: "post",
        //     url: process.env.RAPID_API_VEHICLE_DETAILS_API + "/GetRcResult",
        //     headers: {
        //         'X-RapidAPI-Key': process.env.RAPID_API_KEY,
        //         'X-RapidAPI-Host': process.env.RAPID_API_HOST,
        //     },
        //     data: {
        //         request_id: response1.data.request_id
        //     }
        // }
        // const response2 = await axios.request(config2);
        // console.log("response", response2);
        // return false;
        req.body.owner_name = "Abhay Pipal";
        req.body.registeration_date = new Date();
        req.body.car_name = "Toyota Yaris";
        req.body.car_type = "HatchBack";
        req.body.steering = "Manual";
        req.body.color = "Black";
        req.body.fuel_type = "Petrol";
        req.body.insurance_expiry_date = new Date();
        req.body.insurance_company_name = "Indian Insurance Pvt. Ltd.";
        req.body.puc_expiry_date = new Date();
        req.body.puc_company_name = "Puc Indian Pvt. Ltd.";
        req.body.insurance_status = dbStatus.active;
        req.body.puc_status = dbStatus.expired;
        const insertUserNewCarDetails = await businessModel.insertUserNewCarInfo(req.body);
        if (insertUserNewCarDetails.code === 500) {
            return resp.status(500).json(insertUserNewCarDetails);
        }
        dataSet = response(200, "Inserted Successfully");
        resp.status(200).json(dataSet);
    } catch (e) {
        dataSet = response(422, "Error During Insert New User Car Details", e.message);
        resp.status(422).json(dataSet);
    }
}

module.exports.fetchUserAllSelectedLocation = async (req, resp) => {
    try {
        const fetchUserAllSelectedLocation = await businessModel.fetchUserAllLocation();
        if (fetchUserAllSelectedLocation.code === 500) {
            return resp.status(500).json(fetchUserAllSelectedLocation);
        }
        dataSet = response(200, "User All Selected Location", fetchUserAllSelectedLocation);
        resp.status(200).json(dataSet);
    } catch (e) {
        dataSet = response(422, "Error During Insert New User Car Details", e.message);
        resp.status(422).json(dataSet);
    }
}

module.exports.fetchAllActivePackageService = async (req, resp) => {
    try {
        const fetchAllActiveCarService = await businessModel.fetchAllActiveCarService();
        for (let i = 0; i < fetchAllActiveCarService.length; i++) {
            fetchAllActiveCarService[i].service_logo_path = process.env.IMAGE_BASE_URL + "/" + fetchAllActiveCarService[i].service_logo_path;
        }
        if (fetchAllActiveCarService.code === 500) {
            return resp.status(500).json(fetchAllActiveCarService);
        }
        if (fetchAllActiveCarService.length <= 0) {
            dataSet = response(422, "No Car Service Available");
            return resp.status(422).json(dataSet);
        }
        dataSet = response(200, "Car Service Listing", fetchAllActiveCarService);
        resp.status(200).json(dataSet);
        return;
    } catch (e) {
        dataSet = response(422, "Error In Fetching All Active Service");
        resp.status(422).json(dataSet);
    }
}




module.exports.fetchPackageAllCarType = async (req, resp) => {
    try {
        const fetchPackageInfo = await businessModel.fetchCarServicePackageInfo(req.query);
        if (fetchPackageInfo.code === 500) {
            return resp.status(500).json(fetchPackageInfo);
        }
        if (fetchPackageInfo.length <= 0) {
            dataSet = response(422, "There is No Package In this service", fetchPackageInfo);
            return resp.status(422).json(dataSet);
        }
        const fetchAllCarTypeInfo = await businessModel.fetchAllCarTypeViaIDsArr(fetchPackageInfo);
        if (fetchAllCarTypeInfo.code === 500) {
            return resp.status(500).json(fetchAllCarTypeInfo);
        }
        if (fetchAllCarTypeInfo.length > 0) {
            for (let i = 0; i < fetchAllCarTypeInfo.length; i++) {
                fetchAllCarTypeInfo[i].car_type_logo = process.env.IMAGE_BASE_URL + "/" + fetchAllCarTypeInfo[i].car_type_logo;
            }
        }
        dataSet = response(200, "Active Package Based Car Type Listing", fetchAllCarTypeInfo);
        resp.status(200).json(dataSet);
    } catch (e) {
        dataSet = response(422, "Error During Fetching All Type Cars Package", e.message);
        resp.status(422).json(dataSet);
    }
}

module.exports.fetchPackageAllShiftList = async (req, resp) => {
    try {
        const validateShiftQuery = await validatePackageShfitQuery.validateAsync(req.query);
        const fetchParticularPackageAllShift = await businessModel.fetchPackageShift(req.query);
        if (fetchParticularPackageAllShift.code === 500) {
            return resp.status(500).json(fetchParticularPackageAllShift);
        }
        if (fetchParticularPackageAllShift.length <= 0) {
            dataSet = response(422, "There is not Package in This service", fetchParticularPackageAllShift);
            return resp.status(422).json(dataSet);
        }
        const fetchActivePackageShift = await businessModel.fetchActivePackageShfit(fetchParticularPackageAllShift);
        if (fetchActivePackageShift.code === 500) {
            return resp.status(500).json(fetchActivePackageShift);
        }
        dataSet = response(200, "Active Pacakge Shift Time", fetchActivePackageShift);
        resp.status(200).json(dataSet);
    } catch (e) {
        dataSet = response(422, "Error During Fetching All Active Pacakge Shfit", e.message);
        resp.status(422).json(dataSet);
    }
}

module.exports.fetchParticularPackage = async (req, resp) => {
    try {
        //req.query.service_id,car_type_id,shift_time;
        const validatedPackageInfo = await validatePackageInfo.validateAsync(req.query);
        const fetchPackageShiftTimeId = await businessModel.fetchServiceShiftTimeIDViaKey(req.query.shift_time_key);
        if (fetchPackageShiftTimeId.code === 500) {
            return response(500).json(fetchPackageShiftTimeId);
        }
        const fetchParticularPackage = await businessModel.fetchParticularPackage(req.query, fetchPackageShiftTimeId._id);
        if (fetchParticularPackage.code === 500) {
            return resp.status(500).json(fetchParticularPackage);
        }
        dataSet = response(200, "Finally Done", fetchParticularPackage);
        resp.status(200).json(dataSet);
    } catch (e) {
        dataSet = response(422, "Error During Fetching Package Details", e.message);
        resp.status(422).json(dataSet);
    }
}

module.exports.fetchParticularPackageFeature = async (req, resp) => {
    try {
        // req.query.package_id;
        const fetchParticularPackageFeature = await businessModel.fetchParticularPackageFeature(req.query);
        if (fetchParticularPackageFeature.code === 500) {
            return resp.status(500).json(fetchParticularPackageFeature);
        }
        dataSet = response(200, "Pacakge Feature Listing", fetchParticularPackageFeature);
        resp.status(200).json(dataSet);
    } catch (e) {
        dataSet = response(422, "Error During Fetching Package Feature", e.message);
        resp.status(422).json(dataSet);
    }
}

// module.exports.fetchParticularCarTypePackage = async (req, resp) => {
//     try {
//         //req.query.car_type_package;
//         const fetchParticualarCarTypePackage = await businessModel.fetchParticualarCarTypePackage(req.query);
//         if (fetchParticualarCarTypePackage.code === 500) {
//             return resp.status(500).json(fetchParticualarCarTypePackage);
//         }
//         dataSet = response(200, "Particualar Car Type Package List", fetchParticualarCarTypePackage);
//         resp.status(200).json(dataSet);
//     } catch (e) {
//         dataSet = response(422, "Error During Fetching All Type Cars Package", e.message);
//         resp.status(422).json(dataSet);
//     }
// }

module.exports.fetchDurationWiseFeature = async (req, resp) => {
    try {
        //req.query=package_Id
        const fetchPackageAllFeatureList = await businessModel.fetchPackageAllFeatureList(req.query);
        if (fetchPackageAllFeatureList.code === 500) {
            return resp.status(500).json(fetchPackageAllFeatureList);
        }
        dataSet = response(200, "Particualar Car Type Package List", fetchPackageAllFeatureList);
        resp.status(200).json(dataSet);
    } catch (e) {
        dataSet = response(422, "Error Druing Fetchin All Package Feature", e.message);
        resp.status(422).json(dataSet);
    }
}

module.exports.buyPackageUser = async (req, resp) => {
    try {
        //req.body.package_Id,user_start_date,user_location
        const validatedUserBuyPackage = await validateUserBuyPackage.validateAsync(req.body);
        let userLocationId ;
        const fetchUserAddressExists = await businessModel.fetchUserAddressOnParticualrLatLong(req.body);
        if (fetchUserAddressExists.code === 500) {
            return resp.status(500).json(fetchUserAddressExists);
        }
        if (fetchUserAddressExists.length <= 0) {
            const options = {
                provider: process.env.GOOGLE_MAP_PROVIDER,
                httpAdapter: process.env.HTTP_ADAPTER_NODE_GEOCODER,
                apiKey: process.env.GOOGLE_MAP_API_KEY
            };
            const geoCoder = NodeGeocoder(options);
            const geoCode = await geoCoder.reverse({ lat: req.body.latitude, lon: req.body.longitude });
            // const arrayData = geoCodeAddress[0].formattedAddress.split(",");
            // req.body.countryName = arrayData[arrayData.length - 1];
            // req.body.stateName = arrayData[arrayData.length - 3];
            // req.body.pinCode = arrayData[arrayData.length - 2];
            // req.body.fullAddress = geoCodeAddress[0].formattedAddress;
            req.body.districtName = geoCode[0].city;
            req.body.countryName = geoCode[0].country;
            req.body.pinCode = geoCode[0].zipcode;
            req.body.stateName = geoCode[0]?.administrativeLevels?.level1long;
            const addUserNewAdderss = await businessModel.insertUserNewLocation(req.body);
            userLocationId =addUserNewAdderss._id;
            if (addUserNewAdderss.code === 500) {
                return resp.status(500).json(addUserNewAdderss);
            }
        }
        if(fetchUserAddressExists.length >0){
            userLocationId = fetchUserAddressExists[0]._id;
        }
        const fetchAllCleanerNearByWorking = await businessModel.fetchAllCleanerNearByWorking(req.body);
        if (fetchAllCleanerNearByWorking.code === 500) {
            return resp.status(500).json(fetchAllCleanerNearByWorking);
        }
        if (fetchAllCleanerNearByWorking.length <= 0) {
            dataSet = response(422, "For Now In this Area there is No Service Available");
            return resp.status(422).json(dataSet);
        }
        let cleanerUserDetails = fetchAllCleanerNearByWorking[0];
        for (let i = 1; i < fetchAllCleanerNearByWorking.length; i++) {
            if (fetchAllCleanerNearByWorking[i].active_jobs > cleanerUserDetails.active_jobs) {
                cleanerUserDetails = fetchAllCleanerNearByWorking[i];
            }
        }
        // const checkAllReadyBuyPackage = await businessModel.fetchUserBuiedPackage(req.body);
        // if (checkAllReadyBuyPackage.code === 500) {
        //     return resp.status(500).json(checkAllReadyBuyPackage);
        // }
        // if (checkAllReadyBuyPackage.length >= 0) {
        //     dataSet = response(422, "Already Buy Package");
        //     return resp.status(422).json(dataSet);
        // }
        const fetchPackageDetails = await businessModel.fetchPacakgeDetailsViaId(req.body.package_id);
        if (fetchPackageDetails.code === 500) {
            return resp.status(500).json(fetchPackageDetails);
        }
        if (fetchPackageDetails.package_period === "MONTHLY") {
            const currentDate = new Date();
            const expiryDate = currentDate.setMonth(currentDate.getMonth() + 1 + +fetchPackageDetails.package_period_duration);
            req.body.expiry_date = expiryDate;
        }
        if (fetchPackageDetails.package_period === "WEEKLY") {
            const currentDate = new Date();
            const expiryDate = currentDate.setDate(currentDate.getDate() + 7);
            req.body.expiry_date = expiryDate;
        }
        if (fetchPackageDetails.package_period === "DAILY") {
            const currentDate = new Date();
            const expiryDate = currentDate.setDate(currentDate.getDate() + 1);
            req.body.expiry_date = expiryDate;
        }
        if (fetchPackageDetails.package_period === "YEARLY") {
            const currentDate = new Date();
            const expiryDate = currentDate.setFullYear(currentDate.getFullYear() + 1);
            req.body.expiry_date = expiryDate;
        }
        const insertUserBuyNewPackage = await businessModel.insertNewBuyPackage(req.body, fetchPackageDetails, cleanerUserDetails,userLocationId);
        console.log("insertNewUserPbYpACKATE",insertUserBuyNewPackage);
        if (insertUserBuyNewPackage.code === 500) {
            return resp.status(500).json(insertUserBuyNewPackage);
        }
        const insertUserNewBooking = await businessModel.insertUserNewBooking(req.body, cleanerUserDetails.cleaner_id,insertUserBuyNewPackage._id);
        if (insertUserNewBooking.code === 500) {
            return resp.status(500).json(insertUserNewBooking);
        }
        dataSet = response(200, "Package Buy Successfully");
        resp.status(200).json(dataSet);
    } catch (e) {
        dataSet = response(422, "Error Druing Fetchin All Package Feature", e.message);
        resp.status(422).json(dataSet);
    }
}

module.exports.UserUpcomingBooking = async (req, resp) => {
    try {
        const fetchUserUpcomingBooking = await businessModel.fetchUserUpcomingBooking();
        if (fetchUserUpcomingBooking.code === 500) {
            return resp.status(500).json(fetchUserUpcomingBooking);
        }
        dataSet = response(200, "Fetch User Upcoming Booking", fetchUserUpcomingBooking);
        resp.status(200).json(dataSet);
    } catch (e) {
        dataSet = response(422, "Error Druing Fetching Upcoming Booking", e.message);
        resp.status(422).json(dataSet);
    }
}

module.exports.serviceBasedDiscountList = async (req, resp) => {
    try {
        const validatedDiscountQuery = await validateDiscountQueryInfo.validateAsync(req.query);
        const fetchServiceBasedDiscountDetails = await businessModel.fetchServiceBasedDiscountInfo(req.query);
        if (fetchServiceBasedDiscountDetails.code === 500) {
            return resp.status(500).json(fetchServiceBasedDiscountDetails);
        }
        dataSet = response(200, "Fetch Discount Details", fetchServiceBasedDiscountDetails);
        resp.status(200).json(dataSet);
    } catch (e) {
        dataSet = response(422, "Error During Fetching Discount Coupan Details", e.message);
        resp.status(422).json(dataSet);
    }
}

module.exports.fetchUserActivatedPackageList = async (req, resp) => {
    try {
        const fetchUserActivatedAllPackage = await businessModel.userActivatedAllPackageList();
        if (fetchUserActivatedAllPackage.code === 500) {
            return resp.status(500).json(fetchUserActivatedAllPackage);
        }
        if (fetchUserActivatedAllPackage.length > 0) {
            const getAllCarTypeIdsArr = fetchUserActivatedAllPackage.map((item, index) => {
                return item.car_type_id.toString();
            })
            const distinctCarTypeIdsArr = Array.from(new Set(getAllCarTypeIdsArr));
            const getAllServiceShiftTimeIdsArr = fetchUserActivatedAllPackage.map((item, index) => {
                return item.service_shift_time_id.toString();
            })
            const distinctServiceShiftTimeIdsArr = Array.from(new Set(getAllServiceShiftTimeIdsArr));
            const fetchCarTypeInfoList = await businessModel.fetchCarTypeInfoViaIdsArr(distinctCarTypeIdsArr);
            if (fetchCarTypeInfoList.code === 500) {
                return resp.status(500).json(fetchCarTypeInfoList);
            }
            if (fetchCarTypeInfoList.length <= 0) {
                dataSet = response(422, "Car Type List Not Exist");
                resp.status(422).json(dataSet);
            }
            const fetchServiceShiftTimeList = await businessModel.fetchServiceShiftTimeIdsArr(distinctServiceShiftTimeIdsArr);
            if (fetchServiceShiftTimeList.code === 500) {
                return resp.status(500).json(fetchCarTypeInfoList);
            }
            if (fetchServiceShiftTimeList.length <= 0) {
                dataSet = response(422, "Service Shift Time List Not Exist");
                resp.status(422).json(dataSet);
            }
            for (let i = 0; i < fetchUserActivatedAllPackage.length; i++) {
                const userParticularActivatedPackage = fetchUserActivatedAllPackage[i];
                const matchingCarTypeInfo = fetchCarTypeInfoList.find((item, index) => {
                    item._id.equals(fetchUserActivatedAllPackage[i].car_type_id);
                })
                if (matchingCarTypeInfo) {
                    userParticularActivatedPackage.car_type = matchingCarTypeInfo.car_type;
                }
                const matchingServiceShiftTimeInfo = fetchServiceShiftTimeList.find((item, index) => {
                    item._id.equals(userParticularActivatedPackage.service_shift_time_id);
                })
                if (matchingServiceShiftTimeInfo) {
                    userParticularActivatedPackage.shift = matchingServiceShiftTimeInfo.shift;
                }
            }
            // const getAllPackageIdsArr = fetchUserActivatedAllPackage.map((item,index)=>{
            //     return item.package_id.toString();
            // })
            // const fetchUserActivatedDistictPackage = Array.from(new Set(getAllPackageIdsArr));
            // const fetchUserPackageInfo = await businessModel.fetchUserAllBuyPacakgeInfo(fetchUserActivatedDistictPackage);
            // if(fetchUserPackageInfo.code === 500){
            //     return resp.status(500).json(fetchUserPackageInfo);
            // }
            // const getAllCarTypeIdsArr = fetchUserPackageInfo.map((item,index)=>{
            //     return item.car_type_id;
            // })
            // const getAllCarTypeIdsArrDistinct = Array.from(new Set(getAllCarTypeIdsArr));
            // const getAllServiceShiftTimeIdsArr = fetchUserPackageInfo.map((item,index) => {
            //     return item.service_shift_time_id;
            // })
            // const getAllServiceShiftTimeIdsArrDistinct = Array.from(new Set(getAllServiceShiftTimeIdsArr));
            // const fetchUserBuiedPackageCarTypeInfo = await businessModel.fetchCarTypeInfoViaIdsArr(getAllCarTypeIdsArrDistinct);
            // if(fetchUserBuiedPackageCarTypeInfo.code === 500){
            //     return resp.status(500).json(fetchUserBuiedPackageCarTypeInfo);
            // }
            // const fetchUserBuiedPackageServiceShiftTimeInfo = await businessModel.fetchServiceShiftTimeIdsArr(getAllServiceShiftTimeIdsArrDistinct);
            // if(fetchUserBuiedPackageServiceShiftTimeInfo.code === 500){
            //     return resp.status(500).json(fetchUserBuiedPackageServiceShiftTimeInfo);
            // }
            // for(let i=0;i<fetchUserActivatedAllPackage.length;i++){
            //     const eachUserActivatedPackage = fetchUserActivatedAllPackage[i];
            //     // const matchingServiceShiftTimeInfo = fetchUserBuiedPackageServiceShiftTimeInfo.find((item,index)=>)
            // }
        }
        dataSet = response(200, "User Activated All Package", fetchUserActivatedAllPackage);
        resp.status(200).json(dataSet);
    } catch (e) {
        dataSet = response(422, "Error During Fetching User Activated Package", e.message);
        resp.status(422).json(dataSet);
    }
}

module.exports.fetchTermAndCondition = async (req, resp) => {
    try {
        const fetchAllTermAndConditon = await businessModel.fetchAllTermAndCondition();
        if (fetchAllTermAndConditon.code === 500) {
            return resp.status(500).json(fetchAllTermAndConditon);
        }
        dataSet = response(200, "Fetch All Term And Condition", fetchAllTermAndConditon);
        resp.status(200).json(dataSet);
    } catch (e) {
        dataSet = response(422, "Error During Fetching Term And Condition", e.message);
        resp.status(422).json(dataSet);
    }
}

module.exports.fetchAllPrivacyPolicy = async (req, resp) => {
    try {
        const fetchAllPrivacyPolicy = await businessModel.fetchAllPrivacyPolicy();
        if (fetchAllPrivacyPolicy.code === 500) {
            return resp.status(500).json(fetchAllPrivacyPolicy);
        }
        dataSet = response(200, "Fetch All Privacy Policy", fetchAllPrivacyPolicy);
        resp.status(200).json(dataSet);
    } catch (e) {
        dataSet = response(422, "Error During Fetching Privacy Policy", e.message);
        resp.status(422).json(dataSet);
    }
}

module.exports.updateNewCarImage = async (req, resp) => {
    try {
        const loginDetails = httpContext.get("loginDetails");
        let imageFilePath;
        if (req.files.car_image) {
            const folderName = path.join(__dirname, "..", "assests", "user_car_image", loginDetails.login_id);
            if (!fs.existsSync(folderName)) {
                await fs.promises.mkdir(folderName);
            }
            const inputFile = req.files.car_image;
            const destFileName = Date.now() + ".jpg";
            imageFilePath = path.join("user_car_image", loginDetails.login_id, destFileName);
            const storeFilePath = path.join(constantFilePath, imageFilePath);
            await inputFile.mv(storeFilePath);
        }
        const updateCarImage = await businessModel.updateParticularUserParticularCarImage(req.body, imageFilePath);
        if (updateCarImage.code === 500) {
            return resp.status(500).json(updateCarImage);
        }
        dataSet = response(200, "Update Car Details Successfully");
        resp.status(200).json(dataSet);
    } catch (e) {
        dataSet = response(422, "Error During Fetching Discount Coupan Details", e.message);
        resp.status(422).json(dataSet);
    }
}


module.exports.insertDateTime = async (req, resp) => {
    try {
        const insertDateTime = await businessModel.insertDateAndTime(req.body);
        if (insertDateTime.code === 500) {
            return resp.status(500).json(insertDateTime);
        }
        dataSet = response(200, "Successfully Inserted");
        resp.status(200).json(dataSet);
    } catch (e) {
        dataSet = response(422, "Error During Insert Testing Date And Time", e.message);
        resp.status(422).json(dataSet);
    }
}

module.exports.testingDateTime = async (req, resp) => {
    try {
        const fetchDateTime = await businessModel.fetchDateAndTime(req.query);
        if (fetchDateTime.code === 500) {
            return resp.status(500).json(fetchDateTime);
        }
        dataSet = response(200, "FETCH dATE tiME", fetchDateTime);
        resp.status(200).json(dataSet);
    } catch (e) {
        dataSet = response(422, "Error During Fetch Data And Time Testing", e.message);
        resp.status(422).json(dataSet);
    }
}

module.exports.insertGeoLocation = async (req, resp) => {
    try {
        const insertGeoLocation = await businessModel.insertGeoLocation(req.body);
        if (insertGeoLocation.code === 500) {
            return resp.status(500).json(insertGeoLocation);
        }
        dataSet = response(200, "Inserted Successfully");
        resp.status(200).json(dataSet);
    } catch (e) {
        dataSet = response(422, "Error During Insert Geo Location", e.message);
        resp.status(422).json(dataSet);
    }
}

module.exports.testingGeoLocation = async (req, resp) => {
    try {
        const testingGeoLocation = await businessModel.testingFetchGeoLocationNearBy(req.query);
        if (testingGeoLocation.code === 500) {
            return resp.status(500).json(testingGeoLocation);
        }
        dataSet = response(200, "Fetched Successfully", testingGeoLocation);
        resp.status(200).json(dataSet);
    } catch (e) {
        dataSet = response(422, "Error During Testing Geo Location", e.message);
        resp.status(422).json(dataSet);
    }
}


const validateUserNewCarInfo = joi.object({
    vehicle_id: joi.string().required()
})

const validatePackageInfo = joi.object({
    service_id: joi.string().required(),
    car_type_id: joi.string().required(),
    shift_time_key: joi.string().required()
})

const validateUserBuyPackage = joi.object({
    latitude: joi.string().required(),
    longitude: joi.string().required(),
    package_id: joi.string().required(),
    start_date: joi.string().required(),
    start_time: joi.string().required(),
    end_time: joi.string().required(),
    user_car_details_id: joi.string().required(),
    shape: joi.string().required()
})

const validatePackageShfitQuery = joi.object({
    service_id: joi.string().required(),
    car_type_id: joi.string().required(),
})

const validateDiscountQueryInfo = joi.object({
    service_id: joi.string().required(),
    start_date: joi.string().required()
})