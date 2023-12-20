"use strict"
const httpContext = require("express-http-context");
const joi = require("joi");
const path = require("path");
const businessModel = require("../model/business_model");
const { response } = require("../utils/api_response");
const constantFilePath = require("../utils/constant_file_path").constantFilePath;


let dataSet = {};

module.exports.insertBankDetailsCleaner = async (req, resp) => {
    try {
        const validatedBankDetails = await validateBankDetails.validateAsync(req.body);
        const loginDetails = httpContext.get("loginDetails");
        // let imageFilePath1;
        // let imageFilePath2;
        // if(req.files.aadhar_doc && req.files.pan_card_doc){
        //     const folderName = path.join(constantFilePath, "cleaner_bank_documents", loginDetails.login_id);
        //     if (!fs.existsSync(folderName)) {
        //         await fs.promises.mkdir(folderName);
        //     }
        //     const inputFile1 = req.files.aadhar_doc;
        //     const destFileName1 = loginDetails.login_id +"_aadhar_doc.pdf";
        //     imageFilePath1 = path.join("cleaner_profile_photo", destFileName1);
        //     const storeFilePath1 = path.join(constantFilePath, imageFilePath1);
        //     await inputFile1.mv(storeFilePath1);

        //     const inputFile2 = req.files.pan_card_doc;
        //     const destFileName2 = loginDetails.login_id +"_pan_card_doc.pdf";
        //     imageFilePath1 = path.join("cleaner_profile_photo", destFileName2)
        //     const storeFilePath2 = path.join(constantFilePath, imageFilePath2);
        //     await inputFile2.mv(storeFilePath2);
        // }
        const fetchAllReadyCleanerBankInfo = await businessModel.fetchBankDetailsCleaner();
        if (fetchAllReadyCleanerBankInfo.code === 500) {
            return resp.status(500).json(fetchAllReadyCleanerBankInfo);
        }
        if (fetchAllReadyCleanerBankInfo.length > 0) {
            const updateCleanerBankDetails = await businessModel.updateBankDetailsCleaner(fetchAllReadyCleanerBankInfo[0]._id, req.body);
            if (updateCleanerBankDetails.code === 500) {
                return resp.status(500).json(updateCleanerBankDetails);
            }
            dataSet = response(200, "Update Successfully");
            return resp.status(200).json(dataSet);
        }
        if (fetchAllReadyCleanerBankInfo.length <= 0) {
            const insertCleanerBankDetails = await businessModel.insertCleanerBankDetails(req.body);
            if (insertCleanerBankDetails.code === 500) {
                return resp.status(500).json(insertCleanerBankDetails);
            }
            dataSet = response(200, "Successfully Inserted");
            return resp.status(200).json(dataSet);
        }
    } catch (e) {
        dataSet = response(422, "Error During Insert Bank Details", e.message);
        resp.status(422).json(dataSet);
    }
}

module.exports.insertCleanerAttendance = async (req, resp) => {
    try {
        const validateCleanerAttendance = await validateCleanerAttendace.validateAsync(req.body);
        const checkCleanerAssignedLocation = await businessModel.checkCleanerAssignedLocation(req.body);
        if (checkCleanerAssignedLocation.code === 500) {
            return resp.status(500).json(checkCleanerAssignedLocation)
        }
        if (checkCleanerAssignedLocation.length <= 0) {
            dataSet = response(422, "Currently Cleaner Have No Jobs");
            return resp.status(422).json(dataSet);
        }
        const checkAlreadyTodayCleanerAttendanceExist = await businessModel.checkTodayCleanerAttendance(req.body);
        if (checkAlreadyTodayCleanerAttendanceExist.code === 500) {
            return resp.status(500).json(checkAlreadyTodayCleanerAttendanceExist);
        }
        if (checkAlreadyTodayCleanerAttendanceExist.length > 0) {
            const updateTodayCleanerAttendance = await businessModel.updateTodayCleanerAttendance(checkAlreadyTodayCleanerAttendanceExist[0]._id, req.body);
            if (updateTodayCleanerAttendance.code === 500) {
                return resp.status(500).json(updateTodayCleanerAttendance);
            }
        }
        if (checkAlreadyTodayCleanerAttendanceExist.length <= 0) {
            const insertCleanerAttendance = await businessModel.insertCleanerAttendance(req.body);
            if (insertCleanerAttendance.code === 500) {
                return resp.status(500).json(insertCleanerAttendance);
            }
            // const cleanerAllLocationJobs = await businessModel.fetchCleanerWorkLocationDetails(req.body);
            // if(cleanerAllLocationJobs.code === 500){
            //     return resp.status(500).json(cleanerAllLocationJobs);
            // }
            // if(cleanerAllLo)
            const updateCleanerActiveJobs = await businessModel.updateCleanerActiveJobs(checkCleanerAssignedLocation[0].subscribed_jobs);
            if (updateCleanerActiveJobs.code === 500) {
                return resp.status(500).json(updateCleanerActiveJobs);
            }
        }
        dataSet = response(200, "Done Successfully");
        resp.status(200).json(dataSet);
    } catch (e) {
        dataSet = response(422, "Error During Insert Cleaner Attendance", e.message);
        resp.status(422).json(dataSet);
    }
}


module.exports.getCleanerParticularDateAttendance = async (req, resp) => {
    try {
        // const validatedGetCleanerDate = await validateGetCleanerDate.validateAsync(req.body);
        const fetchCleanerParticularDateAttendance = await businessModel.fetchParticularDateCleanerAttendace(req.query);
        if (fetchCleanerParticularDateAttendance.code === 500) {
            return resp.status(500).json(fetchCleanerParticularDateAttendance);
        }
        let startDateOfMonth = new Date(req.query.particular_date);
        startDateOfMonth.setDate(1);
        let lastDateOfMonth = new Date(req.query.particular_date);
        lastDateOfMonth = new Date(lastDateOfMonth.getFullYear(), lastDateOfMonth.getMonth() + 1, 0)
        const totalDaysOnThisMonth = await businessModel.fetchTotalDaysInThisMonth(startDateOfMonth, lastDateOfMonth);
        if (totalDaysOnThisMonth.code === 500) {
            return resp.status(500).json(totalDaysOnThisMonth);
        }
        const responseObject = {
            cleaner_attendance_list: [...fetchCleanerParticularDateAttendance],
            cleaner_work_total_days_in_month: totalDaysOnThisMonth
        }
        dataSet = response(200, "Cleaner Particular Date Attendance", responseObject);
        resp.status(200).json(dataSet);
    } catch (e) {
        dataSet = response(422, "Error During Fetch Cleaner Particular Attendance", e.message);
        resp.status(422).json(dataSet);
    }
}


module.exports.insertCleanerStartWorking = async (req, resp) => {
    try {
        const validatedCleanerWorkHistory = await validateCleanerWorkHistory.validateAsync(req.body);
        const alreadyTodayParticularVehicleWorkInsert = await businessModel.alreadyTodayParticularVehicleCleanerExist(req.body);
        if (alreadyTodayParticularVehicleWorkInsert?.code === 500) {
            return resp.status(500).json(alreadyTodayParticularVehicleWorkInsert);
        }
        if (alreadyTodayParticularVehicleWorkInsert === null) {
            const insertCleanerWorkHistory = await businessModel.insertCleanerWorkStart(req.body);
            if (insertCleanerWorkHistory.code === 500) {
                return resp.status(500).json(insertCleanerWorkHistory);
            }
            const updateBookingStatus = await businessModel.updateBookingStatus(req.body);
            if (updateBookingStatus.code === 500) {
                return resp.status(500).json(updateBookingStatus);
            }
            dataSet = response(200, "Inserted Successfully");
            resp.status(200).json(dataSet);
        }
    } catch (e) {
        dataSet = response(422, "Error During Insert Cleaner Work History", e.message);
        resp.status(422).json(dataSet);
    }
}

module.exports.updateStartingWorkImage = async (req, resp) => {
    try {
        let imageFilePathArr = [];
        if (req.files?.starting_image.length > 0) {
            let imageFilePath;
            for (let i = 0; i < req.files.starting_image.length; i++) {
                const fileExtension = path.extname(req.files.starting_image[i].name).toLowerCase();
                if (fileExtension === ".png" || fileExtension === ".jpg" || fileExtension === ".jpeg") {
                    const inputFile = req.files.starting_image[i];
                    const destFileName = Date.now() + `${fileExtension}`;
                    imageFilePath = path.join("cleaner_working_images", destFileName);
                    imageFilePathArr.push(imageFilePath);
                    const storeFilePath = path.join(constantFilePath, imageFilePath);
                    await inputFile.mv(storeFilePath);
                } else {
                    dataSet = response(422, "Please Upload Either .JPG or .PNG Image");
                    return resp.status(422).json(dataSet);
                }
            }
        } else {
            dataSet = response(200, "Please Upload Image File");
            return resp.status(200).json(dataSet);
        }
        const updateStartingWorkImage = await businessModel.updateStartingWorkImage(req.body.cleaner_history_id, imageFilePathArr);
        if (updateStartingWorkImage.code === 500) {
            return resp.status(500).json(updateStartingWorkImage);
        }
        dataSet = response(200, "Starting Image Successfully Added");
        resp.status(200).json(dataSet);
    } catch (e) {
        dataSet = response(422, "Error During Update Start IMage", e.message);
        resp.status(422).json(dataSet);
    }
}

module.exports.updateEndingWorkImage = async (req, resp) => {
    try {
        let imageFilePathArr = [];
        if (req.files?.ending_image.length > 0) {
            let imageFilePath;
            for (let i = 0; i < req.files.ending_image.length; i++) {
                const fileExtension = path.extname(req.files.ending_image[i].name).toLowerCase();
                if (fileExtension === ".png" || fileExtension === ".jpg" || fileExtension === ".jpeg") {
                    const inputFile = req.files.ending_image[i];
                    const destFileName = Date.now() + `${fileExtension}`;
                    imageFilePath = path.join("cleaner_working_images", destFileName);
                    imageFilePathArr.push(imageFilePath);
                    const storeFilePath = path.join(constantFilePath, imageFilePath);
                    await inputFile.mv(storeFilePath);
                } else {
                    dataSet = response(422, "Please Upload Either .JPG or .PNG Image");
                    return resp.status(422).json(dataSet);
                }
            }
        } else {
            dataSet = response(200, "Please Upload Image File");
            return resp.status(200).json(dataSet);
        }
        const updateStartingWorkImage = await businessModel.updateEndingWorkImage(req.body.cleaner_history_id, imageFilePathArr);
        if (updateStartingWorkImage.code === 500) {
            return resp.status(500).json(updateStartingWorkImage);
        }
        dataSet = response(200, "Ending Image Successfully Added");
        resp.status(200).json(dataSet);
    } catch (e) {
        dataSet = response(422, "Error During Update End Image", e.message);
        resp.status(422).json(dataSet);
    }
}

module.exports.updateCleanerEndWork = async (req, resp) => {
    try {
        const updateClenanerCompletedWork = await businessModel.updateCleanerCompleteWork(req.body);
        if (updateClenanerCompletedWork.code === 500) {
            return resp.status(500).json(updateClenanerCompletedWork)
        }
        const updateBookingStatusCompleted = await businessModel.updateBookingCompleted(req.body);
        if(updateBookingStatusCompleted.code === 500){
            return resp.status(500).json(updateBookingStatusCompleted);
        }
        const fetchCleanerAllJobs = await businessModel.fetchCleanerAllJobs();
        if(fetchCleanerAllJobs.code === 500){
            return resp.status(500).json(fetchCleanerAllJobs);
        }
        const updateTotalCompletedJobsCleaner = await businessModel.updateTotalCompletedJobsCleaner(fetchCleanerAllJobs.completed_jobs+1,fetchCleanerAllJobs.active_jobs-1,fetchCleanerAllJobs._id);
        if(updateTotalCompletedJobsCleaner.code === 500){
            return resp.status(500).json(updateTotalCompletedJobsCleaner);
        }
        dataSet = response(200, "Cleaner Ended Work");
        resp.status(200).json(dataSet);
    } catch (e) {
        dataSet = response(422, "Error During Image SUccessfully Added");
        resp.status(422).json(dataSet);
    }
}

module.exports.upcomingCleanerJobs = async (req, resp) => {
    try {
        const cleanerAssignedJobs = await businessModel.fetchCleanerUpcomingJobs();
        if (cleanerAssignedJobs.code === 500) {
            return resp.status(500).json(cleanerAssignedJobs);
        }
        // if(cleanerAssignedJobs.length > 0){
        for (let i = 0; i < cleanerAssignedJobs.length; i++) {
            cleanerAssignedJobs[i].user_car_details_id.car_image = process.env.IMAGE_BASE_URL + "/" + cleanerAssignedJobs[i].user_car_details_id.car_image;
        }
        // }
        dataSet = response(200, "Upcoming Jobs List", cleanerAssignedJobs);
        resp.status(200).json(dataSet);
    } catch (e) {
        dataSet = response(422, "Error During Fetch Upcoming Jobs", e.message);
        resp.status(422).json(dataSet);
    }
}

module.exports.cleanerAllActiveJobs = async (req, resp) => {
    try {
        const fetchCleanerTotalActiveJobs = await businessModel.fetchCleanerTotalActiveJobs();
        if (fetchCleanerTotalActiveJobs.code === 500) {
            return resp.status(500).json(fetchCleanerTotalActiveJobs);
        }
        if (fetchCleanerTotalActiveJobs.active_jobs < 0) {
            dataSet = response(422, "No Active Jobs");
            return resp.status(422).json(dataSet);
        }
        const fetchCleanerAllActiveJobs = await businessModel.fetchCleanerUpcomingJobs();
        if (fetchCleanerAllActiveJobs.code === 500) {
            return resp.status(500).json(fetchAllActiveJobs);
        }
        dataSet = response(200, "Active Jobs List", fetchCleanerAllActiveJobs);
        resp.status(200).json(dataSet);
    } catch (e) {
        dataSet = response(422, "Error During Fetch Cleaner Active Jobs", e.message);
        resp.status(422).json(dataSet);
    }
}

module.exports.cleanerParticularActiveJobs = async (req, resp) => {
    try {
        //req.query.booking_id
        const fetchParticularBookingDetails = await businessModel.fetchParticularBooking(req.query);
        if (fetchParticularBookingDetails.code === 500) {
            return resp.status(500).json(fetchParticularBookingDetails);
        }
        if(fetchParticularBookingDetails.status !== "UPCOMING"){
            console.log("hii upcoming");
        }
        dataSet = response(200, "Particular Booking Details", fetchParticularBookingDetails);
        resp.status(200).json(dataSet);
    } catch (e) {
        dataSet = response(422, "Error During Particular Cleaner Active Jobs", e.message);
    }
}

// module.exports.insertCleanerWorkProgress = async (req,resp) => {
//     try{
//         const alreadyTodayParticularVehicleWorkInsert = await businessModel.alreadyTodayParticularVehicleCleanerExist(req.body);
//         if(alreadyTodayParticularVehicleWorkInsert.code === 500){
//             return resp.status(500).json(alreadyTodayParticularVehicleWorkInsert);
//         }

//         const insertCleanerWorkProgress = await businessModel.insertCleanerWorkProgress(req.body);
//     }catch(e){
//         dataSet = response(422,"Error During Insert Cleaner Work History",e.message);
//         resp.status(422).json(dataSet);
//     }
// }


module.exports.fetchCountryData = async (req, resp) => {
    try {
        const fetchCountryList = await businessModel.fetchCountryList();
        if (fetchCountryList.code === 500) {
            return resp.status(500).json(fetchCountryList);
        }
        dataSet = response(200, "Country List", fetchCountryList);
        resp.status(200).json(dataSet);
    } catch (e) {
        dataSet = response(422, "Error During Fetching Country Data", e.message);
        resp.status(422).json(dataSet);
    }
}

const validateBankDetails = joi.object({
    bank_name: joi.string().required(),
    acc_holder_name: joi.string().required(),
    acc_no: joi.string().required(),
    ifsc_code: joi.string().required(),
    acc_type: joi.string().required()
})


const validateCleanerAttendace = joi.object({
    check_in: joi.string().optional(),
    check_out: joi.string().optional()
})

const validateGetCleanerDate = joi.object({

})

const validateCleanerWorkHistory = joi.object({
    user_id: joi.string().required(),
    booking_id: joi.string().required(),
    user_car_details_id: joi.string().required(),
    user_location_id: joi.string().required(),
    start_time: joi.string().optional(),
})