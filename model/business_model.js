"use strict"
require("../connections/mongodb");
const httpContext = require('express-http-context');
const { response } = require("../utils/api_response");
const { dbStatus, AMorPM } = require("../config");
const dbSchema = require("./db_schema");
const { default: mongoose } = require("mongoose");



module.exports.insertNewAdminLogin = async (req, resp) => {
    try {
        const insertedObject = new dbSchema.AdminLogin({
            full_name: req.full_name,
            email: req.email,
            mobile_no: req.mobile_no,
            password: req.password,
            admin_type: req.admin_type,
        })
        const insertQuery = insertedObject.save();
        return insertQuery;
    } catch (e) {
        return response(500, "Something Went Wrong", e.message);
    }
}

module.exports.fetchAdminLoginInfoViaEmail = async (req, resp) => {
    try {
        const filter = {
            email: req.email
        }
        const fetchQuery = await dbSchema.AdminLogin.find(filter).lean();
        return fetchQuery;
    } catch (e) {
        return response(500, "Something Went Wrong", e.message);
    }
}

module.exports.updateAdminToken = async (adminLoginId, token, resp) => {
    try {
        const filter = {
            _id: adminLoginId
        }
        const update = {
            access_token: token,
            modified_date: new Date()
        }
        const options = {
            new: true
        }
        const updateQueryViaId = await dbSchema.AdminLogin.findByIdAndUpdate(filter, update, options);
        return updateQueryViaId;
    } catch (e) {
        return response(500, "Something Went Wrong", e.message);
    }
}

module.exports.fetchAdminLoginViaId = async (adminLoginId, resp) => {
    try {
        const filter = {
            _id: adminLoginId,
        }
        const fetchQueryById = await dbSchema.AdminLogin.findById(filter);
        return fetchQueryById;
    } catch (e) {
        return response(500, "Error In Modal", e.message);
    }
}

module.exports.fetchAdminUserList = async (req, resp) => {
    try {
        const filter = {
            is_active: true
        }
        const descendingOrder = {
            added_date: -1,
            id: -1
        }
        const itemsPerPage = req.items_per_page;
        const currentPage = req.current_page;
        const totalCount = await dbSchema.UserRegisteration.countDocuments(filter);
        const totalPage = Math.ceil(totalCount / itemsPerPage);
        const fetchQuery = await dbSchema.UserRegisteration.find(filter).sort(descendingOrder).skip((currentPage) * itemsPerPage).limit(itemsPerPage).lean();
        const fetchQueryExplain = await dbSchema.UserRegisteration.find(filter).sort(descendingOrder).skip((currentPage) * itemsPerPage).limit(itemsPerPage).lean().explain("executionStats");

        return {
            data: fetchQuery,
            total_page: totalPage
        };
    } catch (e) {
        return response(500, "Error In Modal", e.message);
    }
}

module.exports.fetchAdminCleanerList = async (req, resp) => {
    try {
        const filter = {
            is_active: true
        }
        const descendingOrder = {
            added_date: -1,
            id: -1
        }
        const itemsPerPage = req.items_per_page;
        const currentPage = req.current_page;
        const totalCount = await dbSchema.CleanerProfile.countDocuments(filter);
        const totalPage = Math.ceil(totalCount / itemsPerPage);
        const fetchQuery = await dbSchema.CleanerProfile.find(filter).sort(descendingOrder).skip((currentPage) * itemsPerPage).limit(itemsPerPage).lean();
        return {
            data: fetchQuery,
            total_page: totalPage
        };
    } catch (e) {
        return response(500, "Error In Modal", e.message);
    }
}

module.exports.fetchCleanerNearLocated = async (req, resp) => {
    try {
        const maxDistance = +process.env.CLEANER_LOCATION_WITHIN;
        const fetchQuery = await dbSchema.AdminCleanerWorkingLocation.find({ location: { $nearSphere: { $geometry: { type: "Point", coordinates: [req.longitude, req.latitude] }, $maxDistance: maxDistance } } }).lean();
        return fetchQuery;
    } catch (e) {
        return response(500, "Error In Modal", e.message);
    }
}

module.exports.fetchParticularMasterServiceExist = async (serviceKey, resp) => {
    try {
        const filter = {
            key: serviceKey
        }
        const fetchQuery = await dbSchema.MasterServiceTable.countDocuments(filter).lean();
        return fetchQuery;
    } catch (e) {
        return response(500, "Error In Modal", e.message);
    }
}

module.exports.insertNewService = async (req, service_logo_path, resp) => {
    try {
        const loginDetails = httpContext.get("loginDetails");
        const insertedObject = new dbSchema.MasterServiceTable({
            admin_id: loginDetails.login_id,
            service_name: req.service_name,
            service_logo_path: service_logo_path,
            // key: req.key,
            added_by: loginDetails.login_id,
            modified_by: loginDetails.login_id
        })
        const insertQuery = await insertedObject.save();
        return insertQuery;
    } catch (e) {
        return response(500, "Error In Modal", e.message);
    }
}

module.exports.fetchMasterCarTypesViaKey = async (masterCarTypesKey, resp) => {
    try {
        const filter = {
            key: masterCarTypesKey
        }
        const fetchQuery = await dbSchema.MasterCarTypes.countDocuments(filter).lean();
        return fetchQuery;
    } catch (e) {
        return response(500, "Error In Modal", e.message);
    }
}

module.exports.insertNewCarTypes = async (req, car_type_logo, resp) => {
    try {
        const loginDetails = httpContext.get("loginDetails");
        const insertedObject = new dbSchema.MasterCarTypes({
            admin_id: loginDetails.login_id,
            car_type: req.car_type,
            car_type_logo: car_type_logo,
            // key: req.key,
            added_by: loginDetails.login_id,
            modified_by: loginDetails.login_id
        })
        const insertQuery = await insertedObject.save();
        return insertQuery;
    } catch (e) {
        return response(500, "Error In Modal", e.message);
    }
}

module.exports.fetchMasterDayShiftViaKeyAndTime = async (req, resp) => {
    try {
        console.log("req.in modal",req);
        console.log("forme ",new Date(req.from_time));
        const filter = {
            // key: req.key,
            am_or_pm: req.am_or_pm,
            $or: [
                { from_time: { $lte: new Date(req.from_time) }, to_time: { $gte: new Date(req.from_time) } },
                { from_time: { $lte: new Date(req.to_time) }, to_time: { $gte: new Date(req.to_time) } }
            ],
            is_active: true
            // $and: [
            //     { from_time: { $gte: new Date(req.from_time) } },
            //     { to_time: { $lte: new Date(req.to_time) } },
            // ],
        }
        const fetchQuery1 = await dbSchema.MasterServiceShiftTime.find(filter).lean();
        console.log("fetchQuery1",fetchQuery1);
        const fetchQuery = await dbSchema.MasterServiceShiftTime.countDocuments(filter).lean();
        console.log("fetchQuery",fetchQuery);
        return fetchQuery;
    } catch (e) {
        return response(500, "Error In Modal", e.message);
    }
}

module.exports.insertNewDayShift = async (req, resp) => {
    try {
        const loginDetails = httpContext.get("loginDetails");
        const insertedObject = new dbSchema.MasterServiceShiftTime({
            admin_id: loginDetails.login_id,
            shift: req.shift,
            from_time: req.from_time,
            to_time: req.to_time,
            am_or_pm: req.am_or_pm,
            key: req.key,
            added_by: loginDetails.login_id,
            modified_by: loginDetails.login_id,
        })
        const insertQuery = await insertedObject.save();
        return insertQuery;
    } catch (e) {
        return response(500, "Error In Modal", e.message);
    }
}

module.exports.fetchParticularPackageExists = async (req, resp) => {
    try {
        const filter = {
            service_id: req.service_id,
            car_type_id: req.car_type_id,
            service_shift_time_id: req.service_shift_time_id,
            package_period: req.package_period,
            package_period_duration: req.package_period_duration,
        }
        const fetchQuery = await dbSchema.AdminCreatePackages.countDocuments(filter).lean();
        return fetchQuery;
    } catch (e) {
        return response(500, "Error In Modal", e.message);
    }
}

module.exports.createAdminNewPackage = async (req, resp) => {
    try {
        const loginDetails = httpContext.get("loginDetails");
        const insertedObject = new dbSchema.AdminCreatePackages({
            service_id: req.service_id,
            car_type_id: req.car_type_id,
            service_shift_time_id: req.service_shift_time_id,
            package_period: req.package_period,
            package_period_duration: req.package_period_duration,
            price: req.price,
            added_by: loginDetails.login_id,
            modified_by: loginDetails.login_id
        })
        const insertQuery = await insertedObject.save();
        return insertQuery;
    } catch (e) {
        return response(500, "Error In Modal", e.message);
    }
}

module.exports.insertAllFeatureArr = async (req, resp) => {
    try {
        const insertAllFeatureQuery = await dbSchema.AdminPackageFeature.insertMany(req);
        return insertAllFeatureQuery;
    } catch (e) {
        return response(500, "Error In Modal", e.message);
    }
}

module.exports.updateParticularFeature = async (req, resp) => {
    try {
        const loginDetails = httpContext.get("loginDetails");
        const filter = {
            _id: req.feature_id
        }
        const update = {
            feature_info: req.feature_info,
            modified_by: loginDetails.login_id,
            modified_date: new Date()
        }
        const options = {
            new: true
        }
        const updateQuery = await dbSchema.AdminPackageFeature.findByIdAndUpdate(filter, update, options);
        return updateQuery;
    } catch (e) {
        return response(500, "Error In Modal", e.message);
    }
}

module.exports.insertParticularPackageNewFeature = async (req, resp) => {
    try {
        const loginDetails = httpContext.get("loginDetails");
        const insertedObject = new dbSchema.AdminPackageFeature({
            package_id: req.package_id,
            feature_info: req.feature_info,
            added_by: loginDetails.login_id,
            modified_by: loginDetails.login_id
        })
        const insertQuery = await insertedObject.save();
        return insertQuery;
    } catch (e) {
        return response(500, "Error In Modal", e.message);
    }
}

module.exports.deleteParticularPackageParticularFeature = async (req, resp) => {
    try {
        const filter = {
            _id: req.feature_id
        }
        const update = {
            status: dbStatus.deleted
        }
        const options = {
            new: true
        }
        const updateQuery = await dbSchema.AdminPackageFeature.findByIdAndUpdate(filter, update, options);
        return updateQuery;
    } catch (e) {
        return response(500, "Error In Modal", e.message);
    }
}

module.exports.insertPkgNewFeature = async (req, resp) => {
    try {
        const loginDetails = httpContext.get("loginDetails");
        const insertedObject = new dbSchema.AdminPackageFeature({
            package_id: req.package_id,
            feature_info: req.feature_info,
            added_by: loginDetails.login_id,
            modified_by: loginDetails.login_id
        })
        const insertQuery = await insertedObject.save();
        return insertQuery;
    } catch (e) {
        return response(500, "Error In Modal", e.message);
    }
}

module.exports.fetchAllServiceList = async (req, resp) => {
    try {
        const filter = {
            is_active: true
        }
        const fetchQuery = await dbSchema.MasterServiceTable.find(filter);
        return fetchQuery;
    } catch (e) {
        return response(500, "Error In Modal", e.message);
    }
}

module.exports.fetchAllCarTypeList = async (req, resp) => {
    try {
        const filter = {
            is_active: true
        }
        const fetchQuery = await dbSchema.MasterCarTypes.find(filter);
        return fetchQuery;
    } catch (e) {
        return response(500, "Error In Modal", e.message);
    }
}

module.exports.fetchAllPossibleDayTimeList = async (req, resp) => {
    try {
        const filter = {
            is_active: true
        }
        const fetchQuery = await dbSchema.MasterServiceShiftTime.find(filter);
        return fetchQuery;
    } catch (e) {
        return response(500, "Error In Modal", e.message);
    }
}

module.exports.fetchAllPackageList = async (req, resp) => {
    try {
        const filter = {
            is_active: true
        }
        const fetchQuery = await dbSchema.AdminCreatePackages.find(filter).lean();
        return fetchQuery;
    } catch (e) {
        return response(500, "Error In Modal", e.message);
    }
}

module.exports.fetchServiceName = async (req, resp) => {
    try {
        const filter = {
            _id: { $in: req }
        }
        const fetchQuery = await dbSchema.MasterServiceTable.find(filter).select("service_name").lean();
        return fetchQuery;
    } catch (e) {
        return response(500, "Error In Modal", e.message);
    }
}

module.exports.fetchCarTypeName = async (req, resp) => {
    try {
        const filter = {
            _id: { $in: req }
        }
        const fetchQuery = await dbSchema.MasterCarTypes.find(filter).select("car_type").lean();
        return fetchQuery;
    } catch (e) {
        return response(500, "Error In Modal", e.message);
    }
}

module.exports.fetchServiceShiftTime = async (req, resp) => {
    try {
        const filter = {
            _id: { $in: req }
        }
        const fetchQuery = await dbSchema.MasterServiceShiftTime.find(filter).select("shift").lean();
        return fetchQuery;
    } catch (e) {
        return response(500, "Error In Modal", e.message);
    }
}

module.exports.fetchParticularPacakgeDetails = async (req, resp) => {
    try {
        const filter = {
            _id: req.package_id
        }
        const fetchQuery = await dbSchema.AdminCreatePackages.findById(filter).lean();
        return fetchQuery;
    } catch (e) {
        return response(500, "Error In Modal", e.message);
    }
}

module.exports.fetchParticularPackageServiceName = async (serviceId, resp) => {
    try {
        const filter = {
            _id: serviceId
        }
        const fetchQuery = await dbSchema.MasterServiceTable.findById(filter).select("service_name").lean();
        return fetchQuery;
    } catch (e) {
        return response(500, "Error In Modal", e.message);
    }
}

module.exports.fetchParticularPacakgeCarTypeName = async (carTypeId, resp) => {
    try {
        const filter = {
            _id: carTypeId
        }
        const fetchQuery = await dbSchema.MasterCarTypes.findById(filter).select("car_type").lean();
        return fetchQuery;
    } catch (e) {
        return response(500, "Error In Modal", e.message);
    }
}

module.exports.fetchParticularShiftTimeName = async (serviceShiftTimeId, resp) => {
    try {
        const filter = {
            _id: serviceShiftTimeId,
        }
        const fetchQuery = await dbSchema.MasterServiceShiftTime.findById(filter).select("shift").lean();
        return fetchQuery;
    } catch (e) {
        return response(500, "Error In Modal", e.message);
    }
}

module.exports.fetchPackageFeatureList = async (req, resp) => {
    try {
        const filter = {
            package_id: req.package_id,
            status: dbStatus.active
        }
        const fetchQuery = await dbSchema.AdminPackageFeature.find(filter).lean();
        return fetchQuery;
    } catch (e) {
        return response(522, "Error In Modal", e.message);
    }
}


module.exports.insertCleanerNewWorkingLocation = async (req, resp) => {
    try {
        const loginDetails = httpContext.get("loginDetails");
        const insertedObject = new dbSchema.AdminCleanerWorkingLocation({
            admin_id: loginDetails.login_id,
            cleaner_id: req.cleaner_id,
            location: {
                type: req.shape,
                coordinates: [req.longitude, req.latitude]
            },
            service_shift_time_id : req.service_shift_time_id,
            country_name: req.countryName,
            state_name: req.stateName,
            district_name: req.districtName,
            pin_code: req.pinCode,
            full_address: req.full_address,
            added_by: loginDetails.login_id,
            modified_by: loginDetails.login_id,
        });
        const insertQuery = await insertedObject.save();
        return insertQuery;
    } catch (e) {
        return response(500, "Error In Modal", e.message);
    }
}

module.exports.insertNewUser = async (req, resp) => {
    try {
        const insertedObject = new dbSchema.UserRegisteration({
            first_name: req.first_name,
            last_name: req.last_name,
            mobile_no: req.mobile_no,
            mobile_otp: req.mobile_otp
        })
        const insertQuery = await insertedObject.save();
        return insertQuery;
    } catch (e) {
        return response(500, "Error In Modal", e.message);
    }
}

module.exports.fetchUserProfileExist = async (req, resp) => {
    try {
        const filter = {
            mobile_no: req.mobile_no,
            is_active: true
        }
        const fetchQuery = await dbSchema.UserRegisteration.countDocuments(filter).lean();
        return fetchQuery;
    } catch (e) {
        return response(500, "Error In Modal", e.message);
    }
}

module.exports.fetchUserProfile = async (req, resp) => {
    try {
        const filter = {
            mobile_no: req.mobile_no,
            is_active: true
        }
        const fetchQuery = await dbSchema.UserRegisteration.find(filter).lean();
        return fetchQuery;
    } catch (e) {
        return response(500, "Error In Modal", e.message);
    }
}

module.exports.fetchUserProfileViaId = async (userProfileId, resp) => {
    try {
        const filter = {
            _id: userProfileId
        }
        const fetchQueryViaId = await dbSchema.UserRegisteration.findById(filter).lean();
        return fetchQueryViaId;
    } catch (e) {
        return response(500, "Error In Modal", e.message);
    }
}

module.exports.fetchUserProfileViaIds = async (userProfileId, resp) => {
    try {
        const loginDetails = httpContext.get("loginDetails");
        const filter = {
            _id: loginDetails.login_id
        }
        const fetchQueryViaId = await dbSchema.UserRegisteration.findById(filter).select("_id first_name last_name country_code mobile_no mobile_otp is_mobile_verified status is_active added_date modified_date __v access_token email profile_pic").lean();
        return fetchQueryViaId;
    } catch (e) {
        return response(500, "Error In Modal", e.message);
    }
}

module.exports.fetchUserTotalAddress = async (req, resp) => {
    try {
        const loginDetails = httpContext.get("loginDetails");
        const filter = {
            user_id: loginDetails.login_id,
            status: dbStatus.active,
            is_active: true
        }
        const fetchQuery = await dbSchema.UserLocation.countDocuments(filter).lean();
        return fetchQuery;
    } catch (e) {
        return response(500, "Error In Modal", e.message);
    }
}

module.exports.fetchTotalUserCars = async (req, resp) => {
    try {
        const loginDetails = httpContext.get("loginDetails");
        const filter = {
            user_id: loginDetails.login_id,
            status: dbStatus.active,
            is_active: true
        }
        const fetchQuery = await dbSchema.UserCarDetails.countDocuments(filter).lean();
        return fetchQuery;
    } catch (e) {
        return response(500, "Error In Modal", e.message);
    }
}

module.exports.fetchUserAllCarDetails = async (req, resp) => {
    try {
        const loginDetails = httpContext.get("loginDetails");
        const filter = {
            user_id: loginDetails.login_id
        }
        const fetchQuery = await dbSchema.UserCarDetails.find(filter).select("vehicle_id owner_name registeration_date car_name car_image").lean();
        return fetchQuery;
    } catch (e) {
        return response(500, "Error In Modal", e.message);
    }
}

module.exports.fetchParticularUserCarDetails = async (req, resp) => {
    try {
        const loginDetails = httpContext.get("loginDetails");
        const filter = {
            user_id: loginDetails.login_id,
            vehicle_id: req.vehicle_id,
            status: dbStatus.active,
            is_active: true
        }
        const fetchQuery = await dbSchema.UserCarDetails.findOne(filter).lean();
        return fetchQuery;
    } catch (e) {
        return response(500, "Error In Modal", e.message);
    }
}

module.exports.fetchParticularUserAllCarDetails = async (req, resp) => {
    try {
        const loginDetails = httpContext.get("loginDetails");
        const filter = {
            user_id: req.user_id,
        }
        const fetchQuery = await dbSchema.UserCarDetails.find(filter).lean();
        return fetchQuery;
    } catch (e) {
        return response(500, "Error In Modal", e.message);
    }
}

module.exports.fetchParticularCleanerProfile = async (req, resp) => {
    try {
        const filter = {
            _id: req.cleaner_id,
        }
        const fetchQueryViaId = await dbSchema.CleanerProfile.findById(filter).lean();
        return fetchQueryViaId;
    } catch (e) {
        return response(500, "Error In Modal", e.message);
    }
}

module.exports.fetchParticularCleanerAssignedInfo = async (req, resp) => {
    try {
        const filter = {
            cleaner_id: req.cleaner_id
        }
        const fetchQuery = await dbSchema.AdminCleanerWorkingLocation.find(filter).lean();
        return fetchQuery;
    } catch (e) {
        return response(500, "Error In Modal", e.message);
    }
}

module.exports.fetchCountryList = async (req, resp) => {
    try {
        const filter = {
            status: "Active"
        }
        const fetchQuery = await dbSchema.AdminCountryTable.find(filter).lean();
        return fetchQuery;
    } catch (e) {
        return response(500, "Error In Modal", e.message);
    }
}

module.exports.fetchStateList = async (req, resp) => {
    try {
        const filter = {
            // country_id : req.country_id,
            // country_id : new mongoose.Types.ObjectId(req.country_id),
            status: "Active"
        }
        const fetchQuery = await dbSchema.AdminStateTable.find(filter).lean();
        return fetchQuery;
    } catch (e) {
        return response(500, "Error In Modal", e.message);
    }
}

module.exports.fetchDistrictList = async (req, resp) => {
    try {
        const filter = {
            // state_id : req.state_id,
            status: "Active"
        }
        const fetchQuery = await dbSchema.AdminDistrictTable.find(filter).lean();
        return fetchQuery;
    } catch (e) {
        return response(500, "Error In Modal", e.message);
    }
}

module.exports.updateUserOTP = async (userLoginId, mobileOTP, resp) => {
    try {
        const filter = {
            _id: userLoginId
        }
        const update = {
            mobile_otp: mobileOTP,
            modified_date: new Date()
        }
        const options = {
            new: true
        }
        const updateQueryViaId = await dbSchema.UserRegisteration.findByIdAndUpdate(filter, update, options);
        return updateQueryViaId;
    } catch (e) {
        return response(500, "Error in Modal", e.message);
    }
}

module.exports.updateTokenUser = async (userLoginId, accessToken, resp) => {
    try {
        const filter = {
            _id: userLoginId
        }
        const update = {
            is_mobile_verified: true,
            access_token: accessToken,
            modified_date: new Date(),
            status: dbStatus.active
        }
        const options = {
            new: true
        }
        const updateQuery = await dbSchema.UserRegisteration.findByIdAndUpdate(filter, update, options);
        return updateQuery;
    } catch (e) {
        return response(500, "Error in Modal", e.message);
    }
}

module.exports.updateProfileUserViaId = async (req, userProfilePath, resp) => {
    try {
        const loginDetails = httpContext.get("loginDetails");
        const filter = {
            _id: loginDetails.login_id
        }
        const update = {
            first_name: req.first_name,
            last_name: req.last_name,
            email: req.email,
            profile_pic: userProfilePath,
            modified_by: loginDetails.login_id,
            modified_date: new Date()
        }
        const options = {
            new: true
        }
        const updateQuery = await dbSchema.UserRegisteration.findByIdAndUpdate(filter, update, options);
        return updateQuery
    } catch (e) {
        return response(500, "Error In Modal", e.message);
    }
}

module.exports.updateUserProfileAddress = async (req, resp) => {
    try {
        const loginDetails = httpContext.get("loginDetails");
        const filter = {
            _id: loginDetails.login_id
        }
        const update = {
            location: {
                type: req.shape,
                coordinates: [req.longitude, req.latitude]
            },
            country_name: req.countryName,
            district_name: req.districtName,
            state_name: req.stateName,
            pin_code: req.pinCode,
            full_address: req.full_address,
            address_nickname: req.address_nickname,
            modified_by: loginDetails.login_id,
            modified_date: new Date()
        }
        const options = {
            new: true
        }
        const updateQueryViaId = await dbSchema.UserRegisteration.findByIdAndUpdate(filter, update, options);
        return updateQueryViaId;
    } catch (e) {
        return response(500, "Error In Modal", e.message);
    }
}

module.exports.checkAlreadyUserAddedLocation = async (req, resp) => {
    try {
        const loginDetails = httpContext.get("loginDetails");
        const maxDistance = +process.env.USER_LOCATION_WITHIN;
        const fetchQuery = await dbSchema.UserLocation.find({ user_id: loginDetails.login_id, location: { $nearSphere: { $geometry: { type: "Point", coordinates: [req.longitude, req.latitude] }, $maxDistance: maxDistance } } });
        return fetchQuery;
    } catch (e) {
        return response(500, "Error In Modal", e.message);
    }
}

module.exports.insertUserNewLocation = async (req, resp) => {
    try {
        const loginDetails = httpContext.get("loginDetails");
        const insertedObject = new dbSchema.UserLocation({
            user_id: loginDetails.login_id,
            full_address: req.full_address,
            address_nickname: req.address_nickname,
            is_default: req.is_default,
            location: {
                type: req.shape,
                coordinates: [req.longitude, req.latitude]
            },
            country_name: req.countryName,
            state_name: req.stateName,
            district_name: req.districtName,
            pin_code: req.pinCode,
            added_by: loginDetails.login_id,
            modified_by: loginDetails.login_id,
        });
        const insertQuery = await insertedObject.save();
        return insertQuery;
    } catch (e) {
        return response(500, "Error In Modal", e.message);
    }
}

module.exports.fetchUserDefaultLocation = async (req, resp) => {
    try {
        const loginDetails = httpContext.get("loginDetails");
        const filter = {
            user_id: loginDetails.login_id,
            is_default: true,
            status: dbStatus.active,
            is_active: true
        }
        const fetchQuery = await dbSchema.UserLocation.findOne(filter).lean();
        return fetchQuery;
    } catch (e) {
        return response(500, "Error In Modal", e.message);
    }
}

module.exports.updateUserDefaultLocation = async (defaultLocationId, resp) => {
    try {
        const filter = {
            _id: defaultLocationId
        }
        const update = {
            is_default: false
        }
        const options = {
            new: true
        }
        const updateQuery = await dbSchema.UserLocation.findByIdAndUpdate(filter, update, options);
        return updateQuery;
    } catch (e) {
        return response(500, "Error In Modal", e.message);
    }
}

module.exports.fetchUserCarVehicleIdExist = async (vehicleId, resp) => {
    try {
        const loginDetails = httpContext.get("loginDetails");
        const filter = {
            user_id: loginDetails.login_id,
            vehicle_id: vehicleId,
            status: dbStatus.active,
            is_active: true
        }
        const fetchQuery = await dbSchema.UserCarDetails.countDocuments(filter);
        return fetchQuery;
    } catch (e) {
        return response(500, "Error In Modal", e.message);
    }
}

module.exports.insertUserNewCarInfo = async (req, resp) => {
    try {
        const loginDetails = httpContext.get("loginDetails");
        const insertedObject = await dbSchema.UserCarDetails({
            user_id: loginDetails.login_id,
            vehicle_id: req.vehicle_id,
            owner_name: req.owner_name,
            registeration_date: new Date(req.registeration_date),
            car_name: req.car_name,
            car_type: req.car_type,
            steering: req.steering,
            color: req.color,
            fuel_type: req.fuel_type,
            insurance_expiry_date: req.insurance_expiry_date,
            insurance_company_name: req.insurance_company_name,
            puc_expiry_date: req.puc_expiry_date,
            puc_company_name: req.puc_company_name,
            insurance_status: req.insurance_status,
            puc_status: req.puc_status,
            added_by: loginDetails.login_id,
            modified_by: loginDetails.login_id
        })
        const insertQuery = await insertedObject.save();
        return insertQuery;
    } catch (e) {
        return response(500, "Error In Modal", e.message);
    }
}

module.exports.fetchUserAllLocation = async (req, resp) => {
    try {
        const loginDetails = httpContext.get("loginDetails");
        const filter = {
            user_id: loginDetails.login_id
        }
        const fetchQuery = await dbSchema.UserLocation.find(filter).lean();
        return fetchQuery;
    } catch (e) {
        return response(500, "Error In Modal", e.message);
    }
}

module.exports.fetchAllActiveCarService = async (req, resp) => {
    try {
        const filter = {
            status: dbStatus.active,
            is_active: true
        }
        const fetchQuery = await dbSchema.MasterServiceTable.find(filter).lean();
        return fetchQuery;
    } catch (e) {
        return response(500, "Error In Modal", e.message);
    }
}

module.exports.fetchCarServicePackageInfo = async (req, resp) => {
    try {
        const filter = {
            service_id: req.service_id,
            status: dbStatus.active,
            is_active: true
        }
        const fetchQuery = await dbSchema.AdminCreatePackages.find(filter).distinct("car_type_id").lean();
        // const fetchQuery = await dbSchema.AdminCreatePackages.aggregate([
        //     { $match: filter },
        //     { $lookup: { from: "cw_admin_car_types_master", localField: "car_type_id", foreignField: "_id", as: "car_type" } },
        //     { $unwind: "$car_type_id" }, // If car_type_id is an array, unwind it to get individual documents
        //     { $group: { _id: "$car_type_id", data: { $first: "$$ROOT" } } }, // Group by car_type_id and keep the first document
        //     { $replaceRoot: { newRoot: "$data" } } // Replace the root with the original document
        // ]);
        return fetchQuery;
    } catch (e) {
        return response(500, "Error In Modal", e.message);
    }
}

module.exports.fetchAllCarType = async (req, resp) => {
    try {
        const filter = {
            status: dbStatus.active,
            is_active: true
        }
        const fetchQuery = await dbSchema.MasterCarTypes.find(filter).lean();
        return fetchQuery
    } catch (e) {
        return response(500, "Error In Modal", e.message);
    }
}

module.exports.fetchAllCarTypeViaIDsArr = async (req, resp) => {
    try {
        const filter = {
            _id: { $in: req }
        }
        const fetchQuery = await dbSchema.MasterCarTypes.find(filter).lean();
        return fetchQuery;
    } catch (e) {
        return response(500, "Error In Modal", e.message);
    }
}

module.exports.fetchPackageShift = async (req, resp) => {
    try {
        const filter = {
            service_id: req.service_id,
            car_type_id: req.car_type_id,
            status: dbStatus.active,
            is_active: true
        }
        const fetchQuery = await dbSchema.AdminCreatePackages.find(filter).distinct("service_shift_time_id").lean();
        return fetchQuery;
    } catch (e) {
        return response(500, "Error In Modal", e.message);
    }
}

module.exports.fetchActivePackageShfit = async (req, resp) => {
    try {
        const filter = {
            _id: { $in: req }
        }
        const fetchQuery = await dbSchema.MasterServiceShiftTime.find(filter).lean();
        return fetchQuery;
    } catch (e) {
        return response(500, "Error In Modal", e.message);
    }
}


module.exports.fetchServiceShiftTimeIDViaKey = async (shiftKey, resp) => {
    try {
        const filter = {
            key: shiftKey,
            status: dbStatus.active,
            is_active: true
        }
        const fetchShiftTimeIdQuery = await dbSchema.MasterServiceShiftTime.findOne(filter).select("_id").lean();
        return fetchShiftTimeIdQuery;
    } catch (e) {
        return response(500, "Error In Modal", e.message);
    }
}

module.exports.fetchParticularPackage = async (req, serviceShiftTimeId, resp) => {
    try {
        const filter = {
            service_id: req.service_id,
            car_type_id: req.car_type_id,
            service_shift_time_id: serviceShiftTimeId,
            status: dbStatus.active,
            is_active: true
        }
        const fetchQuery = await dbSchema.AdminCreatePackages.find(filter).lean();
        return fetchQuery;
    } catch (e) {
        return response(500, "Error In Modal", e.message);
    }
}

module.exports.fetchParticularPackageFeature = async (req, resp) => {
    try {
        const filter = {
            package_id: req.package_id,
            status: dbStatus.active,
            is_active: true
        }
        const fetchQuery = await dbSchema.AdminPackageFeature.find(filter).lean();
        return fetchQuery;
    } catch (e) {
        return response(500, "Error In Modal", e.message);
    }
}

module.exports.fetchUserAddressOnParticualrLatLong = async (req, resp) => {
    try {
        const loginDetails = httpContext.get("loginDetails");
        const maxDistance = 50;
        const fetchQuery = await dbSchema.UserLocation.find({ user_id: loginDetails.login_id, location: { $nearSphere: { $geometry: { type: "Point", coordinates: [req.longitude, req.latitude] }, $maxDistance: maxDistance } } }).lean();
        return fetchQuery;
    } catch (e) {
        return response(500, "Error In Modal", e.message);
    }
}

module.exports.fetchSelectedUserLocationViaId = async (userLocationId,resp) => {
    try{
        const filter = {
            _id : userLocationId
        }
        const fetchQuery = await dbSchema.UserLocation.findById(filter).lean();
        return fetchQuery;
    }catch(e){
        return response(500,"Error In Modal",e.message);
    }
}

module.exports.fetchAllCleanerNearByWorking = async (coordinates, resp) => {
    try {
        const maxDistance = +process.env.CLEANER_LOCATION_WITHIN;
        console.log("maxDistance",maxDistance);
        const fetchQuery = await dbSchema.AdminCleanerWorkingLocation.find({ status: dbStatus.active, is_active: true, location: { $nearSphere: { $geometry: { type: "Point", coordinates: [coordinates[0], coordinates[1]] }, $maxDistance: maxDistance } } }).lean();
        return fetchQuery;
    } catch (e) {
        return response(500, "Error In Modal", e.message);
    }
}

module.exports.fetchPacakgeDetailsViaId = async (packageId, resp) => {
    try {
        const filter = {
            _id: packageId
        }
        const fetchQuery = await dbSchema.AdminCreatePackages.findById(filter).lean();
        return fetchQuery;
    } catch (e) {
        return response(500, "Error In Modal", e.message);
    }
}

module.exports.insertNewBuyPackage = async (req, packageDetails, cleanerDetails, userLocationId, resp) => {
    try {
        const loginDetails = httpContext.get("loginDetails");
        const insertedObject = new dbSchema.UserBuyPackage({
            user_id: loginDetails.login_id,
            package_id: packageDetails._id,
            service_id: packageDetails.service_id,
            car_type_id: packageDetails.car_type_id,
            service_shift_time_id: packageDetails.service_shift_time_id,
            start_date: new Date(req.start_date),
            expiry_date: new Date(req.expiry_date),
            start_time: new Date(req.start_time),
            end_time: new Date(req.end_time),
            user_car_details_id: req.user_car_details_id,
            cleaner_id: cleanerDetails.cleaner_id,
            user_location_id: userLocationId,
            // location: {
            //     type: req.shape,
            //     coordinates: [req.longitude, req.latitude]
            // },
            price: packageDetails.price,
            added_by: loginDetails.login_id,
            modified_by: loginDetails.login_id
        })
        const insertQuery = await insertedObject.save()
        return insertQuery;
    } catch (e) {
        return response(500, "Error In Modal", e.message);
    }
}

module.exports.insertUserNewBooking = async (req, cleanerDetailsId, userBuyPackageId, resp) => {
    try {
        const loginDetails = httpContext.get("loginDetails");
        const insertedObject = new dbSchema.UserBooking({
            user_id: loginDetails.login_id,
            user_buy_package_id: userBuyPackageId,
            package_id: req.package_id,
            user_car_details_id: req.user_car_details_id,
            user_location_id : req.user_location_id,
            service_date: new Date(req.start_date),
            start_time: new Date(req.start_time),
            end_time: new Date(req.end_time),
            cleaner_id: cleanerDetailsId,
            added_by: loginDetails.login_id,
            modified_by: loginDetails.login_id
        })
        const insertQuery = await insertedObject.save();
        return insertQuery;
    } catch (e) {
        return response(500, "Error In Modal", e.message);
    }
}

module.exports.updateCleanerSubscribedJobs = async (cleanerId,updateSubscribedJobs,resp) => {
    try{
        const loginDetails = httpContext.get("loginDetails");
        const filter = {
            cleaner_id : cleanerId
        }
        const update = {
            subscribed_jobs: updateSubscribedJobs,
            modified_by : loginDetails.login_id,
            modified_date : new Date()
        }
        const options = {
            new : true
        }
        const updateQuery = await dbSchema.AdminCleanerWorkingLocation.findOneAndUpdate(filter,update,options);
        return updateQuery;
    }catch(e){
        return response(500,"Error In Modal",e.message);
    }
}

module.exports.fetchUserUpcomingBooking = async (req, resp) => {
    try {
        const loginDetails = httpContext.get("loginDetails");
        const filter = {
            user_id: loginDetails.login_id,
            is_active: true
        }
        const fetchQuery = await dbSchema.UserBooking.find(filter).populate("user_car_details_id","car_image").select("-added_by -modified_by -is_active -__v -added_date -modified_date").lean();
        return fetchQuery;
    } catch (e) {
        return response(500, "Error IN Modal", e.message);
    }
}

module.exports.insertNewAddAddressUser = async (req, resp) => {
    try {

    } catch (e) {
        return response(500, "Error In Modal", e.message);
    }
}

module.exports.fetchCleanerProfileExist = async (req, resp) => {
    try {
        const filter = {
            mobile_no: req.mobile_no,
            is_active: true,
        }
        const fetchQuery = await dbSchema.CleanerProfile.countDocuments(filter).lean();
        return fetchQuery;
    } catch (e) {
        return response(500, "Error In Modal", e.message);
    }
}

module.exports.fetchCleanerProfile = async (req, resp) => {
    try {
        const filter = {
            mobile_no: req.mobile_no
        }
        const fetchQuery = await dbSchema.CleanerProfile.find(filter).lean();
        return fetchQuery;
    } catch (e) {
        return response(500, "Error In Modal", e.message);
    }
}

module.exports.fetchCleanerProfileViaId = async (cleanerProfileId, resp) => {
    try {
        const filter = {
            _id: cleanerProfileId
        }
        const fetchQueryViaId = await dbSchema.CleanerProfile.findById(filter);
        return fetchQueryViaId;
    } catch (e) {
        return response(500, "Error In Modal", e.message);
    }
}

module.exports.insertNewCleaner = async (req, resp) => {
    try {
        const insertedObject = new dbSchema.CleanerProfile({
            first_name: req.first_name,
            last_name: req.last_name,
            mobile_no: req.mobile_no,
            mobile_otp: req.mobile_otp,
        })
        const insertQuery = await insertedObject.save();
        return insertQuery;
    } catch (e) {
        return response(500, "Error In Modal", e.message);
    }
}


module.exports.udpateCleanerProfile = async (cleanerLoginId, req, resp) => {
    try {
        const filter = {
            _id: cleanerLoginId,
            status: dbStatus.active,
            is_active: true,
        }
        const update = {
            mobile_otp: req.mobile_otp,
            modified_date: new Date()
        }
        const options = {
            new: true,
        }
        const updateQueryViaId = await dbSchema.CleanerProfile.findByIdAndUpdate(filter, update, options);
        return updateQueryViaId
    } catch (e) {
        return response(500, "Error In Modal", e.message);
    }
}

module.exports.updateTokenCleaner = async (cleanerLoginId, accessToken, resp) => {
    try {
        const filter = {
            _id: cleanerLoginId
        }
        const update = {
            is_mobile_verified: true,
            access_token: accessToken,
            modified_date: new Date(),
            status: dbStatus.active
        }
        const options = {
            new: true
        }
        const updateQuery = await dbSchema.CleanerProfile.findByIdAndUpdate(filter, update, options);
        return updateQuery;
    } catch (e) {
        return response(500, "Error in Modal", e.message);
    }
}

module.exports.updateProfileCleanerViaId = async (req, imageFilePath, resp) => {
    try {
        const loginDetails = httpContext.get("loginDetails");
        const filter = {
            _id: loginDetails.login_id
        }
        const update = {
            // first_name: req.first_name,
            // last_name: req.last_name,
            email: req.email,
            profile_pic: imageFilePath,
            address: req.full_address,
            // state_id: req.state_id,
            // state_name: req.state_name,
            // district_id: req.district_id,
            // district_name: req.district_name,
            pincode: req.pincode,
            // aadhar_card_doc_path: aadharCardDoc,
            // pan_card_doc_path: panCardDoc,
            modified_date: new Date()
        }
        const options = {
            new: true
        }
        const updateQueryViaId = await dbSchema.CleanerProfile.findByIdAndUpdate(filter, update, options);
        return updateQueryViaId;
    } catch (e) {
        return response(500, "Error In Modal", e.message);
    }
}

module.exports.insertCleanerDocuments = async (req, aadharDocFile, panDocFile, resp) => {
    try {
        const loginDetails = httpContext.get("loginDetails");
        const insertedObject = new dbSchema.CleanerDocuments({
            cleaner_id: loginDetails.login_id,
            aadhar_no: req.aadhar_no,
            pan_no: req.pan_no,
            aadhar_doc_file: aadharDocFile,
            pan_doc_file: panDocFile,
            added_by: loginDetails.login_id,
            modified_by: loginDetails.login_id
        })
        const insertQuery = await insertedObject.save();
        return insertQuery;
    } catch (e) {
        return response(500, "Error In Modal", e.message);
    }
}

module.exports.fetchBankDetailsCleaner = async (req, resp) => {
    try {
        const loginDetails = httpContext.get("loginDetails");
        const filter = {
            cleaner_id: loginDetails.login_id,
            is_active: true
        }
        const fetchQuery = await dbSchema.CleanerBankDetails.find(filter);
        return fetchQuery;
    } catch (e) {
        return response(500, "Error In Modal", e.message);
    }
}

module.exports.insertCleanerBankDetails = async (req, resp) => {
    try {
        const loginDetails = httpContext.get("loginDetails");
        const insertedObject = new dbSchema.CleanerBankDetails({
            cleaner_id: loginDetails.login_id,
            bank_name: req.bank_name,
            acc_holder_name: req.acc_holder_name,
            acc_no: req.acc_no,
            acc_type: req.acc_type,
            ifsc_code: req.ifsc_code,
            added_by: loginDetails.login_id,
            modified_by: loginDetails.login_id,
        })
        const insertQuery = await insertedObject.save();
        return insertQuery;
    } catch (e) {
        return response(500, "Error In Modal", e.message);
    }
}

module.exports.checkTodayCleanerAttendance = async (req, resp) => {
    try {
        const currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);
        const loginDetails = httpContext.get("loginDetails");
        const filter = {
            cleaner_id: loginDetails.login_id,
            check_in: { $gte: currentDate },
            check_out: { $exists: false }
        }
        const fetchQuery = await dbSchema.CleanerAttendance.find(filter);
        return fetchQuery;
    } catch (e) {
        return response(500, "Error In Modal", e.message);
    }
}


module.exports.checkCleanerAssignedLocation = async (req,resp) => {
    try{
        const loginDetails = httpContext.get("loginDetails");
        const filter = {
            cleaner_id : loginDetails.login_id,
            status : dbStatus.active,
            is_active: true
        }
        const countDocuments = await dbSchema.AdminCleanerWorkingLocation.find(filter).lean();
        return countDocuments
    }catch(e){
        return response(500,"Error In Modal",e.message);
    }
}

module.exports.updateCleanerActiveJobs = async (activeJobs,resp) => {
    try{
        const loginDetails = httpContext.get("loginDetails");
        const filter = {
            cleaner_id : loginDetails.login_id,
            status : dbStatus.active,
            is_active: true
        }
        const update = {
            active_jobs : activeJobs,
            modified_by : loginDetails.login_id,
            modified_date : new Date()
        }
        const options = {
            new: true
        }
        const updateQuery = await dbSchema.AdminCleanerWorkingLocation.findOneAndUpdate(filter,update,options);
        return updateQuery;
    }catch(e){
        return response(500,"Error In Modal",e.message);
    }
}

module.exports.insertCleanerAttendance = async (req, resp) => {
    try {
        const loginDetails = httpContext.get("loginDetails");
        const insertedObject = new dbSchema.CleanerAttendance({
            cleaner_id: loginDetails.login_id,
            check_in: new Date(req.check_in),
            added_by: loginDetails.login_id,
            modified_by: loginDetails.login_id,
        })
        const insertQuery = await insertedObject.save();
        return insertQuery;
    } catch (e) {
        return response(500, "Error In Modal", e.message);
    }
}

module.exports.fetchCleanerWorkLocationDetails = async (req,resp) => {
    try{
        const loginDetails = httpContext.get("loginDetails");
        const filter = {
            cleaner_id : loginDetails.login_id
        }
        const fetchQuery = await dbSchema.AdminCleanerWorkingLocation.find(filter).lean();
        return fetchQuery;
    }catch(e){
        return response(500, "Error In Modal", e.message);
    }
}

module.exports.updateTodayCleanerAttendance = async (cleanerAttendanceId, req, resp) => {
    try {
        const loginDetails = httpContext.get("loginDetails");
        const filter = {
            _id: cleanerAttendanceId
        }
        const update = {
            check_out: new Date(req.check_out),
            modified_by: loginDetails.login_id,
            modified_date: new Date()
        }
        const options = {
            new: true
        }
        const updateQuery = await dbSchema.CleanerAttendance.findByIdAndUpdate(filter, update, options);
        return updateQuery;
    } catch (e) {
        return response(500, "Error In Modal", e.message);
    }
}

module.exports.fetchParticularDateCleanerAttendace = async (req, resp) => {
    try {
        const startOfDay = new Date(req.particular_date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(req.particular_date);
        endOfDay.setHours(23, 59, 59, 999);
        const loginDetails = httpContext.get("loginDetails");
        const filter = {
            cleaner_id: loginDetails.login_id,
            check_in: { $gte: startOfDay, $lte: endOfDay },
            status: dbStatus.active,
            is_active: true
        }
        const fetchQuery = await dbSchema.CleanerAttendance.find(filter).lean();
        return fetchQuery;
    } catch (e) {
        return response(500, "Error In Modal", e.message);
    }
}

module.exports.fetchTotalDaysInThisMonth = async (startDateOfMonth, lastDateOfMonth, resp) => {
    try {
        const loginDetails = httpContext.get("loginDetails");
        const current_date = new Date();
        const filter = {
            cleaner_id: loginDetails.login_id,
            check_in: { $gte: startDateOfMonth, $lte: lastDateOfMonth },
            status: dbStatus.active,
            is_active: true
        }
        const fetchQuery = await dbSchema.CleanerAttendance.countDocuments(filter).lean();
        return fetchQuery;
    } catch (e) {
        return response(500, "Error In Modal", e.message);
    }
}


module.exports.updateBankDetailsCleaner = async (cleanerBankDetailsId, req, resp) => {
    try {
        const loginDetails = httpContext.get("loginDetails");
        const filter = {
            _id: cleanerBankDetailsId
        }
        const update = {
            bank_name: req.bank_name,
            acc_holder_name: req.acc_holder_name,
            acc_no: req.acc_no,
            acc_type: req.acc_type,
            ifsc_code: req.ifsc_code,
            modified_by: loginDetails.login_id,
            modified_date: new Date()
        }
        const options = {
            new: true
        }
        const updateQueryViaId = await dbSchema.CleanerBankDetails.findByIdAndUpdate(filter, update, options);
        return updateQueryViaId;
    } catch (e) {
        return response(500, "Error In Modal", e.message);
    }
}

module.exports.fetchDiscountInfoViaDiscountNo = async (req, resp) => {
    try {
        const filter = {
            discount_no: req.discount_no,
            status: dbStatus.active,
            is_active: true
        }
        const fetchQuery = await dbSchema.AdminDiscountDetails.countDocuments(filter).lean();
        return fetchQuery;
    } catch (e) {
        return response(500, "Error In Modal", e.message);
    }
}

module.exports.insertNewServiceDiscount = async (req, resp) => {
    try {
        const loginDetails = httpContext.get("loginDetails");
        const insertedObject = new dbSchema.AdminDiscountDetails({
            service_id: req.service_id,
            start_date: new Date(req.start_date),
            expiry_date: new Date(req.expiry_date),
            discount_type: req.discount_type,
            discount_value: req.discount_value,
            discount_no: req.discount_no,
            discount_name: req.discount_name,
            added_by: loginDetails.login_id,
            modified_by: loginDetails.login_id,
        })
        const insertQuery = await insertedObject.save();
        return insertQuery;
    } catch (e) {
        return response(500, "Error In Modal", e.message);
    }
}

module.exports.insertAdminGeneralSetting = async (req, resp) => {
    try {
        const loginDetails = httpContext.get("loginDetails");
        const insertedObject = new dbSchema.AdminGeneralSetting({
            admin_id: loginDetails.login_id,
            cleaner_subscribed_limits: req.cleaner_subscribed_limits,
            platform_fees: req.platform_fees,
            platform_fees_type: req.platform_fees_type,
            added_by: loginDetails.login_id,
            modified_by: loginDetails.login_id,
        })
        const insertQuery = await insertedObject.save();
        return insertQuery;
    } catch (e) {
        return response(500, "Error In Modal", e.message);
    }
}

module.exports.insertNewTermAndCondition = async (req, resp) => {
    try {
        const loginDetails = httpContext.get("loginDetails");
        const insertedObject = new dbSchema.AdminTermAndCondition({
            admin_id: loginDetails.login_id,
            term_title: req.term_title,
            term_description: req.term_description,
            added_by: loginDetails.login_id,
            modified_by: loginDetails.login_id
        })
        const insertQuery = await insertedObject.save();
        return insertQuery;
    } catch (e) {
        return response(500, "Error In Modal", e.message);
    }
}

module.exports.deleteParticularTermAndCondition = async (req, resp) => {
    try {
        const loginDetails = httpContext.get("loginDetails");
        const filter = {
            _id: req.term_and_condition_id
        }
        const update = {
            status: dbStatus.deleted,
            is_active: false
        }
        const options = {
            new: true
        }
        const updateQueryViaId = await dbSchema.AdminTermAndCondition.findByIdAndUpdate(filter, update, options);
        return updateQueryViaId;
    } catch (e) {
        return response(500, "Error In Modal", e.message);
    }
}

module.exports.editParticularTermAndCondition = async (req, resp) => {
    try {
        console.log("term_and_condition_id")
        const loginDetails = httpContext.get("loginDetails");
        const filter = {
            _id: req.term_and_condition_id
        }
        const update = {
            term_title: req.term_title,
            term_description: req.term_description,
            modified_by: loginDetails.login_id,
            modified_date: new Date()
        }
        const options = {
            new: true,
        }
        const updateQueryViaId = await dbSchema.AdminTermAndCondition.findByIdAndUpdate(filter, update, options);
        return updateQueryViaId;
    } catch (e) {
        return response(500, "Error In Modal", e.message);
    }
}

module.exports.insertNewPrivacyPolicy = async (req, resp) => {
    try {
        const loginDetails = httpContext.get("loginDetails");
        const insertedObject = new dbSchema.AdminPrivacyPolicy({
            admin_id: loginDetails.login_id,
            privacy_title: req.privacy_title,
            privacy_description: req.privacy_description,
            added_by: loginDetails.login_id,
            modified_by: loginDetails.login_id
        })
        const insertQuery = await insertedObject.save();
        return insertQuery;
    } catch (e) {
        return response(500, "Error In Modal", e.message);
    }
}

module.exports.deleteParticularPrivacyPolicy = async (req, resp) => {
    try {
        const loginDetails = httpContext.get("loginDetails");
        const filter = {
            _id: req.privacy_policy_id
        }
        const update = {
            status: dbStatus.deleted,
            is_active: false,
            modified_by: loginDetails.login_id,
            modified_date: new Date()
        }
        const options = {
            new: true
        }
        const updateQuery = await dbSchema.AdminPrivacyPolicy.findByIdAndUpdate(filter, update, options);
        return updateQuery;
    } catch (e) {
        return response(500, "Error In Modal", e.message);
    }
}

module.exports.editParticularPrivacyPolicy = async (req, resp) => {
    try {
        const filter = {
            _id: req.privacy_policy_id
        }
        const update = {
            privacy_title: req.privacy_title,
            privacy_description: req.privacy_description,
            modified_by: loginDetails.login_id,
            modified_date: new Date()
        }
        const options = {
            new: true
        }
        const updateQuery = await dbSchema.AdminPrivacyPolicy.findByIdAndUpdate(filter, update, options);
        return updateQuery;
    } catch (e) {
        return response(500, "Error In Modal", e.message);
    }
}

module.exports.fetchCleanerAllAllotedLocation = async (req,resp) => {
    try{
        const filter = {
            status : dbStatus.active,
            is_active: true
        }
        const fetchQuery = await dbSchema.AdminCleanerWorkingLocation.find(filter).populate("cleaner_id","first_name last_name mobile_no").populate("service_shift_time_id","shift from_time to_time am_or_pm key").select("-__v").lean();
        return fetchQuery;
    }catch(e){
        return response(500,"Error In Modal",e.message);
    }
}

module.exports.fetchAllBookingList = async (req,resp) => {
    try{
        const filter = {
            // status : dbStatus.active,
            is_active: true
        }
        const fetchQuery = await dbSchema.UserBooking.find(filter).populate("user_id","first_name last_name").populate("cleaner_id","first_name last_name").populate("user_location_id","full_address pin_code").populate("user_car_details_id","vehicle_id car_name").lean();
        return fetchQuery;
    }catch(e){
        return response(500,"Error In Modal",e.message);
    }
}

module.exports.fetchServiceBasedDiscountInfo = async (req, resp) => {
    try {
        const filter = {
            service_id: req.service_id,
            start_date: { $lte: new Date(req.start_date) },
            expiry_date: { $gte: new Date(req.start_date) },
            status: dbStatus.active,
            is_active: true
        }
        const fetchQuery = await dbSchema.AdminDiscountDetails.find(filter).lean();
        return fetchQuery;
    } catch (e) {
        return response(500, "Error In Modal", e.message);
    }
}

module.exports.userActivatedAllPackageList = async (req, resp) => {
    try {
        const loginDetails = httpContext.get("loginDetails");
        const filter = {
            user_id: loginDetails.login_id,
            // status: dbStatus.active,
            is_active: true
        }
        const fetchQuery = await dbSchema.UserBuyPackage.find(filter).lean();
        return fetchQuery;
    } catch (e) {
        return response(500, "Error In Modal", e.message);
    }
}

module.exports.fetchAllTermAndCondition = async (req, resp) => {
    try {
        const filter = {
            status: dbStatus.active,
            is_active: true
        }
        const fetchQuery = await dbSchema.AdminTermAndCondition.find(filter).lean();
        return fetchQuery;
    } catch (e) {
        return response(500, "Error In Modal", e.message);
    }
}

module.exports.fetchAllPrivacyPolicy = async (req, resp) => {
    try {
        const filter = {
            status: dbStatus.active,
            is_active: true
        }
        const fetchQuery = await dbSchema.AdminPrivacyPolicy.find(filter).lean();
        return fetchQuery;
    } catch (e) {
        return response(500, "Error In Modal", e.message);
    }
}

module.exports.particularDateUserBooking = async (req, resp) => {
    try {
        // let service_date = new Date();
        // service_date.setHours(0,0,0,0);
        // console.log("req.serivice_date",service_date.toISOString());
        const loginDetails = httpContext.get("loginDetails");
        const filter = {
            user_id : loginDetails.login_id,
            service_date: new Date(req.service_date),
            is_active: true
        }
        const fetchQuery = await dbSchema.UserBooking.find(filter).populate("package_id","service_id").populate("user_car_details_id","vehicle_id owner_name car_name car_type steering color fuel_type").populate("cleaner_id","first_name last_name").select("-added_by -modified_by -added_date -modified_date -is_active -__v").lean();
        return fetchQuery;
    } catch (e) {
        return response(500, "Error In Modal", e.message);
    }
}

module.exports.fetchUserBookingHistory = async (req,resp) => {
    try{
        const loginDetails = httpContext.get("loginDetails");
        const filter = {
            user_id : loginDetails.login_id,
            status : req.status,
            is_active: true
        }
        const fetchQuery = await dbSchema.UserBooking.find(filter).populate("cleaner_id", "first_name last_name").lean();
        return fetchQuery;
    }catch(e){
        return response(500,"Error In Modal",e.message);
    }
}

module.exports.userCancelBooking = async (req,resp) => {
    try{
        const loginDetails = httpContext.get("loginDetails");
        const filter = {
            _id : req.user_booking_id
        }
        const update = {
            status : dbStatus.cancelled,
            modified_by : loginDetails.login_id,
            modified_date : new Date()
        }
        const options = {
            new: true
        }
        const updateQuery = await dbSchema.UserBooking.findByIdAndUpdate(filter,update,options);
        return updateQuery
    }catch(e){
        return response(500,"Error In Modal",e.message);
    }
}

module.exports.userBoughtPackage = async (req,resp) => {
    try{
        const loginDetails = httpContext.get("loginDetails");
        const filter = {
            user_id : loginDetails.login_id,
            status: dbStatus.active,
            is_active: true
        }
        const fetchQuery = await dbSchema.UserBuyPackage.find(filter).populate("car_type_id","car_type").populate("service_shift_time_id","shift").lean();
        return fetchQuery;
    }catch(e){
        return response(500,"Error In Modal",e.message);
    }
}


module.exports.fetchGeneralSetting = async (req, resp) => {
    try {
        const filter = {
            is_active: true
        }
        const fetchQuery = await dbSchema.AdminGeneralSetting.findOne(filter).select("cleaner_subscribed_limits platform_fees platform_fees_type").lean();
        return fetchQuery;
    } catch (e) {
        return response(500, "Error In Modal", e.message);
    }
}

module.exports.fetchUserAllBuyPacakgeInfo = async (allPackageIdsArr, resp) => {
    try {
        const filter = {
            _id: { $in: allPackageIdsArr }
        }
        const fetchQuery = await dbSchema.AdminCreatePackages.find(filter).lean();
        return fetchQuery;
    } catch (e) {
        return response(500, "Error In Modal", e.message);
    }
}

module.exports.fetchCarTypeInfoViaIdsArr = async (allCarTypeIdsArr, resp) => {
    try {
        const filter = {
            _id: { $in: allCarTypeIdsArr }
        }
        const fetchQuery = await dbSchema.MasterCarTypes.find(filter).lean();
        return fetchQuery;
    } catch (e) {
        return response(500, "Error In Modal", e.message);
    }
}

module.exports.fetchServiceShiftTimeIdsArr = async (allServiceShiftTimeIdsArr, resp) => {
    try {
        const filter = {
            _id: { $in: allServiceShiftTimeIdsArr }
        }
        const fetchQuery = await dbSchema.MasterServiceShiftTime.find(filter).lean();
        return fetchQuery;
    } catch (e) {
        return response(500, "Error In Modal", e.message);
    }
}








module.exports.updateParticularUserParticularCarImage = async (req, carImageFilePath, resp) => {
    try {
        const filter = {
            _id: req.user_car_details_id
        }
        const update = {
            car_image: carImageFilePath
        }
        const options = {
            new: true
        }
        const updateQueryViaId = await dbSchema.UserCarDetails.findByIdAndUpdate(filter, update, options);
        return updateQueryViaId;
    } catch (e) {
        return response(500, "Error In Modal", e.message);
    }
}


module.exports.insertDateAndTime = async (req, resp) => {
    try {
        const insertedObject = new dbSchema.TestingDateAndTime({
            from_time: new Date(req.from_time),
            to_time: new Date(req.to_time),
            from_number: req.from_number,
            to_number: req.to_number
        })
        const insertedQuery = await insertedObject.save();
        return insertedQuery;
    } catch (e) {
        return response(500, "Error In Modal", e.message);
    }
}

module.exports.fetchDateAndTime = async (req, resp) => {
    try {
        const filter = {
            $or: [
                { from_time: { $lte: new Date(req.from_time) }, to_time: { $gte: new Date(req.from_time) } },
                { from_time: { $lte: new Date(req.to_time) }, to_time: { $gte: new Date(req.to_time) } }
            ]
        }
        const fetchQuery = await dbSchema.TestingDateAndTime.find(filter);
        return fetchQuery;
    } catch (e) {
        return response(500, "Error In Modal", e.message);
    }
}

module.exports.insertGeoLocation = async (req, resp) => {
    try {
        const insertedObject = new dbSchema.TestingGeoLocation({
            location: {
                type: req.shape,
                coordinates: [req.longitude, req.lattitude]
            }
        })
        const insertQuery = await insertedObject.save();
        return insertQuery;
    } catch (e) {
        return response(500, "Error In Modal", e.message);
    }
}

module.exports.testingFetchGeoLocationNearBy = async (req, resp) => {
    try {
        const maxDistance = 100;
        const fetchQuery = await dbSchema.TestingGeoLocation.find({ location: { $nearSphere: { $geometry: { type: "Point", coordinates: [req.longitude, req.lattitude] }, $maxDistance: maxDistance } } }).lean();
        return fetchQuery;
    } catch (e) {
        return response(500, "Error In Modal", e.message);
    }
}


module.exports.fetchAllUserForCRM = async (req, resp) => {
    try {
        const filter = {
            is_active: true
        }
        const fetchQuery = await dbSchema.UserRegisteration.find(filter).lean();
        return fetchQuery;
    } catch (e) {
        return response(500, "Error In Modal", e.message);
    }
}

module.exports.fetchAllCleanerForCRM = async (req, resp) => {
    try {
        const filter = {
            is_active: true
        };
        const fetchQuery = await dbSchema.CleanerProfile.find(filter).lean();
        return fetchQuery;
    } catch (e) {
        return response(500, "Error In Modal", e.message);
    }
}


module.exports.fetchUserDetailsForCRM = async (req, resp) => {
    try {
        const filter = {
            _id: req.user_id,
        }
        const fetchQuery = await dbSchema.UserRegisteration.findById(filter).populate("location_id","full_address address_nickname country_name state_name status is_active").select("profile_pic first_name last_name email mobile_no status is_active").lean();
        return fetchQuery;
    } catch (e) {
        return response(500, "Error In Modal", e.message);
    }
}

module.exports.fetchCleanerDetailsForCRM = async (req, resp) => {
    try {
        const filter = {
            _id: req.cleaner_id
        }
        const fetchQuery = await dbSchema.CleanerProfile.findById(filter).lean();
        return fetchQuery;
    } catch (e) {
        return response(500, "Error In Modal", e.message);
    }
}

module.exports.fetchParticularUserActivePackageCRM = async (req,resp) => {
    try{
        const filter = {
            user_id : req.user_id
        }
        const fetchQuery = await dbSchema.UserBuyPackage.findOne(filter).populate("service_id","service_name").populate("car_type_id","car_type").populate("user_car_details_id","vehicle_id").populate("package_id","package_period package_period_duration").populate("service_shift_time_id","shift from_time to_time am_or_pm").select("-added_by -modified_by -modified_date -cleaner_id -user_location_id -price -__v").lean();
        return fetchQuery;
    }catch(e){
        return response(500,"Error In Modal",e.message);
    }
}

module.exports.fetchParticularUserLatestBooking = async (req,resp) => {
    try{
        const filter = {
            user_id : req.user_id
        }
        const fetchQuery = await dbSchema.CleanerWorkingHistory.find(filter).populate({path:"booking_id",select:"",populate:{path:"user_buy_package_id"}}).lean();
        return fetchQuery;
    }catch(e){
        return response(500,"Error In Modal",e.message);
    }
}

module.exports.alreadyTodayParticularVehicleCleanerExist = async (req,resp) => {
    try{
        const filter = {
            // start_time further added
            user_car_details_id : req.user_car_details_id
        }
        const fetchQuery = await dbSchema.CleanerWorkingHistory.findOne(filter).lean();
        return fetchQuery;
    }catch(e){
        return response(500,"Error In Modal",e.message);
    }
}

module.exports.insertCleanerWorkStart = async (req,resp) => {
    try{
        const loginDetails = httpContext.get("loginDetails");
        const insertedObject = new dbSchema.CleanerWorkingHistory({
            cleaner_id : loginDetails.login_id,
            user_id : req.user_id,
            booking_id : req.booking_id,
            user_car_details_id : req.user_car_details_id,
            user_location_id : req.user_location_id,
            start_time : new Date(req.start_time),
            added_by : loginDetails.login_id,
            modified_by : loginDetails.login_id
        })
        const insertQuery = await insertedObject.save();
        return insertQuery;
    }catch(e){
        return response(500,"Error In Modal",e.message);
    }
}

module.exports.updateBookingStatus = async (req,resp) => {
    try{
        const loginDetails = httpContext.get("loginDetails");
        const filter = {
            _id : req.booking_id
        }
        const update = {
            status : dbStatus.started,
            modified_by : loginDetails.login_id,
            modified_date : new Date()
        }
        const options = {
            new: true
        }
        const updateQuery = await dbSchema.UserBooking.findByIdAndUpdate(filter,update,options);
        return updateQuery;
    }catch(e){
        return response(500,"Error In Modal",e.message);
    }
}

module.exports.updateStartingWorkImage = async (cleanerWorkHistoryId,startingImageFileArr,resp) => {
    try{
        const filter = {
            _id : cleanerWorkHistoryId
        }
        const update = {
            $push: {starting_image : {$each : startingImageFileArr,$position:0}}
        }
        const options = {
            new: true
        }
        const updateQuery = await dbSchema.CleanerWorkingHistory.findByIdAndUpdate(filter,update,options);
        return updateQuery;
    }catch(e){
        return response(500,"Error In Modal",e.message);
    }
}

module.exports.updateEndingWorkImage = async (cleanerWorkHistoryId,endingImageFileArr,resp) => {
    try{
        const filter = {
            _id : cleanerWorkHistoryId
        }
        const update = {
            $push: {ending_image : {$each : endingImageFileArr,$position:0}}
        }
        const options = {
            new: true
        }
        const updateQuery = await dbSchema.CleanerWorkingHistory.findByIdAndUpdate(filter,update,options);
        return updateQuery; 
    }catch(e){
        return response(500,"Error In Modal",e.message);
    }
}

module.exports.updateCleanerCompleteWork = async (req,resp) => {
    try{
        const loginDetails = httpContext.get("loginDetails");
        const filter = {
            _id : req.cleaner_history_id
        }
        const update = {
            end_time : new Date(req.end_time),
            modified_by : loginDetails.login_id,
            modified_date : new Date()
        }
        const options = {
            new : true
        }
        const updateQuery = await dbSchema.CleanerWorkingHistory.findByIdAndUpdate(filter,update,options);
        return updateQuery;
    }catch(e){
        return response(500,"Error In Modal",e.message);
    }
}

module.exports.updateBookingCompleted = async (req,resp) => {
    try{
        const loginDetails = httpContext.get("loginDetails");
        const filter = {
            _id : req.booking_id
        }
        const update = {
            status : dbStatus.completed,
            modified_by : loginDetails.login_id,
            modified_date : new Date()
        }
        const options = {
            new: true
        }
        const updateQuery = await dbSchema.UserBooking.findByIdAndUpdate(filter,update,options);
        return updateQuery;
    }catch(e){
        return resp.status(500,"Error In Modal",e.message);
    }
}

module.exports.fetchCleanerAllJobs = async (req,resp) => {
    try{
        const loginDetails = httpContext.get("loginDetails");
        const filter = {
            cleaner_id : loginDetails.login_id
        }
        const fetchQuery = await dbSchema.AdminCleanerWorkingLocation.findOne(filter).lean();
        return fetchQuery;
    }catch(e){
        return resp.status(500,"Error In Modal",e.message);
    }
}

module.exports.updateTotalCompletedJobsCleaner = async (completedJobs,activeJobs,adminCleanerWorkLocationId,resp) => {
    try{
        const loginDetails = httpContext.get("loginDetails");
        const filter = {
            _id : adminCleanerWorkLocationId
        }
        const update = {
            completed_jobs : completedJobs,
            active_jobs : activeJobs
        }
    }catch(e){
        return resp.status(500,"Errror In MODAL",e.message);
    }
}

module.exports.fetchCleanerUpcomingJobs = async (req,resp) => {
    try{
        const loginDetails = httpContext.get("loginDetails");
        const filter = {
            cleaner_id : loginDetails.login_id,
            status : dbStatus.upcoming,
            is_active: true
        }
        const fetchQuery = await dbSchema.UserBooking.find(filter).populate("user_car_details_id","car_image").populate({path:"package_id",select:"service_id",populate:{path:"service_id",model:"cw_admin_service_master",select:"service_name"}}).select("user_car_details_id service_date start_time end_time user_id").lean();
        return fetchQuery;
    }catch(e){
        return response(500,"Error In Modal",e.message);
    }
}

module.exports.fetchCleanerTotalActiveJobs = async (req,resp) => {
    try{
        const loginDetails = httpContext.get("loginDetails");
        const filter = {
            cleaner_id: loginDetails.login_id,
            status : dbStatus.active,
            is_active: true
        }
        const fetchQuery = await dbSchema.AdminCleanerWorkingLocation.find(filter).lean();
        return fetchQuery;
    }catch(e){
        return response(500,"Error In Modal",e.message);
    }
}


module.exports.fetchParticularBooking = async (req,resp) => {
    try{
        // const loginDetails = httpContext.get("loginDetails");
        const filter = {
            _id : req.user_booking_id
        }
        const fetchQuery = await dbSchema.UserBooking.findById(filter).populate("user_id","first_name last_name").populate("user_car_details_id","-added_by -modified_by -added_date -modified_date -is_active -__v").populate({path:"package_id",select:"service_id",populate:{path:"service_id",modal:"cw_admin_service_master",select:"service_name"}}).select("-added_by -modified_by -added_date -modified_date -is_active -__v").lean();
        // const fetchQuery = await dbSchema.UserBooking.findById(filter).lean();
        return fetchQuery;
    }catch(e){
        return response(500,"Error In Modal",e.message);
    }
}
// module.exports.fetchCleanerAllActiveJobs = async (req,resp) => {
//     try{
//         const loginDetails = httpContext.get("loginDetails");
//         const filter = {
//             cleaner_id : loginDetails.login_id,
//             status : dbStatus.active,
//             is_active: true
//         }
//         const fetchQuery = await dbSchema.UserBooking.find(filter).lean();
//         return fetchQuery;
//     }catch(e){
//         return response(500,"Error In Modal",e.message);
//     }
// }