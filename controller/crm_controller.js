const businessModel = require("../model/business_model");
const response = require("../utils/api_response").response;

let dataSet = {};


module.exports.allUserDetailsForCRM = async (req,resp) => {
    try{
        const fetchAllUser = await businessModel.fetchAllUserForCRM();
        if(fetchAllUser.code === 500){
            return resp.status(500).json(fetchAllUser);
        }
        dataSet = response(200,"All User Details",fetchAllUser);
        resp.status(200).json(dataSet);
    }catch(e){
        dataSet = response(422,"Error In Crm",e.message);
        resp.status(422).json(dataSet);
    }
}

module.exports.allCleanerDetailsCRM = async (req,resp) => {
    try{
        const fetchAllCleaner = await businessModel.fetchAllCleanerForCRM();
        if(fetchAllCleaner.code === 500){
            return resp.status(500).json(fetchAllCleaner);
        }
        dataSet = response(200,"All Cleaner Details",fetchAllCleaner);
        resp.status(200).json(dataSet);
    }catch(e){
        dataSet = response(422,"Error In Crm",e.message);
        resp.status(422).json(dataSet);
    }
}

module.exports.crmFetchUserProfile = async (req,resp) => {
    try{
        const fetchUserProfile = await businessModel.fetchUserDetailsForCRM(req.query);
        if(fetchUserProfile.code === 500){
            return resp.status(500).json(fetchUserProfile);
        }
        dataSet = response(200,"Fetch User Profile Sucess",fetchUserProfile);
        resp.status(200).json(dataSet);
    }catch(e){
        dataSet = response(422,"Error in Crm",e.message);
        resp.status(422).json(dataSet);
    }
}


module.exports.crmFetchCleanerProfile = async (req,resp) => {
    try{
        const fetchCleanerProfile = await businessModel.fetchCleanerDetailsForCRM(req.query);
        if(fetchCleanerProfile.code === 500){
            return resp.status(500).json(fetchCleanerProfile);
        }
        dataSet = response(200,"Fetch Cleaner Profile Sucess",fetchCleanerProfile);
        resp.status(200).json(dataSet);
    }catch(e){
        dataSet = response(422,"Error In Crm",e.message);
        resp.status(422).json(dataSet);
    }
}