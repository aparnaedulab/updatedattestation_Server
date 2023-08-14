"use strict";
var path = require('path');
var root_path = path.dirname(require.main.filename);
const express = require('express');
var cors = require('cors')
const morgan = require('morgan');
const bodyParser = require('body-parser');
const auth = require('./auth/auth.js')();
const checkjwt = require('express-jwt');
const app = express(); 
var cfg = require('./auth/config.js');
var models = require("./models");
var cons = require('consolidate');
var constant = require(root_path+'/config/constant');
const logger = require('./logger')(__filename);
var student = require('./routes/student');
var admin = require('./routes/admin');
var functions = require('./routes/functions'); 


app.use(cors());

// view engine setup
app.engine('html', cons.swig)
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');

//swagger imports
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
//swagger setup
const swaggerDocument = YAML.load('./swagger.yaml');
app.use(morgan('dev'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

models.sequelize.sync().then(function (test) {

});


app.use((err, req, res, next) => { 
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-HTTP-Method-Override,X-Requested-With,Content-Type,Accept,content-type,application/json,Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, HEAD, OPTIONS');
  res.header("Access-Control-Allow-Credentials", true);
  if (err.name === 'UnauthorizedError') {
    res.status(401).send({
      error: 'You are unauthorised'
    });
  }
});





app.use(express.static(path.join(__dirname, 'public')));
app.use('/api/signedpdf',express.static(__dirname + "/public/signedpdf/"));
app.use('/api/images',express.static(__dirname + "/public/images/"));
// app.use('/api/register',express.static(__dirname + "/public/register/"));
app.use('/api/upload',express.static(__dirname + "/public/upload/"));

//var io = require('socket.io').listen(2);
//app.io = io;
app.use(function(req, res, next) {
  //req.io = io;
  next();
});
// io.on("connection", socket => {


//   socket.on("disconnect", function () {

//   });

//       socket.on("verifyClicked", message => {
//         setTimeout(()=>{
//           io.emit("verifyClient", message);
//             },1000);
//   });

//   socket.on("SignClicked", message => {
//     // models.Application.find({
//     //   where:{
//     //       id: message.id
//     //   }
//     // }).then(data =>{
//     //   setTimeout(()=>{
//     //   io.emit("SignClient", data);
//     // },500)
//     // })  
  
   
// });
//   socket.on("tracker", track => {
//     var root_path = path.dirname(require.main.filename);
//     var models  = require(root_path+'/models');
//     models.Application.find({
//       where:{
//           user_id: track
//       }
//     }).then(track_status =>{
//       socket.emit("tracker",track_status);
//     })  
//   });
//   //////for withdropdown
//   socket.on("trackdropdown", trackit => {
//     var root_path = path.dirname(require.main.filename);
//     var models  = require(root_path+'/models');
//     models.Application.find({
//       where:{
//           id: trackit,
//       }
//     }).then(track_status =>{
//       socket.emit("trackdropdown",track_status);
//     })
//   });
  
// });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}))
app.use(auth.initialize());
var unprotected = [
  '/api/auth/getclickDetails',
  '/api/auth/reset-pass',
  // '/api/auth/register',
  '/api/auth/forgot-password',
  '/api/auth/resetpassword',
  '/api/auth/resend-otp',
  '/api/auth/logout',
  '/api/auth/captcha',
  '/api/admin/sp',
  '/api/auth/verify-otp-reg',
  '/api/admin/adminDashboard/get_otp',
  '/api/admin/adminDashboard/deleteNotification',
  '/api/admin/getclickDetails',
  '/favicon.ico',
  '/\/public*/',
  '/\/upload*/',
  '/socket.io/',
  '/api/attestation/uploadMarkList',
  '/api/attestation/uploadUserMarkList',
  '/api/payment/success-redirect-url',
  '/api/payment/proceedRefund',
  '/api/payment/cancel-redirect-url',
  '/api/attestation/upload_document',
  '/api/support/attachment',
  '/api/abcdef',
  '/api/replyFromCollege',
  '/api/auth/checkEmail',
  '/api/admin/downloadManualAttestation',
  '/api/auth/downloadStructureFile',
  '/api/cron/collegeEmailStatusUpdate',
  '/api/cron/WESApplicationUploadStatus',
  '/api/attestation/upload_curriculum',
  '/api/payment/orderlookup',
  '/api/auth/verify-email',
  '/api/auth/refresh-token',
  '/api/admin/generateInstrucionalLetter1',
  '/api/payment/remainingpayment',
  '/api/payment/success-link-redirect-url',
  '/api/cron/purposeEmailUpdate',
  '/api/cron/statusEmailSendtoStudent',
  '/api/cron/statusEmailSendtoStudent_other',
  '/api/cron/pendingApplicationReminderMailToCollege',
  '/api/attestation/sendEmail',
  '/api/payment/changeSplitStatus',
  '/api/payment/invoicelookup',
  '/api/payment/invoicelookupCron',
  '/api/payment/multipleOrderlookup',
  '/api/payment/invoice_generation',
  '/api/payment/payment_details_one_month',
  '/api/payment/getQuickInvoice',
  '/api/payment/autoSplit',
  '/api/testApp',
  '/api/signpdf/checkWESINfo', 
  '/api/attestation/getname',
  '/api/onHoldReminderManually',
  '/api/payment/split_excel_sheets', 
  '/api/attestation/Upload_PaymentIssueUrl',
  '/api/attestation/post_applicationdata',
  '/api/attestation/Pre_applicationdata',
  '/api/attestation/getPaymentIssueDetails',
  '/api/attestation/post_applicationdata_byApp_id',
  '/api/attestation/geterror_msg',
  '/api/auth/getUserDataByEmail',
  '/api/admin/generateHrdLetter',
  '/api/cron/improvementFeedback',
  // '/api/student/register',
  '/api/student/checkstepper_inner',
  '/api/student/checkstepper',
  '/api/student/getCountry',
  '/api/student/captcha',
  '/api/student/savePaymentIssueData',
  '/api/student/getPaymentIssueData',  
  '/api/student/getProfileValue',
  '/api/student/updateProfile',
  '/api/student/getDownloadPaymentReceipt',
  '/api/student/getPreApplication',
  '/api/student/getPostApplication',
  '/api/admin/getEmailActivityTracker',

  //new students
  '/api/student/login',
  '/api/student/getUploadeddocument_student',
  '/api/student/ScanData',
  '/api/student/educationalDetails',
  '/api/student/getPurposeList',
  '/api/student/createAllInstitute',
  '/api/student/updateAllInstitute',
  '/api/student/getEducationDetailsCount',
  '/api/student/suggestInstituteallDATA',
  '/api/student/suggestInstitute',
  '/api/student/getInstituteData',
  '/api/student/deleteInstituteHrd',
  '/api/student/getAppliedDetails',
  '/api/student/getHrdInfo',
  '/api/student/updateAllHrd',
  '/api/student/getHrdData',
  '/api/student/preViewApplication',
  '/api/student/getuploadedCurriculum', 
  '/api/student/getExtraDocuments',
  '/api/student/getCollegeList',
  '/api/student/getFacultyLists',
  '/api/student/upload_curriculum',
  '/api/student/upload_gradeToPercentLetter',
  '/api/student/saveUserMarkList',
  '/api/student/upload_transcript',
  '/api/student/upload_CompetencyLetter',
  '/api/student/upload_letterforNameChange',
  '/api/student/getNameChangeData',
  '/api/student/deleteDocument',
  '/api/student/deleteInfo',
  '/api/student/saveLetterNameChangeData',
  '/api/student/saveInstructionalData',
  '/api/student/saveAffiliationData',
  '/api/student/getletterDetails', 
  '/api/student/getInstructionalForms',
  '/api/student/getAppliedUserDetail',
  '/api/student/getEducationalDetails',
  '/api/student/getMyApplicationData',
  '/api/student/changePassword',
  '/api/student/forgotPasswordSendEmailToUser',
  '/api/student/getNotification',
  '/api/student/register',
  '/api/student/createCaptcha',
  //new admin
  '/api/admin/updateOtp',
  '/api/admin/updateCollegeFaculty',
  '/api/admin/getCollegeList',
  '/api/admin/getFacultyList',
  '/api/admin/deleteCollegeFaculty',
  '/api/admin/activeinactiveCollege',
  '/api/admin/getActivityTrackerList',
  '/api/admin/getStudentList',
  '/api/admin/activeinactiveUser',
  '/api/admin/resetPasswordByAdmin',
  '/api/admin/resetDocumentByAdmin',
  '/api/admin/changeNameByAdmin',
  '/api/admin/changeLocationByAdmin',
  '/api/admin/getDocumentsData',
  '/api/admin/deleteDocumentByAdmin',
  '/api/admin/updateInstructionalAffiliation',
  '/api/admin/getApplicationData',
  '/api/admin/resendApplication',
  '/api/admin/rejectApplications',
  '/api/admin/updateNotes',
  '/api/admin/getDownloadExcel',
  '/api/admin/getDownloadBySaveAs',
  '/api/admin/getApplicationData', 
  '/api/admin/verifiedApplication',
  '/api/admin/getWesApplication',
  '/api/admin/getEmailedApplication',
  '/api/admin/getRolesData',
  '/api/admin/getUserDetails',
  '/api/admin/getUpdateSubAdmin',
  '/api/admin/getUpdateRoles',
  '/api/admin/test',
  '/api/admin/resendWesApplication',
  '/api/admin/verifyApplication',
  '/api/admin/getWes_details',
  '/api/admin/updatePaymentNotes',
];
app.use(checkjwt({
  secret: cfg.jwtSecret
}).unless({
  path: unprotected
}));
 
app.use('/api/student', student);
app.use('/api/admin', admin); 


var server = app.listen(constant.PORT, function () {
  logger.debug('Debugging info');
  logger.verbose('Verbose info');
  logger.info('Hello world');
  logger.warn('Warning message');
  logger.error('Error info');

});
//let io = require("socket.io")(server);


module.exports = app;