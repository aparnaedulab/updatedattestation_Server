"use strict";
var crypto = require('crypto');
var randomstring = require('randomstring');
var constants = require('../config/constant');
var moment = require('moment');
var Moment = require('moment-timezone');
var models = require('../models');
// algorithm = 'aes-256-ctr',
// password = 'je93KhWE08lH9S7SN83sneI87';
var Sequelize = require("sequelize");
const Op = Sequelize.Op;
const express = require('express');
var router = express.Router();
const cfg = require('../auth/config');
const jwt = require('jwt-simple');
const { groupBy } = require('async');
// const secret = cfg.jwtSecret;
// const jsonwebtoken = require('jsonwebtoken');
// const token = headers.authorization.split(' ')[1];

module.exports = {

    generateHashPassword: function (password) {
        var hashPassword = crypto
            .createHash("md5")
            .update(password)
            .digest('hex');

        return hashPassword;
    },

    createAccessToken: function (user) {
        var payload = {
            sub: user.user_id,
            exp: moment().add(cfg.accessTokenExpiresIn, 'seconds').unix(),
            iat: moment().unix(),
            id: user.user_id,
            email: user.user_email,
            name: user.user_name,
            surname: user.user_surname,
            mobile: user.user_mobile,
            category: user.user_student_category,
            profileCompleteness: user.profileCompleteness,
            role: user.user_type,
            country_birth: user.country_birth,
            theme: user.theme,
            user_type: user.user_type,
            login_count: user.login_count,
            applying_for: user.applying_for,
            mobile_country_code: user.mobile_country_code,
            roles: user.roles,
        };
        var token = jwt.encode(payload, cfg.jwtSecret);
        return token;
    },

    // accessToken: function (token) {
    //     console.log('***************>', token);
    //     // try {
    //     //     const decoded = jsonwebtoken.verify(token, secret);
    //     //     console.log('*************>', secret);
    //     //     return decoded;
    //     // } catch (err) {
    //     //     console.error('Token validation error:', err);
    //     //     return null;
    //     // }
    // },

    //Route /educationalDetails functions
    getAppliedForDetails: async (user_id, app_id) => {
        return models.Applied_For_Details.findOne({ where: { user_id: user_id, app_id: app_id } })
    },

    //Educational Details
    getUpdatedEducationalDetails: async (user_id, formdata, degree, phdvalue) => {
        return models.Applied_For_Details.update({ educationalDetails: formdata.educationalDetails, instructionalField: formdata.instructionalDetails, curriculum: formdata.curriculumDetails, gradToPer: formdata.gradToPer, affiliation: formdata.affiliation, CompetencyLetter: formdata.CompetencyLetter, LetterforNameChange: formdata.LetterforNameChange, isphd: formdata.phd }, { where: { user_id: user_id } })
    },

    getCreateEducationalDetails: async (user_id, formdata) => {
        return models.Applied_For_Details.create({ user_id: user_id, educationalDetails: formdata.educationalDetails, instructionalField: formdata.instructionalDetails, curriculum: formdata.curriculumDetails, gradToPer: formdata.gradToPer, affiliation: formdata.affiliation, CompetencyLetter: formdata.CompetencyLetter, LetterforNameChange: formdata.LetterforNameChange, isphd: formdata.phd })
    },

    //get list of purpose
    getPurposeList: async () => {
        return models.Purpose_List.findAll({})
    },

    getPurposeListByPurposeName: async (purpose_name) => {
        return models.Purpose_List.findAll({ where: { name: purpose_name } })
    },

    //get educational details count for payment
    getEducationalDetailsCount: async (user_id, app_id) => {
        return models.Applied_For_Details.findOne({ where: { user_id: user_id, app_id: app_id } })
    },

    //for user details
    getUserDetails: async (user_id) => {
        return models.User.findAll({ where: { id: user_id } })
    },

    //for user email and password details
    getUserEmailDetails: async (email, hashPassword) => {
        return models.User.findOne({ where: { email: email, password: hashPassword } })
    },

    //create institute
    getCreateInstitution: async (formData, emailArr, user_id, type, app_id, anotherEmailArr, anotherEmail) => {
        return models.Institution_details.create({
            university_name: formData.allUniversityCompanyName ? formData.allUniversityCompanyName : null,
            country_name: formData.allCountryName ? formData.allCountryName : null,
            email: emailArr ? anotherEmailArr : null,
            otherEmail: anotherEmail ? anotherEmail : null,
            contact_number: formData.allContactNo ? formData.allContactNo : null,
            user_id: user_id,
            contact_person: formData.allContactPersonName ? formData.allContactPersonName : null,
            type: type,
            refno: formData.allRefNo ? formData.allRefNo : null,
            emailAsWes: formData.wesEmail ? formData.wesEmail : null,
            nameaswes: formData.wesName ? formData.wesName : null,
            lastnameaswes: formData.wesSurname ? formData.wesSurname : null,
            name: formData.allName ? formData.allName : null,
            app_id: app_id ? app_id : null,
        })
    },

    //update institute
    getUpdateInstitution: async (formData, emailArr, user_id, type, app_id, anotherEmailArr, anotherEmail, institute_id) => {
        return models.Institution_details.update({
            university_name: formData.allUniversityCompanyName ? formData.allUniversityCompanyName : null,
            country_name: formData.allCountryName ? formData.allCountryName : null,
            email: emailArr ? anotherEmailArr : null,
            otherEmail: anotherEmail ? anotherEmail : null,
            contact_number: formData.allContactNo ? formData.allContactNo : null,
            user_id: user_id,
            contact_person: formData.allContactPersonName ? formData.allContactPersonName : null,
            type: type,
            refno: formData.allRefNo ? formData.allRefNo : null,
            emailAsWes: formData.wesEmail ? formData.wesEmail : null,
            nameaswes: formData.wesName ? formData.wesName : null,
            lastnameaswes: formData.wesSurname ? formData.wesSurname : null,
            name: formData.allName ? formData.allName : null,
            app_id: app_id ? app_id : null,
        }, { where: { id: institute_id } })
    },

    //update cart /////not using
    getUpdateCart: async (institute_id, amount, universityName, emailArr, user_id, anotherEmailArr) => {
        console.log('createInstitute.id---', institute_id);
        console.log('amount---', amount);
        console.log('emailArr---', emailArr);
        console.log('anotherEmailArr---', anotherEmailArr);
        console.log('universityName---', universityName);

        return models.Cart.update({ institute_id: institute_id, fees: amount, university_name: universityName, email: emailArr ? anotherEmailArr : null, user_id: user_id }, { where: { institute_id: institute_id } })
    },

    //get delete institution 
    getDeleteInstitution: async (institute_id) => {
        return models.Institution_details.destroy({ where: { id: institute_id } })
    },

    //get delete hrd
    getDeleteHrd: async (institute_id) => {
        return models.Hrd_details.destroy({ where: { id: institute_id } })
    },

    checkHrdDetails: async (user_id) => {
        return models.Hrd_details.findAll({ where: { user_id: user_id } })
    },

    //get delete hrdInstitute
    getDeleteHrdInstitute: async (user_id, purpose_name) => {
        return models.Institution_details.destroy({ where: { user_id: user_id, type: purpose_name } })
    },

    //get all institute data 
    getInstituteDataAll: async (user_id, app_id) => {
        return models.Institution_details.findAll({ where: { user_id: user_id, app_id: app_id } })
    },

    //get specific institute data 
    getInstituteData: async (id) => {
            return models.Institution_details.findOne({ where: { id : id } })
},

    //get single institute data
    getInstituteDataSingle: async (institute_id, purpose_name) => {
        return models.Institution_details.findAll({ where: { id: institute_id, type: purpose_name } })
    },

    //get applied details
    getAppliedDetails: async (user_id, app_id) => {
        return models.UserMarklist_Upload.findAll({ where: { user_id: user_id, app_id: app_id } })
    },

    getUserMarklistUploadDetailsSame: async (user_id, degree_type, app_id) => {
        return models.UserMarklist_Upload.findAll({ where: { user_id: user_id, education_type: degree_type, app_id: app_id } })
    },

    getUserMarklistUploadDetailsDifferent: async (user_id, degree_type, faculty_type, app_id) => {
        return models.UserMarklist_Upload.findAll({ where: { user_id: user_id, education_type: degree_type, faculty: faculty_type, app_id: app_id } })
    },

    getCreateHrd: async (user_id, formData, degree_type, secondlastSem, lastSem, app_id) => {
        return models.Hrd_details.create({
            fullName: formData.fullName ? formData.fullName : null,
            course_name: formData.courseName ? formData.courseName : null,
            seat_no: formData.seatNo ? formData.seatNo : null,
            seat_no_sem6: formData.seatNo_sem6 ? formData.seatNo_sem6 : null,
            seat_no_sem5: formData.seatNo_sem5 ? formData.seatNo_sem5 : null,
            prn_no: formData.prnNo ? formData.prnNo : null,
            cgpa: formData.cgpaNo ? formData.cgpaNo : null,
            cgpi: formData.cgpiNo ? formData.cgpiNo : null,
            transcript_no: formData.transcriptNo ? formData.transcriptNo : null,
            transcript_date: formData.transcriptDate ? formData.transcriptDate : null,
            exam_date: formData.examDate ? formData.examDate : null,
            specialization: formData.specialization ? formData.specialization : null,
            user_id: user_id ? user_id : null,
            app_id: app_id ? app_id : null,
            degree: degree_type ? degree_type : null,
            lastsem: lastSem ? lastSem : null,
            secondlastsem: secondlastSem ? secondlastSem : null,
        })
    },

    getUpdateHrd: async (user_id, formData, degree_type, secondlastSem, lastSem, hrd_id, app_id) => {
        return models.Hrd_details.update({
            fullName: formData.fullName ? formData.fullName : null,
            course_name: formData.courseName ? formData.courseName : null,
            seat_no: formData.seatNo ? formData.seatNo : null,
            seat_no_sem6: formData.seatNo_sem6 ? formData.seatNo_sem6 : null,
            seat_no_sem5: formData.seatNo_sem5 ? formData.seatNo_sem5 : null,
            prn_no: formData.prnNo ? formData.prnNo : null,
            cgpa: formData.cgpaNo ? formData.cgpaNo : null,
            cgpi: formData.cgpiNo ? formData.cgpiNo : null,
            transcript_no: formData.transcriptNo ? formData.transcriptNo : null,
            transcript_date: formData.transcriptDate ? formData.transcriptDate : null,
            exam_date: formData.examDate ? formData.examDate : null,
            specialization: formData.specialization ? formData.specialization : null,
            user_id: user_id ? user_id : null,
            app_id: app_id ? app_id : null,
            degree: degree_type ? degree_type : null,
            lastsem: lastSem ? lastSem : null,
            secondlastsem: secondlastSem ? secondlastSem : null,
        }, { where: { id: hrd_id } })
    },

    checkInstitutionDetails: async (user_id, app_id, purpose_name) => {
        return models.Institution_details.findAll({ where: { user_id: user_id, app_id: app_id, type: purpose_name } })
    },

    getCreateHrdInstitute: async (user_id, purpose_name, emailArr, anotherEmailArr, anotherEmail, app_id) => {
        return models.Institution_details.create({
            email: emailArr ? anotherEmailArr : null,
            otherEmail: anotherEmail ? anotherEmail : null,
            type: purpose_name ? purpose_name : null,
            user_id: user_id ? user_id : null,
            app_id: app_id ? app_id : null,
        })
    },

    getHrdDetailsAll: async (user_id, app_id) => {
        return models.Hrd_details.findAll({ where: { user_id: user_id, app_id: app_id } })
    },

    getHrdDetailsSingle: async (user_id, app_id, hrd_id) => {
        return models.Hrd_details.findAll({ where: { user_id: user_id, app_id: app_id, id: hrd_id } })
    },

    getCollegeDetails: async (collegeId) => {
        return models.College.findOne({ where: { id: collegeId } })
    },

    getUserTrascripts: async (user_id, app_id) => {
        return models.User_Transcript.findAll({ where: { user_id: user_id, app_id: app_id } })
    },

    getUserCurriculum: async (user_id, app_id) => {
        return models.User_Curriculum.findAll({ where: { user_id: user_id, app_id: app_id } })
    },

    getUserGradtoper: async (user_id, app_id) => {
        return models.GradeToPercentageLetter.findAll({ where: { user_id: user_id, app_id: app_id } })
    },

    getUserCompetency: async (user_id, app_id) => {
        return models.competency_letter.findAll({ where: { user_id: user_id, app_id: app_id } })
    },

    getUserLetterfornamechange: async (user_id, app_id) => {
        return models.Letterfor_NameChange.findAll({ where: { user_id: user_id, app_id: app_id } })
    },

    getUserInstructionalAndAffiliation: async (user_id, app_id, type) => {
        return models.letter_details.findAll({ where: { user_id: user_id, app_id: app_id, type: type } })
    },

    updateUser: async (user_id, otp) => {
        return models.User.update({ otp: otp }, { where: { id: user_id } })
    },

    getUserNameChangeProof: async (user_id, app_id, type) => {
        return models.User_Transcript.findAll({ where: { user_id: user_id, app_id: app_id, education_type: type } })
    },

    //get admin role details
    getRoleDetails: async (user_id) => {
        return models.Role.findOne({ where: { userid: user_id } })
    },

    getAddCollege: async (purpose, formData) => {
        return models.College.create({
            name: formData.collegeName ? formData.collegeName : null,
            contactPerson: formData.contactPersonName ? formData.contactPersonName : null,
            contactNo: formData.contactNo ? formData.contactNo : null,
            emailId: formData.email ? formData.email : null,
            alternateContactPerson: formData.alternateContactPersonName ? formData.alternateContactPersonName : null,
            alternateContactNo: formData.alternateContactNo ? formData.alternateContactNo : null,
            alternateEmailId: formData.alternateEmail ? formData.alternateEmail : null,
            type: purpose ? purpose : null,
            status: 'active',
        })
    },

    getUpdateCollege: async (purpose, formData, college_id) => {
        return models.College.update({
            name: formData.collegeName ? formData.collegeName : null,
            contactPerson: formData.contactPersonName ? formData.contactPersonName : null,
            contactNo: formData.contactNo ? formData.contactNo : null,
            emailId: formData.email ? formData.email : null,
            alternateContactPerson: formData.alternateContactPersonName ? formData.alternateContactPersonName : null,
            alternateContactNo: formData.alternateContactNo ? formData.alternateContactNo : null,
            alternateEmailId: formData.alternateEmail ? formData.alternateEmail : null,
            type: purpose ? purpose : null,
            status: 'active',
        }, { where: { id: college_id } })
    },

    getAllCollegeList: async () => {
        return models.College.findAll({})
    },

    getSingleCollegeList: async (id) => {
        return models.College.findAll({ where: { id: id } })
    },

    getAllFacultyList: async () => {
        return models.facultymaster.findAll({})
    },

    getSingleFacultyList: async (id) => {
        return models.facultymaster.findAll({ where: { id: id } })
    },

    getAddFaculty: async (formData) => {
        return models.facultymaster.create({
            faculty: formData.facultyName ? formData.facultyName : null,
            degree: formData.degreeName ? formData.degreeName : null,
            year: formData.year ? formData.year : null,
        })
    },

    getUpdateFaculty: async (formData, id) => {
        return models.facultymaster.update({
            faculty: formData.facultyName ? formData.facultyName : null,
            degree: formData.degreeName ? formData.degreeName : null,
            year: formData.year ? formData.year : null,
        }, { where: { id: id } })
    },

    getDeleteCollege: async (id) => {
        return models.College.destroy({ where: { id: id } })
    },

    getDeleteFaculty: async (id) => {
        return models.facultymaster.destroy({ where: { id: id } })
    },

    getActiveInactiveCollege: async (status, id) => {
        return models.College.update({
            status: status,
        }, { where: { id: id } })
    },

    getActivityTrackerList: async (offset, limit, globalSearch) => {
        const data = {}
        if (globalSearch) {
            data[Op.or] = [
                Sequelize.literal(`CONCAT(data, '', activity, '') LIKE '%${globalSearch}%'`),
            ];
        }

        offset = parseInt(offset);
        limit = parseInt(limit);

        return models.Activitytracker.findAll({
            where: data,
            limit: limit,
            offset: offset,
        });
    },

    getActivityTrackerSingle: async (user_id) => {
        return models.Activitytracker.findAll({ where: { user_id: user_id } })
    },

    getActivityTrackerCount: async (globalSearch) => {
        const data = {}
        if (globalSearch) {
            data[Op.or] = [
                Sequelize.literal(`CONCAT(data, '', activity, '') LIKE '%${globalSearch}%'`),
            ];
        }

        return models.Activitytracker.count({
            where: data,
        });
    },

    generateRandomString: function (length, charset) {
        return randomstring.generate({
            length: length,
            charset: charset
        });
    },

    getAllAppliedDetails: async (user_id) => {
        return models.Applied_For_Details.findAll({ where: { user_id: user_id } })
    },


    getAllUserDetails: async (user_type) => {
        return models.User.findAll({ where: { user_type: user_type } })
    },

    getActiveInactiveUser: async (status, user_id) => {
        return models.User.update({
            user_status: status,
        }, { where: { id: user_id } })
    },

    getResetPassword: async (hashPassword, user_id) => {
        return models.User.update({
            password: hashPassword,
        }, { where: { id: user_id } })
    },

    getUserApplicationDetails: async (student_id) => {
        return models.Application.findOne({ where: { user_id: student_id } })
    },

    getChangeName: async (user_id, firstName, lastName) => {
        return models.User.update({
            name: firstName ? firstName : null,
            surname: lastName ? lastName : null,
        }, { where: { id: user_id } })
    },

    getChangeLocation: async (user_id, location) => {
        console.log('%%%%%%%%%%%', user_id);
        console.log('%%%%%%%%%%%', location);
        return models.User.update({
            current_location: location,
        }, { where: { id: user_id } })
    },

    getDeleteMarksheet: async (id) => {
        return models.UserMarklist_Upload.destroy({ where: { id: id } })
    },

    getDeleteTranscript: async (id) => {
        return models.User_Transcript.destroy({ where: { id: id } })
    },

    getDeleteCurriculum: async (id) => {
        return models.User_Transcript.destroy({ where: { id: id } })
    },

    getUpdateInstructionalAffiliation: async (id, app_id, formData, purpose) => {
        return models.InstructionalDetails.update({
            courseName: formData.courseName ? formData.courseName : null,
            collegeName: formData.collegeName ? formData.collegeName : null,
            specialization: formData.specialization ? formData.specialization : null,
            yearofpassing: formData.yearOfPassing ? formData.yearOfPassing : null,
            duration: formData.duration ? formData.duration : null,
            division: formData.passedWith ? formData.passedWith : null,
            education_type: formData.degree ? formData.degree : null,
            type: purpose ? purpose : null,
            app_id: app_id ? app_id : null,
        }, { where: { id: id } })
    },
    uploadDocuments: async function (user_id, type, image) {
        try {
            if (type == 'marklist') {
                return await models.UserMarklist_Upload.create({user_id: user_id, file_name: image, upload_step: 'default' , name  : 'Document'});
            }
            if (type == 'transcript') {
                return await models.User_Transcript.create({ user_id: user_id, file_name: image, upload_step: 'default' , education_type : 'transcript' ,name  : 'Document' });
            }
            if (type == 'extra') {
                return await models.User_Transcript.create({ user_id: user_id, file_name: image, upload_step: 'default', name: 'extra_Document', education_type: 'extra_document' });
            }
            if (type == 'curriculum') {
                return await models.User_Curriculum.create({ user_id: user_id, file_name: image, upload_step: 'default', name  : 'Document'  });
            }
            if (type == 'gradtoper') {
                return await models.GradeToPercentageLetter.create({ user_id: user_id, file_name: image, upload_step: 'default', name  : 'Document' });
            }
            if (type == 'LetterforNameChange') {
                return await models.Letterfor_NameChange.create({ user_id: user_id, file_name: image, upload_step: 'default' , name  : 'Document' });
            }
        } catch {
        }

    },
    getCollegeList: async function () {
        return await models.College.findAll({});
    },
    getProgramList: async function () {
        return await models.facultymaster.findAll();
    },
    getAppliedFor: async function (user_id, app_id) {
        try {
            return await models.Applied_For_Details.findOne({
                where: {
                    user_id: user_id, app_id: {
                        [Op.eq]: null
                    }
                }
            });
        } catch {
        }
    },
    getDistinctData: async function (user_id) {
        return await models.UserMarklist_Upload.findAll({
            where: {
                user_id: user_id, app_id: {
                    [Op.eq]: null
                },courseClgId :{[Op.ne] : null}
            }, attributes: [
                [Sequelize.fn('DISTINCT', Sequelize.col('courseClgId', 'id')), 'uniqueValues']
            ]
        });
    },

    getCollegeDetails_student: async function (name) {
        var data = [];
        var id = await models.UserMarklist_Upload.findOne({ where: { courseClgId: name } });
        var college = await models.College.findOne({ where: { id: id.collegeId } })
        data.push({ 'coursename': id.education_type + '_' + id.faculty, 'college': college ? college.name : college, 'collegeid': college ? college.id : college, 'faculty': id.faculty, 'education_type': id.education_type, 'pattern': id.pattern });
        return data;

    },
    getDocumentFuntion: async function (user_id, app_id, type) {
        try {
            if (type == 'marklist') {
                return await models.UserMarklist_Upload.findAll({ where: { user_id: user_id, app_id: app_id } });
            }
            if (type == 'transcript' || type == 'extra') {
                return await models.User_Transcript.findAll({
                    where: {
                        user_id: user_id, app_id: app_id
                    }
                });
            }
            if (type == 'curriculum') {
                return await models.User_Curriculum.findAll({
                    where: {
                        user_id: user_id, app_id: app_id
                    }
                });
            }
            if (type == 'GradeToPercentageLetter') {
                return await models.GradeToPercentageLetter.findAll({
                    where: {
                        user_id: user_id, app_id: app_id
                    }
                });
            }
        } catch {
        }

    },
    getCollegeName: async function (id) {
        try {
            return await models.College.findOne({ where: { id: id } });
        } catch {
        }
    },
    getCollegeName_unique: async function (user_id) {
        return await models.UserMarklist_Upload.findAll({
            where: {
                user_id: user_id, app_id: {
                    [Op.eq]: null
                }
            }, attributes: [
                [Sequelize.fn('DISTINCT', Sequelize.col('collegeId')), 'uniqueValues']
            ]
        });
    },
    getCollegeDetails_unique: async function (id) {
        return await models.College.findOne({ where: { id: id } })
    },
    updateDocuments: async function (data, type ,user_id) {
        var DATA = data[0]
        var pattern;
        var pattern_name;
        if (DATA.patteren.name) {
            pattern = DATA.patteren.value
            pattern_name = DATA.patteren.name
        } else {
            if (DATA.pattern.includes('Semester')) {
                pattern = 'Semester'
            } else {
                pattern = 'Annual'
            }
            pattern_name = DATA.pattern
        }
        try {
            if (type == 'marklist') {
                return await models.UserMarklist_Upload.create({ name: DATA.degree + '_' + DATA.faculty + '_' + pattern_name, education_type: DATA.degree, faculty: DATA.faculty, pattern: pattern, collegeId: DATA.collegeId, courseClgId: DATA.degree + '_' + DATA.faculty + '_' + pattern + '_' + DATA.collegeId  , user_id : user_id , file_name : DATA.file_name});
            }
        } catch {
        }

    },

    getResendRejectApplication: async (user_id, app_id, tracker, status) => {
        return models.Application.update({
            tracker: tracker ? tracker : null,
            status: status ? status : null,
        }, { where: { id: app_id, user_id: user_id } })
    },

    getUpdateUserNotes: async (notes_data, app_id, type) => {
        const data = {};
        if (type == "rejected") {
            data.rejectedNotes = notes_data
        } else {
            data.notes = notes_data
        }
        return models.Application.update(
            data
            , { where: { id: app_id } })
    },
 
    /**Activity Tracker function */
    activitylog: async (userId, appId, activity, data, req) => { 
            let ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
            const activityTracker = await models.Activitytracker.create({
                user_id: userId,
                activity: activity,
                data: data,
                application_id: appId,
                ip_address: ip,
                created_at: moment()
            })  
    },
    /**get count of Total and filtered Application Count */
    getApplicationCount: async (tracker, status, app_id, name, email, globalSearch) => {
        const whereUser = {};



        if (tracker) {
            whereUser.tracker = tracker;
        }
        if (status) {
            whereUser.status = status;
        }
        if (app_id != '' && email != '' && name != '') {
        } else {
            if (app_id) {
                whereUser.id = { [Op.like]: `%${app_id}%` };
            }
            if (name) {
                whereUser[Op.and] = [
                    Sequelize.literal(`CONCAT(User.name, ' ',User.surname) LIKE '%${name}%'`),
                ];
            }
            if (email) {
                whereUser[Op.and] = [
                    Sequelize.literal(`User.email LIKE '%${email}%'`),
                ];
            }
        }

        if (globalSearch) {
            whereUser[Op.or] = [
                Sequelize.literal(`CONCAT(User.name, ' ', User.surname, ' ',Application.id, ' ',User.email) LIKE '%${globalSearch}%'`),
            ];
        }
        // const count = await models.Application.count({
        //    include: [{
        //         model: models.User,
        //     },
        //     {
        //         model:models.Institution_details,
        //    }
        // ],
        //     where: whereUser
        // });

        const count = await models.Application.count({
            include: [{
                model: models.User,
            },
            {
                model: models.Institution_details,
            },
            {
                model: models.Applied_For_Details,
            }
            ],
            where: whereUser,
        });

        return count;
    },

    /**get totalapplication data through sequelize joins for backup */
    getApplicationData: async (tracker, status, app_id, name, email, globalSearch, limits, offsets) => {
        const whereUser = {};
        if (tracker) {
            whereUser.tracker = tracker;
        }
        if (status) {
            whereUser.status = status;
        }
        if (app_id != '' && email != '' && name != '') {
        } else {
            if (app_id) {
                whereUser.id = { [Op.like]: `%${app_id}%` };
            }
            if (name) {
                whereUser[Op.and] = [
                    Sequelize.literal(`CONCAT(User.name, ' ',User.surname) LIKE '%${name}%'`),
                ];
            }
            if (email) {
                whereUser[Op.and] = [
                    Sequelize.literal(`User.email LIKE '%${email}%'`),
                ];
            }
        }

        if (globalSearch) {
            whereUser[Op.or] = [
                Sequelize.literal(`CONCAT(User.name, ' ', User.surname, ' ',Application.id, ' ',User.email) LIKE '%${globalSearch}%'`),
            ];
        }
        const data = await models.Application.findAndCountAll({
            include: [{
                model: models.User,
                attributes: ['email', 'current_location', 'name', 'surname']
            },
            {
                model: models.Institution_details,
                attributes: ['email', 'OtherEmail', 'refno', 'type']
            },
            {
                model: models.Applied_For_Details,
                attributes: ['applied_for', 'educationalDetails', 'gradToPer', 'instructionalField', 'curriculum', 'CompetencyLetter', 'affiliation']
            }
            ],
            where: whereUser,
            attributes: ['id', 'tracker', 'status', 'user_id', 'collegeConfirmation', 'transcriptRequiredMail', 'approved_by', 'notes', 'created_at'],
            limit: 10,
            offset: 0,
            raw: true,
            order: [['created_at', 'DESC']]
        });

        return data;
    },
    /**get college data through sequelize joins for backup */
    check: async (appID) => {
        const result = await models.UserMarklist_Upload.findAll({
            include: [
                {
                    model: models.College,
                    attributes: []
                },
            ],
            where: {
                app_id: appID,
            },
            attributes: [
                [Sequelize.fn('GROUP_CONCAT', Sequelize.literal('DISTINCT College.name')), 'collegeNames']
            ],
            group: ['UserMarklist_Upload.app_id'],
        });
        console.log("result: ", result);
        return result;
    },

    /**get user data function to get user data by userId*/
    getUser: async (userId) => {
        const user = await models.User.findByPk(userId);
        return user;
    },
    /** get user Application data function to get userApplication data by appId*/
    getApplication: async (appId) => {
        const application = await models.Application.findByPk(appId);
        return application;
    },

    getWesData: async (appId) => {
        const wesData = await models.Wes_Records.findAll({ where: { appl_id: appId } });
        return wesData;
    },
    registerUser: async (formData, hashPassword) => {
        id = models.User.create({
            name: formData.firstName ? formData.firstName : null,
            surname: formData.lastName ? formData.lastName : null,
            email: formData.email ? formData.email : null,
            mobile: formData.mobile ? formData.mobile : null,
            mobile_country_code: formData.countryCode ? formData.countryCode : null,
            gender: formData.gender ? formData.gender : null,
            password: hashPassword ? hashPassword : null,
            user_status: 'active',
            user_type: 'student',
            is_otp_verified: 0,
            is_email_verified: 0
        })
        console.log('ididid', id)
    },
    getDocuments_checkstepper: async function (user_id, app_id, type, degree, faculty) {
        try {
            if (type == 'marklist') {
                return await models.UserMarklist_Upload.findAll({ where: { user_id: user_id, app_id: app_id } });
            }
            if (type == 'transcript' || type == 'extra') {
                return await models.User_Transcript.findAll({
                    where: {
                        user_id: user_id, app_id: app_id
                    }
                });
            }
            if (type == 'curriculum') {
                return await models.User_Curriculum.findAll({
                    where: {
                        user_id: user_id, app_id: app_id
                    }
                });
            }
            if (type == 'instructional' || type == 'affiliation') {
                return await models.letter_details.findAll({
                    where: {
                        user_id: user_id, app_id: app_id
                    }
                });
            }
            if (type == 'GradeToPercentageLetter') {
                return await models.GradeToPercentageLetter.findAll({
                    where: {
                        user_id: user_id, app_id: app_id
                    }
                });
            }
            if (type == 'competency') {
                return await models.competency_letter.findAll({
                    where: {
                        user_id: user_id, app_id: app_id
                    }
                });
            }
            if (type == 'Letterfor_NameChange') {
                return await models.Letterfor_NameChange.findAll({
                    where: {
                        user_id: user_id, app_id: app_id
                    }
                });
            }
        } catch {
        }

    },
    getCountry: async () => {
        return models.Country.findAll({})
    },

    getTranscriptsDetails: async (app_id, type) => {
        return models.User_Transcript.findAll({ where: { app_id: app_id, type: { [Op.like]: '%' + type + '%' } } })
    },

    getEmailDocsDetails: async (transcript_id, app_id, file_name) => {
        return models.Emailed_Docs.findAll({ where: { transcript_id: transcript_id, app_id: app_id, filename: file_name } })
    },

    getCreateEmailDocs: async (transcript_id, app_id, doc_name, fileName, category) => {
        return models.Emailed_Docs.create({
            transcript_id: transcript_id ? transcript_id : null,
            app_id: app_id ? app_id : null,
            doc_type: doc_name ? doc_name : null,
            filename: fileName ? fileName : null,
            category: category ? category : null,
        })
    },

    getApplicationsData: async (user_id) => {
        return models.Application.findAll({ where: { user_id: user_id } })
    },

    getErrataInMarksheets: async (user_id, app_id, lock) => {
        return models.UserMarklist_Upload.findAll({ where: { user_id: user_id, app_id: app_id, lock_transcript: lock } })
    },

    getErrataInTranscripts: async (user_id, app_id, lock) => {
        return models.User_Transcript.findAll({ where: { user_id: user_id, app_id: app_id, lock_transcript: lock } })
    },

    getErrataInInstructionalAndAffiliation: async (user_id, app_id, lock, type) => {
        return models.letter_details.findAll({ where: { user_id: user_id, app_id: app_id, lock_transcript: lock, type: { [Op.like]: '%' + type + '%' } } })
    },

    getErrataInCurriculums: async (user_id, app_id, lock) => {
        return models.User_Curriculum.findAll({ where: { user_id: user_id, app_id: app_id, lock_transcript: lock } })
    },

    getErrataInGradtoper: async (user_id, app_id, lock) => {
        return models.GradeToPercentageLetter.findAll({ where: { user_id: user_id, app_id: app_id, lock_transcript: lock } })
    },

    getErrataInCompetency: async (user_id, app_id, lock) => {
        return models.competency_letter.findAll({ where: { user_id: user_id, app_id: app_id, lock_transcript: lock } })
    },

    getErrataInLetterForNameChange: async (user_id, app_id, lock) => {
        return models.Letterfor_NameChange.findAll({ where: { user_id: user_id, app_id: app_id, lock_transcript: lock } })
    },

    getErrataInNameChangeProof: async (user_id, app_id, lock, type) => {
        return models.User_Transcript.findAll({ where: { user_id: user_id, app_id: app_id, lock_transcript: lock, education_type: { [Op.like]: '%' + type + '%' } } })
    },

    getUserData: async (user_id) => {
        return models.User.findOne({ where: { user_id: user_id } })
    },

    getOrderDetails: async (user_id, app_id) => {
        return models.Orders.findOne({ where: { user_id: user_id, application_id: app_id } })
    },

    getTrasactionDetails: async (order_id) => {
        return models.Transaction.findOne({ where: { order_id: order_id } })
    },

    getPaymentIssueDetails: async (issue_id) => {
        return models.paymenterror_details.findOne({ where: { id: issue_id } })
    },

    getUpdatePaymentNotes: async (notes_data, tracker, issue_id) => {
        return models.paymenterror_details.update({
            admin_notes: notes_data ? notes_data : null,
            tracker: tracker ? tracker : null,
        }, { where: { id: issue_id } })
    },

    getStudentCount: async (name, email, user_type, globalSearch) => {
        const user = {}

        if (name) {
            console.log('nnnnnnnnnnnnnnnn');
            user[Op.and] = [
                Sequelize.literal(`CONCAT(User.name, ' ',User.surname) LIKE '%${name}%'`),
            ];
        }

        if (email) {
            console.log('eeeeeeeeeeeeeeeee');
            user[Op.and] = [
                Sequelize.literal(`CONCAT(User.email, ' ') LIKE '%${email}%'`),
            ];
        }

        if (user_type) {
            console.log('tttttttttttttt');
            user.user_type = user_type;
        }

        if (globalSearch) {
            console.log('ggggggggggggg');
            user[Op.or] = [
                Sequelize.literal(`CONCAT(User.name, '', User.surname, '', User.email, '') LIKE '%${globalSearch}%'`),
            ];
        }

        console.log('$$$$$$$$$$$$$$$$$$$$$$',user);

        const count = models.User.count({
            include: [{
                model: models.Applied_For_Details,
            }],
            where: user,
        });
        return count;
    },
    /**getAppliedDetails function to get the data of each table with userid and type */
    getAppliedDetails: async (userId, tableName, type) => {
        try {
            const whereUser = {
                user_id: userId
            };

            if (type !== '') {
                whereUser.type = type;
            }
            const table = models[tableName];
            const appliedDetails = await table.findOne({
                where: whereUser
            });

            return appliedDetails;
        } catch (error) {
            console.error("Error in getAppliedDetails:", error);
            throw error;
        }
    },
    /**getEmailActivity function to get the data of emailActivitytracker */
    getEmailActivity: async (globalSearch, limits, offsets) => {
        const whereEmail = {};
        if (globalSearch) {
            whereEmail[Op.or] = [
                Sequelize.literal(`CONCAT(email, ' ', subject, ' ',status) LIKE '%${globalSearch}%'`)
            ]
        }
        // Convert limits and offsets to numbers
        const parsedLimits = parseInt(limits, 10);
        const parsedOffsets = parseInt(offsets, 10);

        const emailActivity = await models.EmailActivityTracker.findAll({
            where: whereEmail,
            limit: parsedLimits,
            order: [['created_at', 'DESC']],
            offset: parsedOffsets
        })
        return emailActivity;
    },
    /**getEmailAtivityCount to get count of emailactivitytracker data */
    getEmailActivityCount: async (globalSearch) => {
        const whereEmail = {};
        if (globalSearch) {
            whereEmail[Op.or] = [
                Sequelize.literal(`CONCAT(email, ' ', subject, ' ',status) LIKE '%${globalSearch}%'`)
            ]
        }
        const emailActivityCount = await models.EmailActivityTracker.count({
            where: whereEmail,
        })
        return emailActivityCount;
    },
};