"use strict"
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const httpContext = require("express-http-context");
const fileUpload = require("express-fileupload");
require("dotenv").config({path: path.join(__dirname,"environment",".env.development")});



const userRoutes = require("./routes/user_routes");
const businessAuth = require("./controller/business_auth");
const cleanerRoutes = require("./routes/cleaner_routes");
const crmRoutes = require("./routes/crm_routes");




const app = express();
app.use(bodyParser.json());
app.use(fileUpload());
app.use(httpContext.middleware);
const publicFolderPath = path.join(__dirname,"assests");
app.use(express.static(publicFolderPath));



// console.log("process")
// require("dotenv").config();

//Enable CORS for HTTP methods
app.use((req, resp, next) => {
    resp.header("Access-Control-Allow-Origin", "*",);
    resp.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
    resp.header("Access-Control-Allow-Headers", "Origin, X-Requested-With,Authorization,Content-Type,Accept,cw_api_key");
    next();
});


app.use("/api/user",userRoutes);
app.use("/api/cleaner",cleanerRoutes);
app.use("/api/crm",crmRoutes);

app.get("/api/fetch-country-list",businessAuth.fetchCountryList);
app.get("/api/fetch-state-list",businessAuth.fetchStateList);
app.get("/api/fetch-district-list",businessAuth.fetchDistrictList);


//here this is used when we want to confirm backend server is running or not via browser.
app.get("/", (req, resp) => {
    resp.status(200).send({code : 200,message:"Welcome to Car Washing Backend Apis"});
});




const port = process.env.PORT || 2000;
var server = app.listen(port, () => {
    console.log(`Server Started : Listen on : ${port}`)
})