"use strict"
const { boolean } = require("joi");
const mongoose = require("mongoose");
const { dbStatus, serviceKey, carTypesKey, serviceDayTimeKey, packagePeriodKey, AMorPM } = require("../config");
const Schema = mongoose.Schema;

const adminLogin = new Schema({
    full_name: { type: String, required: true },
    email: { type: String, required: true },
    mobile_no: { type: String, maxlength: 10, required: false },
    password: { type: String, required: false },
    is_email_verified: { type: Boolean, required: true, default: false },
    admin_type: { type: String, required: true },
    added_date: { type: Date, required: true, default: () => new Date() },
    modified_date: { type: Date, required: true, default: () => new Date() },
    access_token: { type: String, required: false },
    is_active: { type: Boolean, required: true, default: true }
});
const AdminLogin = mongoose.model("cw_admin_login", adminLogin);

const adminCleanerWorkingLocation = new Schema({
    admin_id: { type: mongoose.Types.ObjectId, required: true },
    cleaner_id: { type: mongoose.Types.ObjectId, required: true },
    location: {
        type: { type: String, enum: ["Point"], required: true },
        coordinates: { type: [Number], required: true }
    },
    country_name: { type: String, required: true },
    state_name: { type: String, required: true },
    district_name: {type: String, required: true},
    pin_code: { type: String, required: true },
    full_address: { type: String, required: true },
    completed_jobs: { type: Number, required: true, default: 0 },
    active_jobs: { type: Number, required: true, default: 0 },
    subscribed_jobs: { type: Number, required: true, default: 0 },
    added_by: { type: mongoose.Types.ObjectId, required: true },
    modified_by: { type: mongoose.Types.ObjectId, required: true },
    added_date: { type: Date, required: true, default: () => new Date() },
    modified_date: { type: Date, required: true, default: () => new Date() },
    status: { type: String, required: true, default: dbStatus.active },
    is_active: { type: Boolean, required: true, default: true }
})
adminCleanerWorkingLocation.index({ location: "2dsphere" });
const AdminCleanerWorkingLocation = mongoose.model("cw_admin_cleaner_work_location", adminCleanerWorkingLocation);

const masterServiceTable = new Schema({
    admin_id: { type: mongoose.Types.ObjectId, required: true },
    service_name: { type: String, required: true },
    service_logo_path: { type: String, required: true },
    key: { type: String, enum: [serviceKey.carWashing], required: false },
    added_by: { type: mongoose.Types.ObjectId, required: true },
    modified_by: { type: mongoose.Types.ObjectId, required: true },
    added_date: { type: Date, required: true, default: () => new Date() },
    modified_date: { type: Date, required: true, default: () => new Date() },
    status: { type: String, required: true, default: dbStatus.active },
    is_active: { type: Boolean, required: true, default: true }
})
const MasterServiceTable = mongoose.model("cw_admin_service_master", masterServiceTable);

const masterCarTypes = new Schema({
    admin_id: { type: mongoose.Types.ObjectId, requried: true },
    car_type: { type: String, required: true },
    car_type_logo: { type: String, required: true },
    key: { type: String, enum: [carTypesKey.hatchback, carTypesKey.sedan, carTypesKey.premium], required: false },
    added_by: { type: mongoose.Types.ObjectId, required: true },
    modified_by: { type: mongoose.Types.ObjectId, required: true },
    added_date: { type: Date, required: true, default: () => new Date() },
    modified_date: { type: Date, required: true, default: () => new Date() },
    status: { type: String, required: true, default: dbStatus.active },
    is_active: { type: Boolean, required: true, default: true }
})
const MasterCarTypes = mongoose.model("cw_admin_car_types_master", masterCarTypes);

const masterServiceShiftTime = new Schema({
    admin_id: { type: mongoose.Types.ObjectId, requried: true },
    shift: { type: String, required: true },
    from_time: { type: Date, required: true },
    to_time: { type: Date, required: true },
    am_or_pm: { type: String, enum: [AMorPM.am, AMorPM.pm], required: true },
    key: { type: String, enum: [serviceDayTimeKey.morning, serviceDayTimeKey.evening], required: true },
    added_by: { type: mongoose.Types.ObjectId, required: true },
    modified_by: { type: mongoose.Types.ObjectId, required: true },
    added_date: { type: Date, required: true, default: () => new Date() },
    modified_date: { type: Date, required: true, default: () => new Date() },
    status: { type: String, required: true, default: dbStatus.active },
    is_active: { type: Boolean, required: true, default: true }
})
const MasterServiceShiftTime = mongoose.model("cw_admin_service_shift_time_master", masterServiceShiftTime);

const adminCreatePackages = new Schema({
    service_id: { type: mongoose.Types.ObjectId, required: true },
    car_type_id: { type: mongoose.Types.ObjectId, ref: MasterCarTypes, required: true },
    service_shift_time_id: { type: mongoose.Types.ObjectId, required: true },
    package_period: { type: String, enum: [packagePeriodKey.daily, packagePeriodKey.weekly, packagePeriodKey.monthly, packagePeriodKey.yearly], required: true },
    package_period_duration: { type: Number, required: true },
    price: { type: Number, required: true },
    added_by: { type: mongoose.Types.ObjectId, required: true },
    modified_by: { type: mongoose.Types.ObjectId, required: true },
    added_date: { type: Date, required: true, default: () => new Date() },
    modified_date: { type: Date, required: true, default: () => new Date() },
    status: { type: String, required: true, default: dbStatus.active },
    is_active: { type: Boolean, required: true, default: true }
})
const AdminCreatePackages = mongoose.model("cw_admin_packages_info", adminCreatePackages);

const adminPackageFeature = new Schema({
    package_id: { type: mongoose.Types.ObjectId, required: true },
    feature_info: { type: String, requried: true },
    added_by: { type: mongoose.Types.ObjectId, required: true },
    modified_by: { type: mongoose.Types.ObjectId, required: true },
    added_date: { type: Date, required: true, default: () => new Date() },
    modified_date: { type: Date, required: true, default: () => new Date() },
    status: { type: String, required: true, default: dbStatus.active },
    is_active: { type: Boolean, required: true, default: true }
})
const AdminPackageFeature = mongoose.model("cw_admin_package_feature", adminPackageFeature);

const userRegisteration = new Schema({
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    country_code: { type: String, required: true, default: "+91" },
    mobile_no: { type: String, required: true },
    mobile_otp: { type: String, maxlength: 4, required: true },
    is_mobile_verified: { type: Boolean, required: true, default: false },
    email: { type: String, required: false },
    profile_pic: { type: String, required: false },
    full_address: { type: String, required: false },
    address_nickname : {type: String, required: false},
    location: {
        type: { type: String, enum: ["Point"], required: false },
        coordinates: { type: [Number], required: false }
    },
    state_name: { type: String, required: false },
    country_name: { type: String, required: false },
    pin_code: { type: String, required: false },
    access_token: { type: String, required: false },
    added_date: { type: Date, required: true, default: () => new Date() },
    modified_date: { type: Date, required: true, default: () => new Date() },
    status: { type: String, required: true, default: dbStatus.pending },
    is_active: { type: Boolean, required: true, default: true }
})
userRegisteration.index({ location: "2dsphere" });
userRegisteration.index({ is_active: 1 });
userRegisteration.index({ added_date: -1, id: -1 });

const UserRegisteration = mongoose.model("cw_user_profile", userRegisteration);

const userLocation = new Schema({
    user_id: { type: mongoose.Types.ObjectId, required: true },
    full_address: { type: String, required: true },
    address_nickname : {type: String, required: true},
    is_default : {type: Boolean, required: true},
    location: {
        type: { type: String, enum: ["Point"], required: true },
        coordinates: { type: [Number], required: true }
    },
    country_name: { type: String, required: true },
    state_name: { type: String, required: true },
    pin_code: { type: String, required: true },
    added_by: { type: mongoose.Types.ObjectId, required: true },
    modified_by: { type: mongoose.Types.ObjectId, required: true },
    added_date: { type: Date, required: true, default: () => new Date() },
    modified_date: { type: Date, required: true, default: () => new Date() },
    status: { type: String, required: true, default: dbStatus.active },
    is_active: { type: Boolean, required: true, default: true }
})
userLocation.index({ location: "2dsphere" });
const UserLocation = mongoose.model("cw_user_location", userLocation);

const userCarDetails = new Schema({
    user_id: { type: mongoose.Types.ObjectId, required: true },
    vehicle_id: { type: String, required: true },
    owner_name: { type: String, required: true },
    registeration_date: { type: Date, required: true },
    car_name: { type: String, required: true },
    car_type: { type: String, required: true },
    steering: { type: String, required: true },
    color: { type: String, required: true },
    fuel_type: { type: String, required: true },
    insurance_expiry_date: { type: Date, required: true },
    insurance_company_name: { type: String, required: true },
    puc_expiry_date: { type: Date, required: true },
    puc_company_name: { type: String, required: true },
    insurance_status: { type: String, required: true },
    puc_status: { type: String, required: true },
    car_image: { type: String, required: false },
    added_by: { type: String, required: true },
    modified_by: { type: String, required: true },
    added_date: { type: Date, required: true, default: () => new Date() },
    modified_date: { type: Date, required: true, default: () => new Date() },
    status: { type: String, required: true, default: dbStatus.active },
    is_active: { type: Boolean, required: true, default: true }
})
const UserCarDetails = mongoose.model("cw_user_car_details", userCarDetails);

const userBuyPackage = new Schema({
    user_id: { type: mongoose.Types.ObjectId, required: true },
    package_id: { type: mongoose.Types.ObjectId, required: true },
    service_id: { type: mongoose.Types.ObjectId, required: true },
    car_type_id: { type: mongoose.Types.ObjectId, required: true },
    service_shift_time_id: { type: mongoose.Types.ObjectId, required: true },
    start_date: { type: Date, required: true },
    expiry_date: { type: Date, required: true },
    start_time: { type: Date, required: true },
    end_time: { type: Date, required: true },
    user_car_details_id: { type: mongoose.Types.ObjectId, required: true },
    cleaner_id: { type: mongoose.Types.ObjectId, required: true },
    location: {
        type: { type: String, enum: ["Point"], required: true },
        coordinates: { type: [Number], required: true }
    },
    user_location_id : {type: mongoose.Types.ObjectId, required: true},
    price: { type: Number, required: true },
    added_by: { type: mongoose.Types.ObjectId, required: true },
    modified_by: { type: mongoose.Types.ObjectId, required: true },
    added_date: { type: Date, required: true, default: () => new Date() },
    modified_date: { type: Date, required: true, default: () => new Date() },
    status: { type: String, required: true, default: dbStatus.active },
    is_active: { type: Boolean, required: true, default: true }
})
const UserBuyPackage = mongoose.model("cw_user_buy_package", userBuyPackage);

const userBooking = new Schema({
    user_id: { type: mongoose.Types.ObjectId, required: true },
    user_buy_package_id : {type: mongoose.Types.ObjectId,required: true},
    package_id : {type: mongoose.Types.ObjectId, required: true},
    user_car_details_id: { type: mongoose.Types.ObjectId, required: true },
    service_date: { type: Date, required: true },
    start_time: { type: Date, required: true },
    end_time: { type: Date, required: true },
    cleaner_id: { type: mongoose.Types.ObjectId, required: true },
    status: { type: String, required: true, default: dbStatus.upcoming },
    added_by: { type: mongoose.Types.ObjectId, required: true },
    modified_by: { type: mongoose.Types.ObjectId, required: true },
    added_date: { type: Date, required: true, default: () => new Date() },
    modified_date: { type: Date, required: true, default: () => new Date() },
    is_active: { type: Boolean, required: true, default: true }
})
const UserBooking = mongoose.model("cw_user_booking", userBooking);


const cleanerProfile = new Schema({
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    country_code: { type: String, required: true, default: "+91" },
    mobile_no: { type: String, required: true },
    mobile_otp: { type: String, maxlength: 4, required: true },
    is_mobile_verified: { type: Boolean, required: true, default: false },
    email: { type: String, required: false },
    profile_pic: { type: String, required: false },
    full_address: { type: String, required: false },
    state_id: { type: String, required: false },
    state_name: { type: String, required: false },
    district_id: { type: String, required: false },
    district_name: { type: String, required: false },
    pincode: { type: String, required: false },
    access_token: { type: String, required: false },
    added_date: { type: Date, required: true, default: () => new Date() },
    modified_date: { type: Date, required: true, default: () => new Date() },
    status: { type: String, required: true, default: dbStatus.pending },
    is_active: { type: Boolean, required: true, default: true }
})
cleanerProfile.index({ is_active: 1 });
cleanerProfile.index({ added_date: -1, id: -1 });
const CleanerProfile = mongoose.model("cw_cleaner_profile", cleanerProfile);

const cleanerDocuments = new Schema({
    cleaner_id : {type: mongoose.Types.ObjectId, required: true},
    aadhar_no: {type: String, required: true},
    aadhar_doc_file: {type: String, required: true},
    pan_no : {type: String, required: true},
    pan_doc_file : {type: String, required: true},
    added_by: {type: mongoose.Types.ObjectId, required: true},
    modified_by : {type: mongoose.Types.ObjectId, required: true},
    added_date : {type: Date, required: true, default: ()=> new Date()},
    modified_date : {type: Date, required: true, default: ()=> new Date()},
    status: {type: String, required: true, default: dbStatus.active},
    is_active : {type: Boolean, required: true, default: true}
})
const CleanerDocuments = mongoose.model("cw_cleaner_documents",cleanerDocuments);

const cleanerBankDetails = new Schema({
    cleaner_id: { type: mongoose.Types.ObjectId, required: true },
    bank_name: { type: String, required: true },
    acc_holder_name: { type: String, required: true },
    acc_type: {type: String, required: true},
    acc_no: { type: String, required: true },
    ifsc_code: { type: String, required: true },
    added_by: { type: mongoose.Types.ObjectId, required: true },
    modified_by: { type: mongoose.Types.ObjectId, required: true },
    added_date: { type: Date, required: true, default: () => new Date() },
    modified_date: { type: Date, required: true, default: () => new Date() },
    status: { type: String, required: true, default: dbStatus.active },
    is_active: { type: Boolean, required: true, default: true }
})
const CleanerBankDetails = mongoose.model("cw_cleaner_bank_details", cleanerBankDetails);

const cleanerAttendance = new Schema({
    cleaner_id : {type: mongoose.Types.ObjectId, required: true},
    check_in : {type: Date, required: false},
    check_out: {type: Date, required: false},
    // break_time : {type: String, required: true},
    added_by : {type: mongoose.Types.ObjectId, required: true},
    modified_by : {type: mongoose.Types.ObjectId, required: true},
    added_date : {type: Date, required: true, default : ()=> new Date()},
    modified_date : {type: Date, required: true,default : ()=> new Date()},
    status : {type: String, required: true, default : dbStatus.active},
    is_active : {type: Boolean, required: true, default: true}
})
const CleanerAttendance = mongoose.model("cw_cleaner_attendance",cleanerAttendance);

const adminCountryTable = new Schema({
    country_name: { type: String, required: true },
    country_code: { type: String, required: true },
    dialing_code: { type: Number, required: true },
    status: { type: String, required: true, default: dbStatus.active },
    added_by: { type: mongoose.Types.ObjectId, required: true },
    modified_by: { type: mongoose.Types.ObjectId, required: true },
    added_date: { type: Date, required: true, default: () => new Date() },
    modified_date: { type: Date, required: true, default: () => new Date() },
    is_active: { type: Boolean, required: true, default: true }
})
const AdminCountryTable = mongoose.model("cw_admin_country", adminCountryTable);

const adminStateTable = new Schema({
    country_id: { type: mongoose.Types.ObjectId, required: true },
    country_name: { type: String, required: true },
    state_name: { type: String, required: true },
    state_code: { type: String, required: true },
    status: { type: String, required: true, default: dbStatus.active },
    // added_by: { type: mongoose.Types.ObjectId, required: true },
    // modified_by: { type: mongoose.Types.ObjectId, required: true },
    added_date: { type: Date, required: true, default: () => new Date() },
    modified_date: { type: Date, required: true, default: () => new Date() },
    // is_active: {type: Boolean, required: true, default: true}
})
const AdminStateTable = mongoose.model("cw_admin_state", adminStateTable);

const adminDistrictTable = new Schema({
    country_id: { type: mongoose.Types.ObjectId, required: true },
    state_id: { type: mongoose.Types.ObjectId, required: true },
    state_name: { type: String, required: true },
    district_name: { type: String, required: true },
    status: { type: String, required: true, default: dbStatus.active },
    added_by: { type: mongoose.Types.ObjectId, required: true },
    modified_by: { type: mongoose.Types.ObjectId, required: true },
    added_date: { type: Date, required: true, default: () => new Date() },
    modified_date: { type: Date, required: true, default: () => new Date() },
    is_active: { type: Boolean, required: true, default: true }
})
const AdminDistrictTable = mongoose.model("cw_admin_district", adminDistrictTable);

const adminDiscountDetails = new Schema({
    service_id: { type: mongoose.Types.ObjectId, required: true },
    start_date: { type: Date, required: true },
    expiry_date: { type: Date, required: true },
    discount_no: { type: String, required: true },
    discount_type: { type: String, enum: ["PERCENTAGE", "FLAT"], required: true },
    discount_value: { type: String, required: true },
    added_by: { type: mongoose.Types.ObjectId, required: true },
    modified_by: { type: mongoose.Types.ObjectId, required: true },
    added_date: { type: Date, required: true, default: () => new Date() },
    modified_date: { type: Date, required: true, default: () => new Date() },
    status: { type: String, required: true, default: dbStatus.active },
    is_active: { type: Boolean, required: true, default: true }
})
const AdminDiscountDetails = mongoose.model("cw_admin_discount_details", adminDiscountDetails);

const adminGeneralSetting = new Schema({
    admin_id: { type: mongoose.Types.ObjectId, required: true },
    cleaner_subscribed_limits: { type: Number, required: true },
    platform_fees: { type: Number, required: true },
    added_by: { type: mongoose.Types.ObjectId, required: true },
    modified_by: { type: mongoose.Types.ObjectId, required: true },
    added_date: { type: Date, required: true, default: () => new Date() },
    modified_date: { type: Date, required: true, default: () => new Date() },
    status: { type: String, required: true, default: dbStatus.active },
    is_active: { type: Boolean, required: true, default: true }
})
const AdminGeneralSetting = mongoose.model("cw_admin_general_setting", adminGeneralSetting);

const adminTermAndCondition = new Schema({
    admin_id: { type: mongoose.Types.ObjectId, required: true },
    term_title: { type: String, required: true },
    term_description: { type: String, required: true },
    added_by: { type: mongoose.Types.ObjectId, required: true },
    modified_by: { type: mongoose.Types.ObjectId, required: true },
    added_date: { type: Date, required: true, default: () => new Date() },
    modified_date: { type: Date, required: true, default: () => new Date() },
    status: { type: String, required: true, default: dbStatus.active },
    is_active: { type: Boolean, required: true, default: true }
})
const AdminTermAndCondition = mongoose.model("cw_admin_term_and_conditon", adminTermAndCondition);

const adminPrivacyPolicy = new Schema({
    admin_id: { type: mongoose.Types.ObjectId, required: true },
    privacy_title: { type: String, required: true },
    privacy_description: { type: String, required: true },
    added_by: { type: mongoose.Types.ObjectId, required: true },
    modified_by: { type: mongoose.Types.ObjectId, required: true },
    added_date: { type: Date, required: true, default: () => new Date() },
    modified_date: { type: Date, required: true, default: () => new Date() },
    status: { type: String, required: true, default: dbStatus.active },
    is_active: { type: Boolean, required: true, default: true }
})
const AdminPrivacyPolicy = mongoose.model("cw_admin_privacy_policy", adminPrivacyPolicy);








const testingDateAndTime = new Schema({
    from_time: { type: Date, required: true },
    to_time: { type: Date, required: true },
    from_number: { type: Number, required: true },
    to_number: { type: Number, required: true },
})
const TestingDateAndTime = mongoose.model("cw_testing_date_and_time", testingDateAndTime);

const testingGeoLocation = new Schema({
    location: {
        type: { type: String, enum: ["Point"], required: true },
        coordinates: { type: [Number], required: true }
    },
    status: { type: String, required: true, default: "ACTIVE" },
    is_active: { type: Boolean, required: true, default: true }
})
const TestingGeoLocation = mongoose.model("cw_testing_geo_location",testingGeoLocation);
testingGeoLocation.index({ location: "2dsphere" });


module.exports = {
    AdminLogin: AdminLogin,
    AdminCleanerWorkingLocation: AdminCleanerWorkingLocation,
    MasterServiceTable: MasterServiceTable,
    MasterCarTypes: MasterCarTypes,
    MasterServiceShiftTime: MasterServiceShiftTime,
    AdminCreatePackages: AdminCreatePackages,
    AdminPackageFeature: AdminPackageFeature,
    UserRegisteration: UserRegisteration,
    CleanerProfile: CleanerProfile,
    CleanerDocuments : CleanerDocuments,
    CleanerBankDetails: CleanerBankDetails,
    CleanerAttendance : CleanerAttendance,
    UserLocation: UserLocation,
    UserCarDetails: UserCarDetails,
    UserBuyPackage: UserBuyPackage,
    UserBooking: UserBooking,
    AdminCountryTable: AdminCountryTable,
    AdminStateTable: AdminStateTable,
    AdminDistrictTable: AdminDistrictTable,
    AdminDiscountDetails: AdminDiscountDetails,
    AdminGeneralSetting: AdminGeneralSetting,
    AdminTermAndCondition: AdminTermAndCondition,
    AdminPrivacyPolicy: AdminPrivacyPolicy,
    TestingDateAndTime: TestingDateAndTime,
    TestingGeoLocation : TestingGeoLocation
}