var path = require('path');
var root_path = path.dirname(require.main.filename);
var models = require(root_path + '/models');
const express = require('express');
var router = express.Router();
var fs = require('fs');
const multer = require('multer');
var pdfreader = require('pdfreader');
var constant = require(root_path + '/config/constant');
var moment = require('moment');
var models = require("../models");
var urlencode = require('urlencode');
var request = require('request');
var converter = require('number-to-words');
var sequelize = require("sequelize");
const Op = sequelize.Op;
var functions = require('./functions');
const e = require('express');
const { pattern } = require('pdfkit');
const { log } = require('console');
var json2xls = require('json2xls');
const { promisify } = require('util');
const unlinkAsync = promisify(fs.unlink);
var fn = require('./signfn');
const pdf = require('pdf-parse');
const middlewares = require('../middleware');

router.post('/updateOtp', async (req, res) => {
    console.log('/updateOtp');

    var user_id = req.body.user_id;
    console.log('%%%%%%%%%%%%%', user_id);
    var otp = req.body.otp;
    console.log('#############', otp);

    var updateUser = await functions.getUserDetails(user_id, otp);

    if (updateUser.length > 0) {
        res.json({
            status: 200,
            message: "OTP Verified Successfully!"
        })
    } else {
        res.json({
            status: 400,
            message: "Invalid OTP"
        })
    }

})

router.post('/updateCollegeFaculty', async (req, res) => {
    console.log('/updateCollegeFaculty');

    var user_id = req.body.user_id;
    var user_name = req.body.user_name;
    var app_id = req.body.app_id;
    var id = req.body.id;
    var type = req.body.type;
    var function_type = req.body.function_type;
    var formData = req.body.formData;
    var purpose = req.body.purpose;

    //for college add & edit
    if (purpose == 'College') {
        if (function_type == 'add') {
            var addCollege = await functions.getAddCollege(type, formData);
            console.log('------------------------------>', addCollege);

            if (addCollege) {
                var createActivityTrackerAdd = await functions.getCreateActivityTrackerAdd(user_id, user_name, addCollege.name, app_id);

                return res.json({
                    status: 200,
                    message: 'College Added Successfully!'
                });
            } else {
                return res.json({
                    status: 400,
                    message: 'Failed to Add College'
                });
            }
        } else {
            var updatedCollegeName = formData.collegeName;

            var updateCollege = await functions.getUpdateCollege(type, formData, id);
            console.log('updateCollege', updateCollege);

            if (updateCollege) {
                var createActivityTrackerUpdate = await functions.getCreateActivityTrackerUpdate(user_id, user_name, updatedCollegeName, app_id);

                return res.json({
                    status: 200,
                    message: 'College Updated Successfully!'
                });
            } else {
                return res.json({
                    status: 400,
                    message: 'Failed to Update College'
                });
            }
        }
    } else {//for faculty add & edit
        if (function_type == 'add') {
            var addFaculty = await functions.getAddFaculty(formData);

            var addedFacultyName = addFaculty.degree + ' of ' + addFaculty.faculty;

            if (addFaculty) {
                var createActivityTrackerAdd = await functions.getCreateActivityTrackerAdd(user_id, user_name, addedFacultyName, app_id);

                return res.json({
                    status: 200,
                    message: 'College Added Successfully!'
                });
            } else {
                return res.json({
                    status: 400,
                    message: 'Failed to Add College'
                });
            }
        } else {
            var updateFaculty = await functions.getUpdateFaculty(formData, id);

            var updatedFacultyName = formData.degreeName + ' of ' + formData.facultyName;

            if (updateFaculty) {
                var createActivityTrackerUpdate = await functions.getCreateActivityTrackerUpdate(user_id, user_name, updatedFacultyName, app_id);

                return res.json({
                    status: 200,
                    message: 'College Updated Successfully!'
                });
            } else {
                return res.json({
                    status: 400,
                    message: 'Failed to Update College'
                });
            }
        }
    }
})

router.get('/getCollegeList', async (req, res) => {
    console.log('/getCollegeList');

    var id = req.query.id;
    console.log('clg id', id);

    if (id == 'null') {
        console.log('inside null');
        var collegeDetails = await functions.getAllCollegeList()
        console.log('collegeDetails', collegeDetails.length);

        if (collegeDetails.length > 0) {
            return res.json({
                status: 200,
                data: collegeDetails,
            });
        } else {
            return res.json({
                status: 400,
            });
        }
    } else {
        var collegeDetails = await functions.getSingleCollegeList(id)
        console.log('collegeDetails', collegeDetails.length);

        if (collegeDetails.length > 0) {
            return res.json({
                status: 200,
                data: collegeDetails,
            });
        } else {
            return res.json({
                status: 400,
            });
        }
    }
})

router.get('/getFacultyList', async (req, res) => {
    console.log('/getFacultyList');

    var id = req.query.id;
    console.log('fac id', id);

    if (id == 'null') {
        var facultyDetails = await functions.getAllFacultyList()
        console.log('facultyDetails', facultyDetails.length);

        if (facultyDetails.length > 0) {
            return res.json({
                status: 200,
                data: facultyDetails,
            });
        } else {
            return res.json({
                status: 400,
            });
        }
    } else {
        var facultyDetails = await functions.getSingleFacultyList(id)
        console.log('facultyDetails', facultyDetails.length);

        if (facultyDetails.length > 0) {
            return res.json({
                status: 200,
                data: facultyDetails,
            });
        } else {
            return res.json({
                status: 400,
            });
        }
    }
})

router.post('/deleteCollegeFaculty', async (req, res) => {
    console.log('/deleteCollegeFaculty');

    var user_id = req.body.user_id;
    var user_name = req.body.user_name;
    var app_id = req.body.app_id;
    var purpose = req.body.purpose;
    var id = req.body.dataCollegeFaculty.id;
    console.log('************', req.body.dataCollegeFaculty);

    if (purpose == 'College') {
        var college_name = req.body.dataCollegeFaculty.name;

        var deleteCollge = await functions.getDeleteCollege(id);

        if (deleteCollge == 1) {
            var createActivityTrackerDelete = await functions.getCreateActivityTrackerDelete(user_id, user_name, college_name, app_id);

            return res.json({
                status: 200,
                message: 'College Deleted Successfully!'
            });
        } else {
            return res.json({
                status: 400,
                message: 'Failed to Delete College'
            });
        }
    } else {
        var faculty_name = req.body.dataCollegeFaculty.degree + ' of ' + req.body.dataCollegeFaculty.faculty;

        var deleteFaculty = await functions.getDeleteFaculty(id);

        if (deleteFaculty == 1) {
            var createActivityTrackerDelete = await functions.getCreateActivityTrackerDelete(user_id, user_name, faculty_name, app_id);

            return res.json({
                status: 200,
                message: 'Faculty Deleted Successfully!'
            });
        } else {
            return res.json({
                status: 400,
                message: 'Failed to Delete Faculty'
            });
        }
    }

})

router.post('/activeinactiveCollege', async (req, res) => {
    console.log('/activeinactiveCollege', req.body.dataCollegeFaculty);

    var user_id = req.body.user_id;
    var user_name = req.body.user_name;
    console.log('user_name', user_name);
    var app_id = req.body.app_id;
    var event = req.body.event;
    var id = req.body.dataCollegeFaculty.id;
    console.log('id', id);
    var college_name = req.body.dataCollegeFaculty.name;
    console.log('college_name', college_name);
    var status;

    if (event == true) {
        status = 'active';
    } else {
        status = 'inactive';
    }

    var activeinactive = await functions.getActiveInactiveCollege(status, id);
    console.log('activeinactive', activeinactive);
    console.log('activeinactive', activeinactive.length);

    if (activeinactive.length > 0) {
        var createActivityTrackerChange = await functions.getCreateActivityTrackerChange(user_id, user_name, college_name, status, app_id);

        return res.json({
            status: 200,
            message: 'College ' + status + ' successfully!',
            data: status
        });
    } else {
        return res.json({
            status: 400,
            message: 'Failed to get ' + status,
        });
    }

})

router.get('/getActivityTrackerList', async (req, res) => {
    console.log('/getActivityTrackerList');

    var student_id = req.query.student_id;
    var offset = req.query.offset;
    var limit = req.query.limit;
    var globalSearch = req.query.globalSearch;

    if (student_id == '' || student_id == null || student_id == undefined) {
        var trackerList = await functions.getActivityTrackerList(offset, limit, globalSearch);
        var trackerCount = await functions.getActivityTrackerCount(globalSearch);
        console.log('trackerCount',trackerCount);
        console.log('trackerList',trackerList);
        if (trackerList.length > 0) {
            return res.json({
                status: 200,
                data: trackerList,
                count: trackerCount
            });
        } else {
            return res.json({
                status: 400,
            });
        }
    } else {
        var trackerList = await functions.getActivityTrackerSingle(student_id);

        if (trackerList.length > 0) {
            return res.json({
                status: 200,
                data: trackerList,
            });
        } else {
            return res.json({
                status: 400,
            });
        }
    }


})

router.get('/getStudentList', async (req, res) => {
    console.log('/getStudentList');

    var user_id = req.query.user_id;
    var limit = req.query.limit;
    var offset = req.query.offset;
    var name = req.query.name;
    var email = req.query.email;
    var user_type = req.query.user_type;
    var globalSearch = req.query.globalSearch;

    const data = await models.User.getStudentDetails(user_id, limit, offset, name, email, user_type, globalSearch);
    const count = await functions.getStudentCount(name, email, user_type, globalSearch);

    console.log('dataaaa', JSON.stringify(data));
    console.log('counttt', count);

    if (data.length > 0) {
        return res.json({
            status: 200,
            data: data,
            count: count,
        });
    } else {
        return res.json({
            status: 400,
            data: data,
            count: count,
        });
    }

    // models.User.getStudentManagment(student_id).then(student => {
    //     if (student.length > 0) {
    //         return res.json({
    //             status: 200,
    //             data: student,
    //         });
    //     } else {
    //         return res.json({
    //             status: 400,
    //         });
    //     }
    // })
})

router.post('/activeinactiveUser', async (req, res) => {
    console.log('/activeinactiveUser');

    var admin_email = req.body.admin_email;
    console.log('/activeinactiveUser', admin_email);
    var event = req.body.event;
    var status;
    var user_id = req.body.data.id;

    if (event == true) {
        status = 'active';
    } else {
        status = 'inactive';
    }

    var userDetails = await functions.getUserData(user_id);

    if (userDetails) {
        var activeinactive = await functions.getActiveInactiveUser(status, user_id);

        if (activeinactive == true) {
            var data = "sub-admin " + userDetails.name + ' ' + userDetails.surname + " is " + status + " by " + admin_email;
            var activity = "Sub-admin " + status;

            functions.getCreateActivityTracker(user_id, null, activity, data);

            return res.json({
                status: 200,
                message: userDetails.name + ' ' + userDetails.surname + ' ' + status + ' successfully!',
                data: status
            });
        } else {
            return res.json({
                status: 400,
                message: 'Failed to ' + status + userDetails.name + ' ' + userDetails.surname,
            });
        }
    } else {
        return res.json({
            status: 400,
            message: 'Something went wrong',
        });
    }
})

router.post('/resetPasswordByAdmin', async (req, res) => {
    console.log('/resetPasswordByAdmin');

    var student_id = req.body.studentData.id;
    var student_app_id = req.body.studentData.app_id;
    var student_name = req.body.studentData.name + ' ' + req.body.studentData.surname;
    var password = '123456';
    var hashPassword;
    var user_id = req.body.user_id;
    var user_name = req.body.user_name;

    if (password == '123456') {
        hashPassword = functions.generateHashPassword(password);

        var resetPassword = await functions.getResetPassword(hashPassword, student_id);

        if (resetPassword == 1) {
            var createActivityTrackerChange = await functions.getCreateActivityTrackerChange(user_id, user_name, student_name, 'reset password', student_app_id);
            return res.json({
                status: 200,
                message: 'Password reset successfully to 123456',
            });
        } else {
            return res.json({
                status: 400,
                message: 'Failed to reset password',
            });
        }
    } else {
        return res.json({
            status: 400,
            message: 'Something went wrong while changing your Password',
        });
    }
})

router.post('/resetDocumentByAdmin', async (req, res) => {
    console.log('/resetDocumentByAdmin');

    var student_id = req.body.studentData.id;
    var student_app_id = req.body.studentData.app_id;
    var student_name = req.body.studentData.name + ' ' + req.body.studentData.surname;
    var user_id = req.body.user_id;
    var user_name = req.body.user_name;

    var applicationDetails = await functions.getUserApplicationDetails(student_id);

    if (applicationDetails == null || applicationDetails == 'null') {
        models.Applied_For_Details.deleteUserData(student_id).then(function (appliedDetails) {
            models.UserMarklist_Upload.deleteUserData(student_id).then(function (userMark_Upload) {
                models.User_Transcript.deleteUserData(student_id).then(function (UserTranscript) {
                    models.User_Curriculum.deleteUserData(student_id).then(function (userCurri) {
                        models.InstructionalDetails.deleteUserData(student_id).then(function (Instructional) {
                            models.GradeToPercentageLetter.deleteUserData(student_id).then(function (GradeToPrecentage) {
                                models.Institution_details.deleteUserData(student_id).then(function (Institution) {
                                    models.competency_letter.deleteUserData(student_id).then(function (competency_letter) {
                                        models.Hrd_details.deleteUserData(student_id).then(function (Hrd_details) {
                                            models.Cart.deleteUserData(student_id).then(async function (cart) {
                                                var createActivityTrackerChange = await functions.getCreateActivityTrackerChange(user_id, user_name, student_name, 'documents reset ', student_app_id);
                                                res.json({
                                                    status: 200,
                                                    message: 'Document Deleted Successfully'
                                                });

                                            })
                                        })
                                    })
                                })
                            })
                        })
                    })
                })
            })
        })
    } else {
        res.json({
            status: 400,
            message: 'User Have Paid the Fees. So, we cannot Delete the Document'
        });
    }

})

router.post('/changeNameByAdmin', async (req, res) => {
    console.log('/changeNameByAdmin');

    var student_id = req.body.student_id;
    var student_app_id = req.body.student_app_id;
    var firstName = req.body.firstname;
    var lastName = req.body.lastname;
    var student_name = firstName + ' ' + lastName;
    var user_id = req.body.user_id;
    var user_name = req.body.user_name;

    var changeName = await functions.getChangeName(student_id, firstName, lastName);

    if (changeName == 1) {
        var createActivityTrackerChange = await functions.getCreateActivityTrackerChange(user_id, user_name, student_name, 'name changed ', student_app_id);

        return res.json({
            status: 200,
            message: student_name + ' name changed successfully',
        });
    } else {
        res.json({
            status: 400,
            message: student_name + ' name failed to change'
        });
    }
})

router.post('/changeLocationByAdmin', async (req, res) => {
    console.log('/changeLocationByAdmin');

    var student_id = req.body.studentData.id;
    var student_app_id = req.body.studentData.app_id;
    var student_name = req.body.studentData.name + ' ' + req.body.studentData.surname;
    var user_id = req.body.user_id;
    var user_name = req.body.user_name;
    var location = req.body.location;

    var changeLocation = await functions.getChangeLocation(student_id, location);
    console.log('%%%%%%%%%%%', changeLocation);
    console.log('%%%%%%%%%%%', changeLocation.length);

    if (changeLocation == 1) {
        var createActivityTrackerChange = await functions.getCreateActivityTrackerChange(user_id, user_name, student_name, 'location changed ', student_app_id);

        return res.json({
            status: 200,
            message: student_name + ' location changed successfully',
        });
    } else {
        res.json({
            status: 400,
            message: student_name + ' location failed to change'
        });
    }

})

router.get('/getDocumentsData', async (req, res) => {
    console.log('/getDocumentsData');

    var student_id = req.query.student_id;
    var student_app_id = req.query.student_app_id;
    if (student_app_id == 'null') {
        student_app_id = null
    }

    // let encounteredColleges = {};
    var marksheetsData = [];
    var transcriptsData = [];
    var curriculumData = [];
    var gradtoperData = [];
    var competencyData = [];
    var letterfornamechangeData = [];
    var instructionalData = [];
    var affiliationData = [];
    var namechangeproofData = [];
    var documentsData = [];
    var extension;

    var applied_for_details = await functions.getAppliedForDetails(student_id, student_app_id);
    console.log('............', JSON.stringify(applied_for_details));
    console.log('applied_for_details=======', applied_for_details.educationalDetails);

    //marksheets
    var getApplied = await functions.getAppliedDetails(student_id, student_app_id);
    console.log('getApplied', JSON.stringify(getApplied));

    getApplied.forEach(async function (marksheets) {
        extension = marksheets.file_name.split('.').pop();
        console.log('get------------------', JSON.stringify(marksheets.collegeId));

        var collegeDetails = await functions.getCollegeDetails(marksheets.collegeId);

        marksheetsData.push({
            id: marksheets.id,
            name: marksheets.name,
            filePath: constant.BASE_URL + "/api/upload/marklist/" + student_id + "/" + marksheets.file_name,
            extension: extension,
            collegeName: collegeDetails.name,
            fileName: marksheets.file_name,
        })
    })

    //transcript
    if (applied_for_details.educationalDetails == true) {
        var getTranscripts = await functions.getUserTrascripts(student_id, student_app_id);

        getTranscripts.forEach(async function (transcripts) {
            extension = transcripts.file_name.split('.').pop();

            var collegeDetails = await functions.getCollegeDetails(transcripts.collegeId);

            transcriptsData.push({
                id: transcripts.id,
                name: transcripts.name,
                filePath: constant.BASE_URL + "/api/upload/transcript/" + student_id + "/" + transcripts.file_name,
                extension: extension,
                collegeName: collegeDetails.name,
                fileName: transcripts.file_name,
            })
        })
    }

    //instructional
    if (applied_for_details.instructionalField == true) {
        console.log('inideeeeeeeeeeeeeeeeee');
        var getInstructional = await functions.getUserInstructionalAndAffiliation(student_id, student_app_id, 'instructional');
        console.log('::::::::::::::::', getInstructional);
        console.log('::::::::::::::::', getInstructional.length);

        getInstructional.forEach(function (instructional) {

            instructionalData.push({
                id: instructional.id,
                name: instructional.studentName,
                course: instructional.courseName,
                college: instructional.collegeName,
                specialization: instructional.specialization,
                duration: instructional.duration,
                division: instructional.division,
                yearofpassing: instructional.yearofpassing,
                education_type: instructional.education_type,
            })
        })
    }

    //curriculum
    if (applied_for_details.curriculum == true) {
        var getCurriculum = await functions.getUserCurriculum(student_id, student_app_id);

        getCurriculum.forEach(async function (curriculum) {
            extension = curriculum.file_name.split('.').pop();

            var collegeDetails = await functions.getCollegeDetails(curriculum.collegeId);

            curriculumData.push({
                id: curriculum.id,
                name: curriculum.name,
                filePath: constant.BASE_URL + "/api/upload/curriculum/" + student_id + "/" + curriculum.file_name,
                extension: extension,
                collegeName: collegeDetails.name,
                fileName: curriculum.file_name,
            })
        })
    }

    //gradetoper
    if (applied_for_details.gradToPer == true) {
        var getGradtoper = await functions.getUserGradtoper(student_id, student_app_id);

        getGradtoper.forEach(async function (gradtoper) {
            extension = gradtoper.file_name.split('.').pop();

            var collegeDetails = await functions.getCollegeDetails(gradtoper.collegeId);

            gradtoperData.push({
                id: gradtoper.id,
                name: gradtoper.name,
                filePath: constant.BASE_URL + "/api/upload/gradeToPercentLetter/" + student_id + "/" + gradtoper.file_name,
                extension: extension,
                collegeName: collegeDetails.name,
                fileName: gradtoper.file_name,
            })
        })
    }

    //affiliation
    if (applied_for_details.affiliation == true) {
        var getAffiliation = await functions.getUserInstructionalAndAffiliation(student_id, student_app_id,'affiliation');

        getAffiliation.forEach(function (affiliation) {

            affiliationData.push({
                id: affiliation.id,
                name: affiliation.studentName,
                course: affiliation.courseName,
                college: affiliation.collegeName,
                specialization: affiliation.specialization,
                duration: affiliation.duration,
                division: affiliation.division,
                yearofpassing: affiliation.yearofpassing,
                education_type: affiliation.education_type,
            })
        })
    }

    //competency
    if (applied_for_details.CompetencyLetter == true) {
        var getCompetency = await functions.getUserCompetency(student_id, student_app_id);

        getCompetency.forEach(async function (competency) {
            extension = competency.file_name.split('.').pop();

            var collegeDetails = await functions.getCollegeDetails(competency.collegeId);

            competencyData.push({
                id: competency.id,
                name: competency.name,
                filePath: constant.BASE_URL + "/api/upload/CompetencyLetter/" + student_id + "/" + competency.file_name,
                extension: extension,
                collegeName: collegeDetails.name,
                fileName: competency.file_name,
            })
        })
    }

    //letter for name change
    if (applied_for_details.LetterforNameChange == true) {
        var getLetterfornamechange = await functions.getUserLetterfornamechange(student_id, student_app_id);

        getLetterfornamechange.forEach(async function (letterfornamechange) {
            extension = letterfornamechange.file_name.split('.').pop();

            var collegeDetails = await functions.getCollegeDetails(letterfornamechange.collegeId);

            letterfornamechangeData.push({
                id: letterfornamechange.id,
                name: letterfornamechange.name,
                filePath: constant.BASE_URL + "/api/upload/NameChangeLetter/" + student_id + "/" + letterfornamechange.file_name,
                extension: extension,
                collegeName: collegeDetails.name,
                firstnameaspermarksheet: letterfornamechange.firstnameaspermarksheet,
                fathersnameaspermarksheet: letterfornamechange.fathersnameaspermarksheet,
                mothersnameaspermarksheet: letterfornamechange.mothersnameaspermarksheet,
                lastnameaspermarksheet: letterfornamechange.lastnameaspermarksheet,
                firstnameasperpassport: letterfornamechange.firstnameasperpassport,
                fathersnameasperpassport: letterfornamechange.fathersnameasperpassport,
                lastnameasperpassport: letterfornamechange.lastnameasperpassport,
                fileName: letterfornamechange.file_name,
            })
        })
    }

    //name change proof
    var getNameChangeProof = await functions.getUserNameChangeProof(student_id, 'extra_document');

    getNameChangeProof.forEach(async function (namechangeproof) {
        extension = namechangeproof.file_name.split('.').pop();

        namechangeproofData.push({
            id: namechangeproof.id,
            name: namechangeproof.name,
            filePath: constant.BASE_URL + "/api/upload/NameChangeProof/" + student_id + "/" + namechangeproof.file_name,
            extension: extension,
        })
    })

    //all data
    documentsData.push({
        marksheetsData: marksheetsData,
        transcriptsData: transcriptsData,
        curriculumData: curriculumData,
        gradtoperData: gradtoperData,
        competencyData: competencyData,
        letterfornamechangeData: letterfornamechangeData,
        instructionalData: instructionalData,
        affiliationData: affiliationData,
        namechangeproofData: namechangeproofData,
    })

    if (documentsData.length > 0) {
        res.json({
            status: 200,
            data: documentsData,
        });
    } else {
        res.json({
            status: 400,
        });
    }

})

router.post('/deleteDocumentByAdmin', async (req, res) => {
    console.log('/deleteDocumentByAdmin');

    console.log('sddfsfdfdfdf', req.body.documentData);

    var id = req.body.documentData.id;
    var student_app_id = req.body.app_id;
    var user_id = req.body.user_id;
    var user_name = req.body.user_name;
    var type = req.body.type;
    var fileName = req.body.documentData.fileName;

    if (type == 'marksheets') {
        var deleteMarksheet = await functions.getDeleteMarksheet(id);

        if (deleteMarksheet == true) {
            var createActivityTrackerDelete = await functions.getCreateActivityTrackerDelete(user_id, user_name, fileName, student_app_id);
            return res.json({
                status: 200,
                message: fileName + ' deleted successfully',
            });
        } else {
            res.json({
                status: 400,
                message: 'Failed to delete ' + fileName,
            });
        }
    } else if (type == 'transcripts') {
        var deleteTranscript = await functions.getDeleteTranscript(id);

        if (deleteTranscript == true) {
            var createActivityTrackerDelete = await functions.getCreateActivityTrackerDelete(user_id, user_name, fileName, student_app_id);
            return res.json({
                status: 200,
                message: fileName + ' deleted successfully',
            });
        } else {
            res.json({
                status: 400,
                message: 'Failed to delete ' + fileName,
            });
        }
    } else if (type == 'curriculum') {
        var deleteCurriculum = await functions.getDeleteCurriculum(id);

        if (deleteCurriculum == true) {
            var createActivityTrackerDelete = await functions.getCreateActivityTrackerDelete(user_id, user_name, fileName, student_app_id);
            return res.json({
                status: 200,
                message: fileName + ' deleted successfully',
            });
        } else {
            res.json({
                status: 400,
                message: 'Failed to delete ' + fileName,
            });
        }
    } else if (type == 'gradtoper') {
        var deleteCurriculum = await functions.getDeleteCurriculum(id);

        if (deleteCurriculum == true) {
            var createActivityTrackerDelete = await functions.getCreateActivityTrackerDelete(user_id, user_name, fileName, student_app_id);
            return res.json({
                status: 200,
                message: fileName + ' deleted successfully',
            });
        } else {
            res.json({
                status: 400,
                message: 'Failed to delete ' + fileName,
            });
        }
    } else {
        res.json({
            status: 400,
            message: 'Something went wrong while deleting ' + fileName,
        });
    }
})

router.post('/updateInstructionalAffiliation', async (req, res) => {
    console.log('/updateInstructionalAffiliation');

    var id = req.body.id;
    var formData = req.body.formData;
    var user_id = req.body.user_id;
    var user_email = req.body.user_email;
    var purpose = req.body.purpose;
    var type = req.body.type;
    var student_id = req.body.student_id;
    var student_app_id = req.body.student_app_id;

    if (type == 'add') {

    } else {
        var instructionalAffilationDetails = await functions.getInstructionalAffilationDetails(id);

        if (instructionalAffilationDetails) {
            var updateInstructionalAffiliation = await functions.getUpdateInstructionalAffiliation(id, student_app_id, formData, purpose);

            if (updateInstructionalAffiliation == true) {
                var data = "'s Instructional details of " + app_id + " is updated by " + user_email;
                var activity = "Instructional details update";

                functions.getCreateActivityTracker(student_id, student_app_id, activity, data);

                return res.json({
                    status: 200,
                    message: formData.courseName + ' updated successfully',
                });
            } else {
                res.json({
                    status: 400,
                    message: 'Failed to update ' + formData.courseName,
                });
            }
        } else {
            res.json({
                status: 400,
                message: 'Something went wrong',
            });
        }
    }
})

router.post('/uploadStudentDocument', (req, res) => {
    console.log('/uploadStudentDocument');

    var doc_name = req.body.doc_name;
    console.log('doc_name', doc_name);
    var doc_id = req.body.doc_id;
    console.log('doc_id', doc_id);
    var user_id = req.body.user_id;
    console.log('user_id', user_id);
    var type = req.body.type;
    console.log('type', type);

})

/**Fetched all the Application Data based on their application TRACKER and STATUS using STORE PROCEDURE*/
router.get('/getApplicationData', async (req, res) => {
    try {
        const tracker = req.query.tracker;
        const status = req.query.status;
        const app_id = req.query.app_id;
        const limit = req.query.limit;
        const offset = req.query.offset;
        const name = req.query.name;
        const email = req.query.email;
        const globalSearch = req.query.globalSearch;
        const purpose = req.query.purpose_search
        const students = [];
        const count = await functions.getApplicationCount(tracker, status, app_id, name, email, globalSearch);
        console.log("count", count);
        const user = await models.Application.getUserApplications(tracker, status, app_id, name, email, globalSearch, purpose, limit, offset);
        if (user) {
            for (const student of user) {
                const col = await models.Application.getCollegeDetails(student.id);
                for (i = 0; i < col.length; i++) {
                    students.push({
                        id: student.id,
                        name: student.name,
                        email: student.email,
                        tracker: student.tracker,
                        college: col[i].college_Name,
                        status: student.status,
                        current_location: student.current_location,
                        user_id: student.user_id,
                        instructionalField: student.instructionalField,
                        educationalDetails: student.educationalDetails,
                        CompetencyLetter: student.CompetencyLetter,
                        Letterfor_NameChange: student.LetterforNameChange,
                        gradToPer: student.gradToPer,
                        curriculum: student.curriculum,
                        affiliation: student.affiliation,
                        type: student.type,
                        notes: student.notes,
                        approved_by: student.approved_by,
                        //   collegeConfirmation : student.collegeConfirmation,
                        application_date: moment(new Date(student.created_at)).format("DD/MM/YYYY")
                    });
                }
            }
            res.json({
                status: 200,
                message: 'Students retrieved successfully',
                data: students,
                count: count
            });
        }
    } catch (error) {
        console.error("Error in /getApplicationData", error);
        return res.json({
            status: 500,
            message: "Internal Server Error"
        });
    }
});

router.get('/test', async (req, res) => {
    const tracker = req.query.tracker;
    const status = req.query.status;
    const app_id = req.query.app_id;
    const name = req.query.name;
    const email = req.query.email;
    const globalSearch = req.query.globalSearch;
    const limits = req.query.limit;
    const offsets = req.query.offset;
    let students = [];
    const count = await functions.getApplicationCount(tracker, status, app_id, name, email, globalSearch);
    console.log("data", count);

    const user = await functions.getApplicationData(tracker, status, app_id, name, email, globalSearch, limits, offsets);
    if (user) {
        for (const student of user['rows']) {
            console.log("student.id", student.id);
            const col = await functions.check(student.id);

            //   const collegeName = result[0].dataValues.college_Name;
            //   console.log(collegeName);

            for (i = 0; i < col.length; i++) {

                console.log("col[i].collegeNames", col[i].dataValues.collegeNames);
                students.push({
                    id: student.id,
                    name: student['User.name'],
                    email: student['User.email'],
                    tracker: student.tracker,
                    college: col[i].dataValues.collegeNames,
                    status: student.status,
                    current_location: student['User.current_location'],
                    user_id: student.user_id,
                    instructionalField: student['Applied_For_Detail.instructionalField'],
                    educationalDetails: student['Applied_For_Detail.educationalDetails'],
                    CompetencyLetter: student['Applied_For_Detail.CompetencyLetter'],
                    Letterfor_NameChange: student['Applied_For_Detail.LetterforNameChange'],
                    gradToPer: student['Applied_For_Detail.gradToPer'],
                    curriculum: student['Applied_For_Detail.curriculum'],
                    affiliation: student['Applied_For_Detail.affiliation'],
                    type: student['Institution_detail.type'],
                    notes: student.notes,
                    approved_by: student.approved_by,
                    collegeConfirmation: student.collegeConfirmation,
                    application_date: moment(new Date(student.created_at)).format("DD/MM/YYYY")
                });
            }
        };
    }
    return res.json({
        status: 200,
        message: 'Students retrieved successfully',
        data: students,
        count: count
    });

})

/** Reject Application Route from Pending and verified Tab with activity Tracker*/
router.post('/rejectApplications', async (req, res) => {
    try {
        const userId = req.body.user_id;
        const appId = req.body.app_id;
        const adminEmail = req.body.admin_email;
        const type = req.body.type;
        const tracker = type === 'pending' ? 'apply' : type === 'verified' ? 'verified' : undefined;

        const user = await functions.getUser(userId);

        if (user) {

            const application = await functions.getApplication(appId);

            if (application) {
                const updatedApplication = await application.update({
                    tracker: tracker,
                    status: 'reject'
                });

                if (updatedApplication) {
                    let data = user.name + "'s ( " + user.email + " ) application rejected by " + adminEmail + ".";
                    let activity = "Application Rejected";
                    functions.activitylog(userId, appId, activity, data, req);
                    return res.json({
                        status: 200,
                        message: "User Application Rejected Successfully!"
                    });
                } else {
                    return res.json({
                        status: 400,
                        message: "Application Not Rejected!"
                    });
                }
            } else {
                return res.json({
                    status: 400,
                    message: "Application Not Found"
                });
            }
        } else {
            return res.json({
                status: 400,
                message: "User Not Found"
            });
        }
    } catch (error) {
        console.error("Error in /rejectApplication", error);
        return res.json({
            status: 500,
            message: "Internal Server Error"
        });
    }
});

/** Verified Application Route from Pending Tab with activity Tracker*/
router.post('/verifiedApplication', async (req, res) => {
    try {
        const userId = req.body.user_id;
        const appId = req.body.app_id;
        const adminEmail = req.body.admin_email;

        const user = await functions.getUser(userId);

        if (user) {

            const application = await functions.getApplication(appId);

            if (application) {
                const updatedApplication = await application.update({
                    tracker: 'verified',
                    status: 'accept'
                })
                if (updatedApplication) {
                    let data = user.name + "'s ( " + user.email + " ) application verified by " + adminEmail + ".";
                    let activity = "Application Verified";
                    functions.activitylog(userId, appId, activity, data, req);
                    return res.json({
                        status: 200,
                        message: "Application Verified Successfully!"
                    });
                } else {
                    return res.json({
                        status: 400,
                        message: "Application Not Verified!"
                    });
                }
            } else {
                return res.json({
                    status: 400,
                    message: "Application Not Found"
                });
            }
        } else {
            return res.json({
                status: 400,
                message: "User Not Found"
            });
        }

    } catch (error) {
        console.error("Error in /verifiedApplication", error);
        return res.json({
            status: 500,
            message: "Internal Server Error"
        });
    }
})

/**Fetched all the Wes Application Data  using STORE PROCEDURE */
router.get('/getWesApplication', async (req, res) => {
    try {
        const name = req.query.name;
        const email = req.query.email;
        const appId = req.query.app_id;
        const wesNo = req.query.wesno;
        const limit = req.query.limit;
        const offset = req.query.offset;

        const wesApplicationCount = await models.Institution_details.getWesData(appId, name, email, wesNo, "", "");
        const count = wesApplicationCount.length;
        const wesApplication = await models.Institution_details.getWesData(appId, name, email, wesNo, limit, offset);

        return res.json({
            status: 200,
            data: wesApplication,
            count: count
        });

    } catch (error) {
        console.error("Error in /getWesApplication", error);
        return res.json({
            status: 500,
            message: "Internal Server Error"
        });
    }
})

/**Fetched all the Emailed Application Data using STORE PROCEDURE */
router.get('/getEmailedApplication', async (req, res) => {
    try {
        const appId = req.query.app_id;
        const name = req.query.name;
        const email = req.query.email;
        const globalSearch = req.query.globalSearch;
        const limit = req.query.limit;
        const offset = req.query.offset;
        const students = [];

        const count = await models.Application.getEmailedCount(appId, name, email, globalSearch);

        const EmailedData = await models.Application.getEmailedData(appId, name, email, globalSearch, limit, offset);

        if (EmailedData) {

            for (const student of EmailedData) {
                students.push({
                    id: student.id,
                    name: student.name,
                    email: student.email,
                    current_location: student.current_location,
                    user_id: student.user_id,
                    instructionalField: student.instructionalField,
                    educationalDetails: student.educationalDetails,
                    CompetencyLetter: student.CompetencyLetter,
                    Letterfor_NameChange: student.LetterforNameChange,
                    gradToPer: student.gradToPer,
                    curriculum: student.curriculum,
                    affiliation: student.affiliation,
                    type: student.type,
                    notes: student.notes,
                    approved_by: student.approved_by,
                    collegeConfirmation: student.collegeConfirmation,
                    email_status: student.opens_count,
                    application_date: moment(new Date(student.created_at)).format("DD/MM/YYYY"),
                    updated_at: moment(new Date(student.created_at)).format("DD/MM/YYYY")
                });
            }

            return res.json({
                status: 200,
                data: students,
                count: count
            })

        }
    } catch (error) {
        console.error("Error in /getEmailedApplication", error);
        return res.json({
            status: 500,
            message: "Internal Server Error"
        });
    }
})

router.get('/getDownloadExcel', async (req, res) => {
    console.log('/getDownloadExcel');

    var startDate = req.query.startDate;
    var endDate = req.query.endDate;
    var type = req.query.type;
    var tracker = req.query.tracker;
    var status = req.query.status;
    var applicationData = [];

    const data = await models.Application.getDownloadExcel(startDate, endDate, tracker, status);

    if (type == 'total') {
        data.forEach(function (app) {
            applicationData.push({
                'Application Id': app.id,
                'Student Name': app.name,
                'Student Email': app.email,
                'Applied for': app.applied_for,
                'Purpose': app.type,
                'Application status': app.tracker,
                'colleges': app.college_name,
                'application_date': app.created_at,
            })
        })
    } else if (type == 'pending') {
        data.forEach(function (app) {
            applicationData.push({
                'Application Id': app.id,
                'Student Name': app.name,
                'Student Email': app.email,
                'Student contact': app.mobile,
                'Applied for': app.applied_for,
                'Purpose': app.type,
                'Colleges': app.college_name,
                'Application_date': app.created_at,
            })
        })
    } else if (type == 'verified') {
        data.forEach(function (app) {
            applicationData.push({
                'Application Id': app.id,
                'Student Name': app.name,
                'Student Email': app.email,
                'Applied for': app.applied_for,
                'Purpose': app.type,
                'Approved by': app.approved_by,
                'Colleges': app.college_name,
                'Application_date': app.created_at,
            })
        })
    } else if (type == 'signed') {
        data.forEach(function (app) {
            applicationData.push({
                'Application Id': app.id,
                'Student Name': app.name,
                'Student Email': app.email,
                'Applied for': app.applied_for,
                'Purpose': app.type,
                'Approved by': app.approved_by,
                'Emailed Date': app.updated_at,
                'Colleges': app.college_name,
                'Application_date': app.created_at,
            })
        })
    } else if (type == 'emailed') {
        data.forEach(function (app) {
            applicationData.push({
                'Application Id': app.id,
                'Student Name': app.name,
                'Student Email': app.email,
                'Applied for': app.applied_for,
                'Purpose': app.type,
                'Approved by': app.approved_by,
                'Emailed Date': app.updated_at,
                'Colleges': app.college_name,
                'Application_date': app.created_at,
            })
        })
    } else if (type == 'finance') {
        data.forEach(function (app) {
            applicationapp.push({
                'Application Id': app.id,
                'Student Name': app.name,
                'Student Email': app.email,
                'Applied for': app.applied_for,
                'Purpose': app.type,
                'Approved by': app.approved_by,
                'Emailed Date': app.updated_at,
                'Colleges': app.college_name,
                // "OrderId": app.orderId,
                // "Transaction id": app.tracking_id,
                // "Split Status": app.split_status,
                // "Amount Payable": app.amount,
                // "CCAvenue Refernce No/Transaction id": app.tracking_id,
                // 'courses': course_name,
                'Application_date': app.created_at,
            })
        })
    } else {
        console.log('type not found!');
    }

    var xls = json2xls(applicationData);
    var file_location = constant.FILE_LOCATION + "public/Excel/" + type + ".xlsx";
    fs.writeFileSync(file_location, xls, 'binary');
    var filepath = constant.FILE_LOCATION + "public/Excel/" + type + ".xlsx";

    if (filepath) {
        res.json({
            status: 200,
            data: filepath
        })
    } else {
        res.json({
            status: 400
        })
    }
})

router.get('/getDownloadBySaveAs', (req, res) => {
    console.log('/getDownloadExcelBySaveAs');

    var filepath = req.query.filepath;

    const downloadData = filepath;
    console.log("downloadData", downloadData);
    res.download(downloadData);
})

/** Resend Application Route from verified,signed and emailed Tab with activity Tracker*/
router.post('/resendApplication', async (req, res) => {

    try {
        const userId = req.body.user_id;
        const appId = req.body.app_id;
        const type = req.body.type;
        const adminEmail = req.body.admin_email;
        const tracker = type === 'pending' ? 'apply' : type === 'verified' ? 'verified' : undefined;
        const status = type === 'pending' ? 'new' : type === 'verified' ? 'accept' : undefined;

        const user = await functions.getUser(userId);

        if (user) {

            const application = await functions.getApplication(appId);

            if (application) {
                const updatedApplication = await application.update({
                    tracker: tracker,
                    status: status
                });
                if (updatedApplication) {
                    let data = user.name + "'s Application no " + appId + "is application resend by " + adminEmail + ".";
                    let activity = "Application Resend";
                    functions.activitylog(userId, appId, activity, data, req);
                    return res.json({
                        status: 200,
                        message: `User Application Successfully Resend to ${type} Application!`
                    });
                } else {
                    return res.json({
                        status: 400,
                        message: "Application Not Resend!"
                    });
                }
            } else {
                return res.json({
                    status: 400,
                    message: "Application Not Found"
                });
            }

        } else {
            return res.json({
                status: 400,
                message: "User Not Found"
            });
        }

    } catch (error) {
        console.error("Error in /resendApplication", error);
        return res.json({
            status: 500,
            message: "Internal Server Error"
        });
    }
})

/** Resend Wes Application Route from Wes Tab with activity Tracker*/
router.post('/resendWesApplication', async (req, res) => {
    const appId = req.body.app_id;
    const userId = req.body.user_id;
    console.log("req.body", req.body);
    try {
        const application = await functions.getApplication(appId);

        if (application) {
            const wes_Records = await functions.getWesData(appId);

            if (wes_Records) {
                for (const wesRecord of wes_Records) {
                    // const filePath = constant.FILE_LOCATION + 'public/signedpdf/' + userId + '/' + wesRecord.fileName;
                    // await unlinkAsync(filePath);
                    const delWes = await wesRecord.destroy();
                    if (delWes) {
                        const email_docs = await models.Emailed_Docs.findOne({
                            where: {
                                filename: wesRecord.fileName,
                                app_id: appId
                            }
                        })
                        if (email_docs) {
                            await email_docs.destroy();
                        }
                    }
                }
                const applicationUpdated = await application.update({
                    tracker: 'verified',
                    status: 'accept'
                });
                if (applicationUpdated) {
                    return res.json({
                        status: 200,
                        message: "Application resent to verified tab."
                    });
                } else {
                    return res.json({
                        status: 400,
                        message: "Failed to update this application"
                    });
                }
            } else {
                return res.json({
                    status: 404,
                    message: "WES record not found."
                });
            }
        } else {
            return res.json({
                status: 404,
                message: "Application not found."
            });
        }
    } catch (error) {
        console.error("Error in /resendWesApplication", error);
        return res.json({
            status: 500,
            message: "Internal Server Error"
        });
    }

})

router.post('/updateNotes', async (req, res) => {
    console.log('/updateNotes');

    var notes_data = req.body.notes_data;
    var user_id = req.body.user_id;
    var app_id = req.body.app_id;
    var type = req.body.type;
    var admin_email = req.body.admin_email;

    var updateNotes = await functions.getUpdateUserNotes(notes_data, app_id, type);
    if (updateNotes.length == true) {
        var data = "Note of application " + app_id + " is updated by " + admin_email;
        var activity = "Note Updated";

        functions.getCreateActivityTracker(user_id, app_id, activity, data);

        res.json({
            status: 200,
            message: "Notes Saved Successfully!",
        })
    } else {
        res.json({
            status: 400,
            message: "Failed to save notes",
        })
    }

})

router.get('/getRolesData', async (req, res) => {
    console.log('/getRolesData');

    var rolesData = [];
    var i = 1;

    var subAdminDetails = await functions.getAllUserDetails('sub-admin');

    if (subAdminDetails.length > 0) {
        for (const subadmin of subAdminDetails) {
            var roleDetails = await functions.getRoleDetails(subadmin.id);

            rolesData.push({
                srNo: i++,
                id: subadmin.id,
                name: subadmin.name + ' ' + subadmin.surname,
                email: subadmin.email,
                status: subadmin.user_status,
                roles: roleDetails,
            })
        }

        if (rolesData.length > 0) {
            res.json({
                status: 200,
                data: rolesData
            })
        } else {
            res.json({
                status: 400,
            });
        }
    } else {
        res.json({
            status: 400,
        });
    }
})

router.get('/getUserDetails', async (req, res) => {
    console.log('/getUserDetails');

    var user_id = req.query.user_id;

    var userDetails = await functions.getUserData(user_id);

    if (userDetails) {
        res.json({
            status: 200,
            data: userDetails,
        })
    } else {
        res.json({
            status: 400,
        })
    }
})

router.post('/getUpdateSubAdmin', async (req, res) => {
    console.log('/getUpdateSubAdmin');

    var user_id = req.body.user_id;
    var formData = req.body.formData;
    var type = req.body.type;
    var admin_email = req.body.admin_email;

    if (type == 'add') {
        var password = "P@ssw0rd";
        var hashPassword = functions.generateHashPassword(password);
        var otp = functions.generateRandomString(6, 'numeric');

        var createSubAdmin = await functions.getCreateUser(formData, hashPassword, otp);

        if (createSubAdmin) {
            var data = admin_email + " is added sub-admin " + createSubAdmin.name + ' ' + createSubAdmin.surname;
            var activity = "Added sub-admin";

            functions.getCreateActivityTracker(user_id, null, activity, data);

            res.json({
                status: 200,
                message: "Sub-admin added successfully!",
            })
        } else {
            res.json({
                status: 400,
                message: "Failed to add sub-admin",
            })
        }
    } else {
        var userDetails = await functions.getUserData(user_id);

        if (userDetails) {
            var updateSubAdmin = await functions.getUpdateUser(user_id, formData);

            if (updateSubAdmin == true) {
                var data = "sub-admin " + userDetails.name + ' ' + userDetails.surname + " is updated by " + admin_email;
                var activity = "Update sub-admin";

                functions.getCreateActivityTracker(user_id, null, activity, data);

                res.json({
                    status: 200,
                    message: "Sub-admin added successfully!",
                })
            } else {
                res.json({
                    status: 400,
                    message: "Failed to add sub-admin",
                })
            }
        } else {
            res.json({
                status: 400,
                message: "Something went wrong!",
            })
        }
    }
})

router.post('/getUpdateRoles', async (req, res) => {
    console.log('/getUpdateRoles');

    var user_id = req.body.user_id;
    var formData = req.body.formData;
    var admin_email = req.body.admin_email;

    var userDetails = await functions.getUserData(user_id);
    var rolesDetails = await functions.getRolesData(user_id);

    if (rolesDetails) {
        var updateRoles = await functions.getUpdateRoles(user_id, formData);

        if (updateRoles == true) {
            var data = admin_email + " is update roles of sub-admin " + userDetails.name + ' ' + userDetails.surname;
            var activity = "Added sub-admin";

            functions.getCreateActivityTracker(user_id, null, activity, data);

            res.json({
                status: 200,
                message: "Roles update successfully!",
            })
        } else {
            res.json({
                status: 400,
                message: "Failed to update roles",
            })
        }
    } else {
        res.json({
            status: 400,
            message: "Something went wrong!",
        })
    }
})

router.get('/verifyApplication', async (req, res) => {
    console.log('/verifyApplication');

    var app_id = req.query.app_id;
    console.log('app_id', app_id);
    var transcriptsLength;
    var marksheetsLength;
    var transcripts = [];
    var marksheets = [];

    var applicationDetails = await functions.getApplicationDetails(app_id);
    console.log('applicationDetails', applicationDetails);

    if (applicationDetails) {
        var user_id = applicationDetails.user_id;
        console.log('user_id', user_id);

        const data = await models.User.getStudentInfo(app_id);
        console.log('data$$$$$$$$$$$$$$$$$$$$$', JSON.stringify(data));
        console.log('data{{{{{{{{{{{{{{{{{{{{{', data[0].educationalDetails);

        if (data) {
            console.log('inside dataaaaaaaaaaa');
            if (!fs.existsSync(constant.FILE_LOCATION + "public/signedpdf/" + user_id + "/")) {
                console.log('Path not found');
                fs.mkdirSync(constant.FILE_LOCATION + "public/signedpdf/" + user_id + "/", { recursive: true });
            } else {
                console.log('Path already exist');
            }

            const tasks = [applicationDetails.id];

            const promises = tasks.map(task => {
                return new Promise(async (resolve, reject) => {
                    // Perform task asynchronously
                    // You can replace the console.log statement with your task processing logic
                    console.log("Currently Busy Processing Task " + task);
                    resolve({ task });

                    if (data[0].educationalDetails == true) {
                        console.log('inside educationalDetails');

                        //transcripts
                        var transcriptsDetails = await functions.getTranscriptsDetails(app_id, '%transcripts');
                        console.log('#################', JSON.stringify(transcriptsDetails));
                        console.log('#################', transcriptsDetails.length);

                        if (transcriptsDetails.length > 0) {
                            transcriptsDetails.forEach(user_transcript => {
                                var app_idArr = user_transcript.app_id.split(',');
                                app_idArr.forEach(transcript_appId => {
                                    if (transcript_appId == app_id) {
                                        transcripts.push(user_transcript);
                                        console.log('@@@@@@@@@@@@@@@@@', JSON.stringify(transcripts));
                                    }
                                })
                            })
                            console.log('!!!!!!!!!!!!!!!!!', transcripts.length);

                            transcriptsLength = transcripts.length;
                            console.log('!!!!---------!!!!', transcriptsLength);

                            transcripts.forEach(async transcript => {
                                var doc_name = transcript.name.split(' ').join('_');
                                console.log('-------------------', doc_name);

                                var signed_path = constant.FILE_LOCATION + 'public/signedpdf/' + user_id + '/';
                                console.log('^^^^^^^^^^^^^^^^^^^^', signed_path);

                                var file_name = doc_name + "_" + path.parse(transcript.file_name).name;
                                console.log('~~~~~~~~~~~~~~~~~', file_name);

                                var file_path = constant.FILE_LOCATION + 'public/upload/transcript/' + user_id + '/' + transcript.file_name;
                                console.log('$$$$$$$$$$$$$$$$$$$', file_path);

                                var category = "Transcript";

                                if (fs.existsSync(file_path)) {
                                    var extension = transcript.file_name.split('.').pop();
                                    console.log('````````````````````', extension);
                                    var numOfpages;

                                    if (extension == 'pdf') {
                                        console.log('inside pdf');
                                        const signingProcess = async () => {
                                            try {
                                                var folderName = file_name.split(" ").join("_");
                                                outputDirectory = constant.FILE_LOCATION + 'public/upload/transcript/' + user_id + '/' + folderName + '/';
                                                console.log('_______________________', outputDirectory);

                                                fn.pdfToImageConversion(path.parse(transcript.file_name).name, user_id, file_path, outputDirectory);

                                                let bufferData = fs.readFileSync(file_path);
                                                console.log('========================', bufferData);
                                                const data = await pdf(bufferData);
                                                numOfpages = data.numOfpages;
                                                console.log('nummmmmmmmmmmmmmm', numOfpages);

                                                outputDirectory = constant.FILE_LOCATION + "public/upload/transcript/" + user_id + "/signed_" + folderName + "/";
                                                console.log('_______________________', outputDirectory);

                                                if (!fs.existsSync(outputDirectory)) {
                                                    fs.mkdirSync(outputDirectory);
                                                }

                                                async function processFiles() {
                                                    try {
                                                        const fileArray = [];
                                                        for (let i = 1; i <= numOfpages; i++) {
                                                            let j = "";
                                                            if (numOfpages >= 100) {
                                                                if (parseInt(i / 100) > 0) {
                                                                    j = i;
                                                                } else if (parseInt(i / 10) > 0) {
                                                                    j = "0" + i;
                                                                } else {
                                                                    j = "00" + i;
                                                                }
                                                            } else if (numOfpages >= 10) {
                                                                if (parseInt(i / 10) > 0) {
                                                                    j = i;
                                                                } else {
                                                                    j = "0" + i;
                                                                }
                                                            } else if (numOfpages >= 1) {
                                                                j = i;
                                                            }

                                                            console.log("fileName == " + file_name);
                                                            const filePath = constant.FILE_LOCATION + "public/upload/transcript/" + user_id + "/" + folderName + "/" + path.parse(transcript.file_name).name + "-" + j + ".jpg";
                                                            console.log(filePath);
                                                            const fileName = file_name + "-" + j + ".jpg";
                                                            console.log("file_name == " + file_name);

                                                            const index = await new Promise((resolve, reject) => {
                                                                fn.signingDocuments(path.parse(fileName).name, application.user_id, app_id, filePath, doc_name, category, outputDirectory, j, function (err, index) {
                                                                    if (err) {
                                                                        reject(err);
                                                                    } else {
                                                                        resolve(index);
                                                                    }
                                                                });
                                                            });

                                                            fileArray.push({
                                                                index: index,
                                                                fileName: signed_outputDirectory + doc_name + "_" + fileName + "-" + index + ".pdf"
                                                            });
                                                        }

                                                        console.log('fileArray == ' + JSON.stringify(fileArray));
                                                        return fileArray;
                                                    } catch (error) {
                                                        console.error(error);
                                                        throw error;
                                                    }
                                                }

                                                const result = await processFiles();
                                                console.log("result == " + result);

                                                var fileString = fn.sortArrayConvertString(result);
                                                console.log("fileString == " + fileString);

                                                outputDirectory = signed_path;
                                                fn.mergeDocuments(app_id, application.user_id, doc_name, path.parse(transcript.file_name).name, outputDirectory, fileString, async function (err) {
                                                    if (err) {
                                                        return res.json({
                                                            status: 400,
                                                            message: "Files cannot merge"
                                                        })
                                                    } else {
                                                        var fileName = doc_name + "_" + path.parse(transcript.file_name).name + ".pdf";

                                                        var emailDocsDetails = await functions.getEmailDocsDetails(transcript.id, app_id, fileName);
                                                        console.log('&&&&&&&&&&&&&&&&&&&&&&', JSON.stringify(emailDocsDetails));
                                                        console.log('&&&&&&&&&&&&&&&&&&&&&&', emailDocsDetails.length);

                                                        if (emailDocsDetails.length > 0) {

                                                        } else {
                                                            console.log('inside emaildocs elase');

                                                            var createEmailDocs = await functions.getCreateEmailDocs(transcript.id, app_id, doc_name, fileName, category);
                                                            console.log('***********************', JSON.stringify(createEmailDocs));
                                                        }
                                                    }
                                                })
                                            } catch (error) {
                                                console.error(error);
                                            }
                                        };
                                        signingProcess().catch((error) => {
                                            console.error(error);
                                        });
                                    } else {
                                        var fileName = file_name + '.pdf'
                                        outputDirectory = signed_path;
                                        console.log('_______________________', outputDirectory);
                                        console.log('inside others2222222', file_path);

                                        fn.signingDocuments(path.parse(transcript.file_name).name, user_id, app_id, file_path, doc_name, category, outputDirectory, '', async function (err, index) {
                                            if (err) {
                                                res.json({
                                                    status: 400,
                                                    message: err
                                                })
                                            } else {
                                                console.log('----------------->', fileName);

                                                var emailDocsDetails = await functions.getEmailDocsDetails(transcript.id, app_id, fileName);
                                                console.log('&&&&&&&&&&&&&&&&&&&&&&', JSON.stringify(emailDocsDetails));
                                                console.log('&&&&&&&&&&&&&&&&&&&&&&', emailDocsDetails.length);

                                                if (emailDocsDetails.length > 0) {

                                                } else {
                                                    console.log('inside emaildocs elase');

                                                    var createEmailDocs = await functions.getCreateEmailDocs(transcript.id, app_id, doc_name, fileName);
                                                    console.log('***********************', JSON.stringify(createEmailDocs));

                                                }
                                            }
                                        })
                                    }
                                } else {
                                    // res.json({
                                    //     status: 400,
                                    //     message: transcript.name + " not found"
                                    // })
                                }
                            })
                        } else {
                            res.json({
                                status: 400,
                                message: "Transcripts not found"
                            })
                        }

                        //marksheets
                        var marksheetDetails = await functions.getAppliedDetails(user_id, app_id);
                        console.log('+++++++++++++++++++++++++', marksheetDetails);
                        console.log('+++++++++++++++++++++++++', marksheetDetails.length);

                        if (marksheetDetails.length > 0) {
                            marksheetDetails.forEach(user_marklist => {
                                var app_idArr = user_marklist.app_id.split(',');
                                app_idArr.forEach(marklist_appId => {
                                    if (marklist_appId == app_id) {
                                        marksheets.push(user_marklist);
                                    }
                                })
                            })
                            console.log('@@@@@@@@@@@@@@@@@', JSON.stringify(marksheets));

                            console.log('!!!!!!!!!!!!!!!!!', marksheets.length);

                            marksheetsLength = marksheets.length;

                            console.log('!!!!---------!!!!', marksheetsLength);

                            marksheets.forEach(async marksheet => {
                                console.log('QQQQQQQQQQQQQQQ', marksheet.name);
                                var doc_name = marksheet.name.split(' ').join('_');
                                console.log('-------------------', doc_name);

                                var signed_path = constant.FILE_LOCATION + 'public/signedpdf/' + user_id + '/';
                                console.log('^^^^^^^^^^^^^^^^^^^^', signed_path);

                                var file_name = doc_name + "_" + path.parse(marksheet.file_name).name;
                                console.log('~~~~~~~~~~~~~~~~~', file_name);

                                var file_path = constant.FILE_LOCATION + 'public/upload/marklist/' + user_id + '/' + marksheet.file_name;
                                console.log('$$$$$$$$$$$$$$$$$$$', file_path);

                                var category = "Marklist";

                                if (fs.existsSync(file_path)) {
                                    var extension = marksheet.file_name.split('.').pop();
                                    console.log('````````````````````', extension);
                                    var numOfpages;

                                    if (extension == 'pdf') {
                                        const signingProcess = async () => {
                                            try {
                                                var folderName = file_name.split(' ').join('_');
                                                console.log("folderName == " + folderName);

                                                outputDirectory = constant.FILE_LOCATION + "public/upload/marklist/" + user_id + "/" + folderName + "/";

                                                fn.pdfToImageConversion(marksheet.file_name, user_id, file_path, outputDirectory);

                                                let bufferData = fs.readFileSync(file_path);
                                                console.log('========================', bufferData);
                                                const data = await pdf(bufferData);
                                                numOfpages = data.numOfpages;
                                                console.log('nummmmmmmmmmmmmmm', numOfpages);

                                                outputDirectory = constant.FILE_LOCATION + "public/upload/transcript/" + user_id + "/signed_" + folderName + "/";
                                                console.log('_______________________', outputDirectory);

                                                if (!fs.existsSync(outputDirectory)) {
                                                    fs.mkdirSync(outputDirectory);
                                                }

                                                async function processFiles() {
                                                    var fileArray = [];
                                                    try {
                                                        for (let i = 0; i <= numOfpages; i++) {
                                                            let j = "";
                                                            if (numOfpages >= 100) {
                                                                console.log('::::::::::::::', parseInt(i / 100));
                                                                if (parseInt(i / 100) > 0) {
                                                                    j = i;
                                                                } else if (parseInt(i / 10) > 0) {
                                                                    j = '0' + i;
                                                                } else {
                                                                    j = '00' + i;
                                                                }
                                                            } else if (numOfpages >= 10) {
                                                                if (parseInt(i / 10) > 0) {
                                                                    j = i;
                                                                } else {
                                                                    j = '0' + i;
                                                                }
                                                            } else if (numOfpages >= 1) {
                                                                j = i;
                                                            }

                                                            console.log('JJJJJJJJJJJJJJJJJJJJJJ', j);

                                                            console.log('~~~~~~~~~~~~~~~~~', file_name);

                                                            var filePath = constant.FILE_LOCATION + 'public/upload/transcript/' + user_id + '/' + folderName + '-' + j + '.jpg';
                                                            console.log('::::::::::::::::::::::::::', filePath);
                                                            var fileName = file_name + '-' + j + '.jpg';
                                                            console.log('~~~~~~~~~~~~~~~~~', fileName);

                                                            const index = await new Promise((resolve, reject) => {
                                                                fn.signingDocuments(path.parse(fileName).name, user_id, filePath, doc_name, category, outputDirectory, j, function (err, index) {
                                                                    if (err) {
                                                                        reject(err);
                                                                    } else {
                                                                        resolve(index);
                                                                    }
                                                                })
                                                            });

                                                            fileArray.push({
                                                                index: index,
                                                                fileName: signed_outputDirectory + doc_name + '_' + fileName + '-' + index + '.pdf',
                                                            })
                                                        }

                                                        console.log('||||||||||||||||||||||||', fileArray);
                                                        return fileArray;
                                                    } catch (error) {
                                                        console.error(error);
                                                        throw error;
                                                    }
                                                }

                                                const result = await processFiles();
                                                console.log('{{{{{{{{{{{{{{{{', result);

                                                var fileString = fn.sortArrayConvertString(result);
                                                console.log('}}}}}}}}}}}}}}}}}}', fileString);

                                                outputDirectory = signed_path;

                                                fn.mergeDocuments(app_id, user_id, doc_name, path.parse(marksheet.file_name).name, outputDirectory, fileString, async function (err) {
                                                    if (err) {
                                                        return res.json({
                                                            status: 400,
                                                            message: "Files cannot merge"
                                                        })
                                                    } else {
                                                        var fileName = doc_name + "_" + path.parse(marksheet.file_name).name + ".pdf";

                                                        var emailDocsDetails = await functions.getEmailDocsDetails(marksheet.id, app_id, fileName);
                                                        console.log('&&&&&&&&&&&&&&&&&&&&&&', JSON.stringify(emailDocsDetails));
                                                        console.log('&&&&&&&&&&&&&&&&&&&&&&', emailDocsDetails.length);

                                                        if (emailDocsDetails.length > 0) {

                                                        } else {
                                                            console.log('inside emaildocs elase');

                                                            var createEmailDocs = await functions.getCreateEmailDocs(marksheet.id, app_id, doc_name, fileName, category);
                                                            console.log('***********************', JSON.stringify(createEmailDocs));
                                                        }
                                                    }
                                                })
                                            } catch (error) {
                                                console.log('errrrrrrrooorrrrrrrrr', error);
                                            }
                                        };
                                        signingProcess().catch((error) => {
                                            console.error('eeeeeeeeeeeeee', error);
                                        })
                                    } else {
                                        var fileName = file_name + '.pdf'
                                        outputDirectory = signed_path;
                                        console.log('_______________________', outputDirectory);
                                        console.log('inside others2222222', file_path);

                                        fn.signingDocuments(path.parse(marksheet.file_name).name, user_id, app_id, file_path, doc_name, category, outputDirectory, '', async function (err, index) {
                                            if (err) {
                                                res.json({
                                                    status: 400,
                                                    message: err
                                                })
                                            } else {
                                                console.log('----------------->', fileName);

                                                var emailDocsDetails = await functions.getEmailDocsDetails(marksheet.id, app_id, fileName);
                                                console.log('&&&&&&&&&&&&&&&&&&&&&&', JSON.stringify(emailDocsDetails));
                                                console.log('&&&&&&&&&&&&&&&&&&&&&&', emailDocsDetails.length);

                                                if (emailDocsDetails.length > 0) {

                                                } else {
                                                    console.log('inside emaildocs elase');

                                                    var createEmailDocs = await functions.getCreateEmailDocs(marksheet.id, app_id, doc_name, fileName);
                                                    console.log('***********************', JSON.stringify(createEmailDocs));

                                                }
                                            }
                                        })
                                    }
                                } else {
                                    res.json({
                                        status: 400,
                                        message: marksheet.name + " not found"
                                    })
                                }
                            })
                        } else {
                            res.json({
                                status: 400,
                                message: "Marksheets not found"
                            })
                        }
                    }
                    if (data[0].instructionalField == true) {
                        console.log('inside instructionalField');
                    }
                    if (data[0].LetterforNameChange == true) {
                        console.log('inside LetterforNameChange');
                    }
                    if (data[0].affiliation == true) {
                        console.log('inside affiliation');
                    }
                    if (data[0].curriculum == true) {
                        console.log('inside curriculum');
                    }
                    if (data[0].gradToPer == true) {
                        console.log('inside gradToPer');
                    }
                    if (data[0].CompetencyLetter == true) {
                        console.log('inside CompetencyLetter');
                    }
                });
            });

            Promise.all(promises)
                .then(results => {
                    // All tasks completed successfully
                    console.log(results);
                    // Continue with any remaining code
                })
                .catch(error => {
                    // Error occurred during task execution
                    console.error(error);
                    // Handle the error as needed
                });

        }
    } else {
        res.json({
            status: 400,
            message: "Application not found"
        })
    }
})
/**
 * To check Wes Details as student uploaded wrong or right .
 * @param {String} wesno  Wes no of student uploaded
 * @param {String} email - Wes Email of student uploaded
 * @param {String} name - Wes Firstname of student uploaded
 * @param {String} lastName - Wes Lastname of student uploaded
 */
router.post('/getWes_details',function(req,res){
    console.log("/getWes_details");
	var wesno = req.body.wesno;
	var email = req.body.email;
	var firstName = req.body.name;
	var lastName = req.body.lastname;
	fn.getWesDetails(wesno,lastName,firstName,email,function(err,data){
		if(err  == 'Wes Number not found' || err.includes('is not Correct')){
			return res.json({
				status : 400,
				message : err 
			})
		}else{
			return res.json({
				status : 200,
				data : data 
			})
		}
		
		});
})

router.post('/updatePaymentNotes', middlewares.getUserInfo, async (req, res) =>{
    console.log('/updatePaymentNotes');

    var user_id = req.body.user_id;
    var notes_data = req.body.notes_data;
    var tracker = req.body.tracker;
    var issue_id = req.body.issue_id;
    var user_email = req.User.email;
    var user_name = req.User.name + ' ' + req.User.surname;

    var paymentIssueDetails = await functions.getPaymentIssueDetails(issue_id);
    console.log('JJJJJJJJJJJJJJJJJJ',notes_data);

    if(paymentIssueDetails){
        var updateNotes = await functions.getUpdatePaymentNotes(notes_data, tracker, issue_id);
        console.log('PPPPPPPPPPPPPPPPPPP',updateNotes);

        if(updateNotes == true){
            let data = user_name + "'s note updated by " + user_email + ".";
            let activity = "Note updated";
            functions.activitylog(user_id, '', activity, data, req);

            return res.json({
				status : 200,
				message : 'Note updated successfully', 
			})
        }else{
            return res.json({
				status : 400,
				message : 'Failed to update note!', 
			})
        }
    }else{
        return res.json({
            status : 400,
            message : 'Something went wrong!', 
        })
    }
})

/** getEmailActivityTracker route to get data of email activity */
router.get('/getEmailActivityTracker', async (req, res) => {
    try {
        const globalSearch = req.query.globalSearch;
        const limit = req.query.limit;
        const offset = req.query.offset;
        const EmailActivity = [];
        const EmailActivityData = await functions.getEmailActivity(globalSearch, limit, offset);
        const EmailActivityCount = await functions.getEmailActivityCount(globalSearch);
        if (EmailActivityData && EmailActivityCount) {

            for (const data of EmailActivityData) {
                EmailActivity.push({
                    email: data.email,
                    subject: data.subject,
                    status: data.status,
                    created_at: moment(new Date(data.created_at)).format("DD/MM/YYYY"),
                    opens_count: data.opens_count,
                    clicks_count: data.clicks_count,
                })
            }
            return res.json({
                status: 200,
                data: EmailActivity,
                count: EmailActivityCount
            })
        }else{
            return res.json({
                status: 400, 
                message:"No Data Available" ,
            })   
        }
    } catch (error) {
        console.error("Error in /getEmailActivityTracker", error);
        return res.status(500).json({
            message: "Internal Server Error",
        });
    }
})

module.exports = router;
