var path = require('path');
var root_path = path.dirname(require.main.filename);
var models = require(root_path + '/models');
const express = require('express');
const router = express.Router();
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
const upload = multer({ dest: 'public/upload/marklist' });
const tesseract = require("node-tesseract-ocr");
const middlewares = require('../middleware');
var self_PDF = require('./self_letter');
const config = {
	lang: "eng",
	oem: 1,
	psm: 3
}
/* Editor : Prathmesh Pawar
Route : educationalDetails - check email and password and return token and access to proceed ahead to student.
Paramater : email and password of student */
router.post('/login', async (req, res) => {
	console.log('/login');

	// Correct email and password stored in the backend
	email = req.body.email;
	password = req.body.password;
	var user = {};
	var roles = '';

	var hashPassword = functions.generateHashPassword(password);

	var getEmailDetails = await functions.getUserEmailDetails(email, hashPassword);

	if (getEmailDetails) {
		if (getEmailDetails.is_otp_verified == true || getEmailDetails.is_otp_verified == 1 || getEmailDetails.is_email_verified) {
			var getPasswordDetails = await functions.getUserEmailDetails(email, hashPassword);

			if (getPasswordDetails) {
				if (getEmailDetails.email == email && getEmailDetails.password == hashPassword) {
					if (getEmailDetails.is_otp_verified == true || getEmailDetails.is_email_verified == true) {
						if (getEmailDetails.user_type == 'student') {
						} else {
							var getRoleDetails = await functions.getRoleDetails(getEmailDetails.id);

							if (getRoleDetails) {
								if (getRoleDetails.adminManagement == true) {
									roles += 'adminManagement'
								} if (getRoleDetails.roleManagement == true) {
									roles += 'roleManagement'
								} if (getRoleDetails.studentManagement == true) {
									roles += 'studentManagement'
								} if (getRoleDetails.adminEmailTracker == true) {
									roles += 'adminEmailTracker'
								} if (getRoleDetails.adminTotal == true) {
									roles += 'adminTotal'
								} if (getRoleDetails.adminPending == true) {
									roles += 'adminPending'
								} if (getRoleDetails.adminVerified == true) {
									roles += 'adminVerified'
								} if (getRoleDetails.adminSigned == true) {
									roles += 'adminSigned'
								} if (getRoleDetails.adminPayment == true) {
									roles += 'adminPayment'
								} if (getRoleDetails.adminDashboard == true) {
									roles += 'adminDashboard'
								} if (getRoleDetails.adminReport == true) {
									roles += 'adminReport'
								} if (getRoleDetails.adminhelp == true) {
									roles += 'adminhelp'
								} if (getRoleDetails.adminemailed == true) {
									roles += 'adminemailed'
								} if (getRoleDetails.collegeManagement == true) {
									roles += 'collegeManagement'
								} if (getRoleDetails.dashboard == true) {
									roles += 'dashboard'
								} if (getRoleDetails.adminWesApp == true) {
									roles += 'adminWesApp'
								} if (getRoleDetails.adminActivityTracker == true) {
									roles += 'adminActivityTracker'
								} if (getRoleDetails.adminPaymentIssue == true) {
									roles += 'adminPaymentIssue'
								}else { }

								console.log('roles', roles);

							}
						}
						user.user_id = getEmailDetails.id;
						user.user_name = getEmailDetails.name;
						user.user_surname = getEmailDetails.surname;
						user.user_email = getEmailDetails.email;
						user.user_mobile = getEmailDetails.mobile;
						user.user_student_category = getEmailDetails.student_category;
						user.user_address = (getEmailDetails.address1) ? getEmailDetails.address1 : null;
						user.user_phone_number = getEmailDetails.mobile;
						user.profileCompleteness = getEmailDetails.profile_completeness;
						user.theme = getEmailDetails.theme;
						user.country_birth = getEmailDetails.country_birth;
						user.user_type = getEmailDetails.user_type;
						user.login_count = getEmailDetails.login_count;
						user.source = getEmailDetails.source;
						user.password = getEmailDetails.password;
						user.current_location = getEmailDetails.current_location;
						user.mobile_country_code = getEmailDetails.mobile_country_code;
						user.roles = roles;
						return res.json({
							status: 200,
							data: {
								message: 'Successfully logged in!',
								token: functions.createAccessToken(user),
								user: user,
							}
						});
					}
				}
			} else {
				res.json({
					status: 400,
					message: 'Your password does not exist.'
				})
			}
		} else {
			res.json({
				status: 400,
				message: 'Please verify your account.'
			})
		}
	} else {
		console.log("KKKKK");
		res.json({
			status: 400,
			message: email + ' does not exist in our system.'
		})
	}
})

router.post('/register', async (req, res) => {
	var values = req.query.values;
	var password = values.password;
	var hashPassword = functions.generateHashPassword(password);
	register = await functions.registerUser(values, hashPassword);
	if (register) {
		let data = "Student registered with email id " + values.email
		let activity = "Registration";
		// functions.activitylog(userId, appId, activity, data, req);
	}
})


/* Author : Prathmesh Pawar
Route : educationalDetails - create & update educational details of step 1.
Paramater : formdata and user_id of student */
router.post('/educationalDetails', middlewares.getUserInfo, async (req, res) => {
	console.log("/educationalDetails");

	var user_id = req.User.id;
	var degree = req.body.degree;
	app_id = req.body.app_id;
	if (app_id == 'null' || app_id == null || app_id == undefined || app_id == 'undefined' || app_id == '') {
		app_id = null
	} else {
		app_id = req.query.app_id
	}

	var applied_for_details = await functions.getAppliedForDetails(user_id, app_id);
	if (applied_for_details) {
		var updatedAppliedDetails = await functions.getUpdatedEducationalDetails(user_id, req.body.formdata, degree);
		if (updatedAppliedDetails) {
			res.json({
				status: 200,
				message: "updated"
			})
		}
	}
	else {
		var createdAppliedDetails = await functions.getCreateEducationalDetails(user_id, req.body.formdata, degree);
		if (createdAppliedDetails) {
			res.json({
				status: 200,
				message: "added"
			})
		}
	}
})

/* Author : Prathmesh Pawar
Route : getPurposeList - get list of purpose for dropdown list name in step 3 and show inputs on addInstitutionDialog box as per table boolean values.
Paramater : purposeList and purpose_name of student */
router.get('/getPurposeList', middlewares.getUserInfo,async (req, res) => {
	console.log("/getPurposeList");

	var purpose_name = req.query.purpose_name;
	if (purpose_name) {
		var purposeList = await functions.getPurposeListByPurposeName(purpose_name);
	} else {
		var purposeList = await functions.getPurposeList();
	}

	if (purposeList) {
		res.json({
			status: 200,
			data: purposeList
		});
	} else {
		res.json({
			status: 400
		});
	}
})

/* Author : Prathmesh Pawar
Route : updateAllInstitute - create & update purpose data of student side.
Paramater : type, refNo, wesEmail, wesName, wesSurname, universityCompanyName, name, countryName, contactPersonName, contactNo, emails, user_type, user_id, app_id, institute_id and function_type of student */
router.post('/updateAllInstitute',middlewares.getUserInfo, async (req, res) => {
	console.log('/updateAllInstitute');

	var formData = req.body.formData;
	var email = req.body.formData.emails;
	var emailArr;
	var anotherEmailArr;
	var anotherEmail;
	var user_id = req.User.id;
	var amount;
	var app_id = req.body.app_id;
	var type = req.body.type;
	var institute_id = req.body.institute_id;
	var function_type = req.body.function_type;
	var admin_id = req.body.admin_id;
	var user_email = req.body.user_email;
	var user_type = req.body.user_type;

	var applied = await functions.getEducationalDetailsCount(user_id, app_id);

	const counts = Object.values(JSON.parse(JSON.stringify(applied))).filter((value) => {
		return value == true;
	});

	var count = counts.length;

	var user = await functions.getUserDetails(user_id);

	if (user[0].current_location == "WITHIN") {
		amount = 536 * count;
	} else if (user[0].current_location == "OUTSIDE") {
		amount = 8308 * count;
	}

	if (email) {
		emailArr = email.split(',');
		if (emailArr.length > 1) {
			anotherEmailArr = emailArr.shift();
			anotherEmail = emailArr.toString();
		} else {
			anotherEmailArr = email;
			anotherEmail = null;
		}
	} else {
		emailArr = null;
		anotherEmailArr = null;
		anotherEmail = null;
	}

	//create purpose data
	if (function_type == 'add') {
		var createInstitute = await functions.getCreateInstitution(formData, emailArr, user_id, type, app_id, anotherEmailArr, anotherEmail);

		if (createInstitute) {
			var data = type + ' Created by ' + user_email;
			var activity = "Create purpose";

			functions.getCreateActivityTracker(user_id, app_id, activity, data);

			res.json({
				status: 200,
				message: type + " data inserted successfully!"
			})
		} else {
			res.json({
				status: 400,
				message: type + " data failed to insert!"
			})
		}
	} else {//update purpose data
		var instituteDetails = await functions.getInstituteData(institute_id);

		if (instituteDetails) {
			var updateInstitute = await functions.getUpdateInstitution(formData, emailArr, user_id, type, app_id, anotherEmailArr, anotherEmail, institute_id);

			if (updateInstitute == true) {
				if (user_type == 'student') {
					var data = type + ' updated by ' + user_email;
					var activity = "Update purpose";

					functions.getCreateActivityTracker(user_id, app_id, activity, data);
				} else {
					var data = type + ' updated by ' + user_email;
					var activity = "Update purpose";

					functions.getCreateActivityTracker(user_id, app_id, activity, data);
				}

				res.json({
					status: 200,
					message: type + " data updated Successfully!"
				})
			} else {
				res.json({
					status: 400,
					message: type + " data failed to update!"
				})
			}
		} else {
			res.json({
				status: 400,
				message: "Something went wrong!"
			})
		}
	}
})

/* Author : Prathmesh Pawar
Route : deleteInstituteHrd - delete both purpose records all institute as well as hrd.
Paramater : institute_id, purpose_name and user_id of student */
router.post('/deleteInstituteHrd', middlewares.getUserInfo, async (req, res) => {
	console.log('/deleteInstitute');

	var institute_id = req.body.institute_id;
	var purpose_name = req.body.purpose_name;
	var user_id = req.User.id;

	if (purpose_name == 'HRD') {
		var deleteHrd = await functions.getDeleteHrd(institute_id);

		if (deleteHrd) {
			var checkHrd = await functions.checkHrdDetails(user_id);

			if (checkHrd.length == 0) {
				var deleteHrdInstitute = await functions.getDeleteHrdInstitute(user_id, purpose_name);

				if (deleteHrdInstitute) {
					res.json({
						status: 200,
						message: purpose_name + " data deleted successfully!"
					})
				} else {
					res.json({
						status: 400,
						message: purpose_name + " data failed to delete!"
					})
				}
			} else {
				res.json({
					status: 200,
					message: purpose_name + " data deleted successfully!"
				})
			}
		} else {
			res.json({
				status: 400,
				message: purpose_name + " data failed to delete!"
			})
		}
	} else {
		var deleteInstitute = await functions.getDeleteInstitution(institute_id);
		console.log('deleteInstitute', deleteInstitute);
		console.log('deleteInstitute', deleteInstitute.length);

		if (deleteInstitute) {
			res.json({
				status: 200,
				message: purpose_name + " data deleted successfully!"
			})
		} else {
			res.json({
				status: 400,
				message: purpose_name + " data failed to delete!"
			})
		}
	}
})


/* Author : Prathmesh Pawar
Route : getInstituteData - get all institute data to show on purpose page and get single institute data for patchvales while editing.
Paramater : app_id, purpose_name, user_type, institute_id and user_id of student */
router.get('/getInstituteData',middlewares.getUserInfo, async (req, res) => {
	console.log('/getInstituteData');

	var purpose_name = req.query.purpose_name;
	var app_id = req.query.app_id;
	if (app_id == 'null' || app_id == null || app_id == undefined || app_id == '') {
		app_id = null
	} else {
		app_id = req.query.app_id
	}
	var user_id = req.User.id;
	var institute_id = req.query.institute_id;
	var status;
	var data = [];

	//get single institute data
	if (purpose_name) {
		var getInstituteData = await functions.getInstituteDataSingle(institute_id, purpose_name);

		if (getInstituteData) {
			status = 'Not Applied';

			if (getInstituteData.length > 0) {
				getInstituteData.forEach(institute => {
					data.push({
						id: institute.id,
						university_name: institute.university_name,
						email: institute.email,
						country_name: institute.country_name,
						contact_number: institute.contact_number,
						status: status,
						contact_person: institute.contact_person,
						type: institute.type,
						reference_no: institute.refno,
						emailAsWes: institute.emailAsWes,
						nameaswes: institute.nameaswes,
						lastnameaswes: institute.lastnameaswes,
						name: institute.name,
						user_id: institute.user_id,
					})
				});

				if (data.length == getInstituteData.length) {
					res.json({
						status: 200,
						data: data
					});
				}
			} else {
				res.json({
					status: 400
				});
			}
		}
	} else {
		console.log(' inside else')
		//get all institute data
		var getInstituteData = await functions.getInstituteDataAll(user_id, app_id);
		if (getInstituteData.length > 0) {
			status = 'Not Applied';

			if (getInstituteData.length > 0) {
				getInstituteData.forEach(institute => {
					data.push({
						id: institute.id,
						university_name: institute.university_name,
						email: institute.email,
						country_name: institute.country_name,
						contact_number: institute.contact_number,
						status: status,
						contact_person: institute.contact_person,
						type: institute.type,
						reference_no: institute.refno,
						emailAsWes: institute.emailAsWes,
						nameaswes: institute.nameaswes,
						lastnameaswes: institute.lastnameaswes,
						name: institute.name,
						user_id: institute.user_id,
						other_email: institute.otherEmail,
					})
				});

				if (data.length == getInstituteData.length) {
					res.json({
						status: 200,
						data: data
					});
				}
			} else {
				res.json({
					status: 400
				});
			}
		} else {
			console.log(' ins elseeee')
			res.json({
				status: 400
			});
		}
	}


})

/* Author : Prathmesh Pawar
Route : getAppliedDetails - get students details that is applied for which degree.
Paramater : app_id, user_type and user_id of student */
router.get('/getAppliedDetails',middlewares.getUserInfo, async (req, res) => {
	console.log('/getAppliedDetails');

	var user_id = req.User.id;
	var app_id = req.query.app_id;
	var Masters;
	var Bachelors;
	var Phd;
	var data = [];

	var getApplied = await functions.getAppliedDetails(user_id, null);

	getApplied.forEach(function (type) {
		if (type.education_type.includes('Masters')) {
			Masters = true
		}
		if (type.education_type.includes('Bachelors')) {
			Bachelors = true
		}
		if (type.education_type.includes('Phd')) {
			Phd = true
		}
	})

	data.push({
		Bachelors: Bachelors,
		Masters: Masters,
		Phd: Phd,
	})

	if (data.length > 0) {
		res.json({
			status: 200,
			data: data
		});
	} else {
		res.json({
			status: 400
		});
	}
})

/* Author : Prathmesh Pawar
Route : getHrdInfo - get students details for pre-filled name & course_name & annual semester pattern as well as for diierent courses.
Paramater : degree_type, faculty_type and user_id of student */
router.get('/getHrdInfo',middlewares.getUserInfo, async (req, res) => {
	console.log('/getHrdInfo');

	var user_id = req.User.id;
	var degree_type = req.query.degree_type;
	var data = [];
	let encounteredFaculties = {};
	var faculty_types = req.query.faculty_type;
	var app_id = req.query.app_id;
	if (app_id == 'null') {
		app_id = null
	} else {
		app_id = req.query.app_id
	}

	var user = await functions.getUserDetails(user_id);

	if (faculty_types) {
		var faculty_type = faculty_types.split(' ').pop();
		var getUserMarklist_Upload = await functions.getUserMarklistUploadDetailsDifferent(user_id, degree_type, faculty_type, app_id);
	} else {
		var getUserMarklist_Upload = await functions.getUserMarklistUploadDetailsSame(user_id, degree_type, app_id);
	}
	getUserMarklist_Upload.forEach((item) => {
		let faculty = item.faculty;

		if (!encounteredFaculties[faculty]) {
			encounteredFaculties[faculty] = true;
			data.push({
				faculty: item.faculty,
				colleges: item.collegeId,
				pattern: item.patteren,
				type: item.education_type + ' of ' + item.faculty,
				fullName: user[0].name + ' ' + user[0].surname,
				degree: degree_type,
			});
		}
	});

	if (data.length > 0) {
		res.json({
			status: 200,
			data: data
		});
	} else {
		res.json({
			status: 400,
		});
	}
})

/* Author : Prathmesh Pawar
Route : updateAllHrd - create & update hrd purpose data of student side.
Paramater : degree_type, faculty_type, formData, function_type, secondlastSem, lastSem, purpose_name, hrd_id and user_id of student */
router.post('/updateAllHrd',middlewares.getUserInfo, async (req, res) => {
	console.log('/updateAllHrd');

	var formData = req.body.formData;
	var user_id = req.User.id;
	var function_type = req.body.function_type;
	var secondlastSem = req.body.secondlastSem;
	var degree_type = req.body.degree_type;
	var lastSem = req.body.lastSem;
	var purpose_name = req.body.purpose_name;
	var hrd_id = req.body.hrd_id;
	var emailArr;
	var anotherEmailArr;
	var anotherEmail;
	var app_id = req.body.app_id;
	if (app_id == 'null' || app_id == null || app_id == undefined || app_id == '') {
		app_id = null
	} else {
		app_id = req.query.app_id
	}
	var user_type = req.body.user_type;
	var admin_id = req.body.admin_id;
	var admin_email = req.body.admin_email;

	var applied = await functions.getEducationalDetailsCount(user_id, app_id);

	const counts = Object.values(JSON.parse(JSON.stringify(applied))).filter((value) => {
		return value == true;
	});

	var count = counts.length;

	var user = await functions.getUserDetails(user_id);

	if (user[0].current_location == "WITHIN") {
		amount = 536 * count;
	} else if (user[0].current_location == "OUTSIDE") {
		amount = 8308 * count;
	}

	if (formData.email) {
		emailArr = formData.email.split(',');
		if (emailArr.length > 1) {
			anotherEmailArr = emailArr.shift();
			console.log('11111', anotherEmailArr);
			anotherEmail = emailArr.toString();
			console.log('22222', anotherEmail);
		} else {
			anotherEmailArr = formData.email;
			anotherEmail = null;
		}
	} else {
		emailArr = null;
		anotherEmailArr = null;
		anotherEmail = null;
	}

	if (function_type == 'add') {
		var createHrd = await functions.getCreateHrd(user_id, formData, degree_type, secondlastSem, lastSem, app_id);

		if (createHrd) {
			var checkInstitute = await functions.checkInstitutionDetails(user_id, app_id, purpose_name);

			if (checkInstitute.length > 0) {
				res.json({
					status: 200,
					message: purpose_name + " data inserted successfully!",
				})
			} else {
				var createInstitute = await functions.getCreateHrdInstitute(user_id, purpose_name, emailArr, anotherEmailArr, anotherEmail, app_id);

				if (createInstitute) {
					var createActivityTrackerAdd = await functions.getCreateActivityTrackerAdd(user_id, admin_email, formData.course_name, app_id);

					res.json({
						status: 200,
						message: purpose_name + " data inserted successfully!",
					})
				} else {
					res.json({
						status: 400,
						message: purpose_name + " data failed to insert!",
					})
				}
			}
		} else {
			res.json({
				status: 400,
				message: purpose_name + " data failed to insert!",
			})
		}
	} else {
		var updateHrd = await functions.getUpdateHrd(user_id, formData, degree_type, secondlastSem, lastSem, hrd_id, app_id);
		console.log('updateHrd', updateHrd);

		if (updateHrd == true) {
			if (user_type == 'student') {
				var createActivityTrackerUpdate = await functions.getCreateActivityTrackerUpdate(user_id, admin_email, formData.course_name, app_id);
			} else {
				var createActivityTrackerUpdate = await functions.getCreateActivityTrackerUpdate(admin_id, admin_email, formData.course_name, app_id);
			}

			res.json({
				status: 200,
				message: purpose_name + " data updated successfully!",
			})
		} else {
			res.json({
				status: 400,
				message: purpose_name + " data failed to update!",
			})
		}
	}
})

/* Author : Prathmesh Pawar
Route : getHrdData - get all hrd data to show on purpose page and get single hrd data for patchvales while editing.
Paramater : purpose_name, hrd_id and user_id of student */
router.get('/getHrdData',middlewares.getUserInfo, async (req, res) => {
	console.log('/getHrdData');

	var user_id = req.User.id;
	var hrd_id = req.query.hrd_id;
	var purpose_name = req.query.purpose_name;
	var app_id = req.query.app_id;
	if (app_id == 'null' || app_id == null || app_id == undefined || app_id == '') {
		app_id = null
	} else {
		app_id = req.query.app_id
	}

	if (purpose_name) {
		var hrdDetails = await functions.getHrdDetailsSingle(user_id, app_id, hrd_id);

		if (hrdDetails.length > 0) {
			res.json({
				status: 200,
				data: hrdDetails,
			})
		} else {
			res.json({
				status: 400
			})
		}
	} else {
		var hrdDetails = await functions.getHrdDetailsAll(user_id, app_id);

		if (hrdDetails.length > 0) {
			res.json({
				status: 200,
				data: hrdDetails,
			})
		} else {
			res.json({
				status: 400
			})
		}
	}
})

/* Author : Prathmesh Pawar
Route : preViewApplication - get all data to show users all details like educational,marksheets n all on preview page.
Paramater : user_id of student */
router.get('/preViewApplication',middlewares.getUserInfo, async (req, res) => {
	console.log('/preViewApplication');

	var user_id = req.User.id;
	let encounteredColleges = {};
	var educationalDetails = [];
	var collegeData = [];
	var marksheetsData = [];
	var transcriptsData = [];
	var curriculumData = [];
	var gradtoperData = [];
	var competencyData = [];
	var letterfornamechangeData = [];
	var instructionalData = [];
	var affiliationData = [];
	var preViewApplication = [];
	var extension;

	var app_id = req.body.app_id;
	if (app_id == 'null' || app_id == null || app_id == undefined || app_id == '') {
		app_id = null
	} else {
		app_id = req.query.app_id
	}

	//educational details
	var applied_for_details = await functions.getAppliedForDetails(user_id, app_id);

	educationalDetails.push({
		educationalDetails: applied_for_details.educationalDetails,
		instructionalDetails: applied_for_details.instructionalField,
		curriculumDetails: applied_for_details.curriculum,
		gradtoperDetails: applied_for_details.gradToPer,
		affiliationDetails: applied_for_details.affiliation,
		competencyletterDetails: applied_for_details.CompetencyLetter,
		letterfornamechangeDetails: applied_for_details.LetterforNameChange,
	})

	//college data
	var getApplied = await functions.getAppliedDetails(user_id, app_id);

	getApplied.forEach(async function (userDetails) {
		let collegeId = userDetails.collegeId;

		if (!encounteredColleges[collegeId]) {
			encounteredColleges[collegeId] = true;

			var collegeDetails = await functions.getCollegeDetails(collegeId);

			collegeData.push({
				name: collegeDetails.name,
				year: userDetails.education_type + ' of ' + userDetails.faculty,
				degree: userDetails.education_type,
			})
		}
	})

	//marksheets
	getApplied.forEach(function (marksheets) {
		extension = marksheets.file_name.split('.').pop();

		marksheetsData.push({
			name: marksheets.name,
			filePath: constant.BASE_URL + "/api/upload/marklist/" + user_id + "/" + marksheets.file_name,
			extension: extension,
		})
	})

	//transcript
	if (applied_for_details.educationalDetails == true) {
		var getTranscripts = await functions.getUserTrascripts(user_id, app_id);

		getTranscripts.forEach(function (transcripts) {
			extension = transcripts.file_name.split('.').pop();

			transcriptsData.push({
				name: transcripts.name,
				filePath: constant.BASE_URL + "/api/upload/transcript/" + user_id + "/" + transcripts.file_name,
				extension: extension,
			})
		})
	}

	//instructional
	if (applied_for_details.instructionalField == true) {
		var getInstructional = await functions.getUserInstructionalAndAffiliation(user_id, app_id, 'instructional');

		getInstructional.forEach(function (instructional) {

			instructionalData.push({
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
		var getCurriculum = await functions.getUserCurriculum(user_id, app_id);

		getCurriculum.forEach(function (curriculum) {
			extension = curriculum.file_name.split('.').pop();

			curriculumData.push({
				name: curriculum.name,
				filePath: constant.BASE_URL + "/api/upload/curriculum/" + user_id + "/" + curriculum.file_name,
				extension: extension,
			})
		})
	}

	//gradetoper
	if (applied_for_details.gradToPer == true) {
		var getGradtoper = await functions.getUserGradtoper(user_id, app_id);

		getGradtoper.forEach(function (gradtoper) {
			extension = gradtoper.file_name.split('.').pop();

			gradtoperData.push({
				name: gradtoper.name,
				filePath: constant.BASE_URL + "/api/upload/gradeToPercentLetter/" + user_id + "/" + gradtoper.file_name,
				extension: extension,
			})
		})
	}

	//affiliation
	if (applied_for_details.affiliation == true) {
		var getAffiliation = await functions.getUserInstructionalAndAffiliation(user_id, app_id, 'affiliation');

		getAffiliation.forEach(function (affiliation) {

			affiliationData.push({
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
		var getCompetency = await functions.getUserCompetency(user_id, app_id);

		getCompetency.forEach(function (competency) {
			extension = competency.file_name.split('.').pop();

			competencyData.push({
				name: competency.name,
				filePath: constant.BASE_URL + "/api/upload/CompetencyLetter/" + user_id + "/" + competency.file_name,
				extension: extension,
			})
		})
	}

	//letter for name change
	if (applied_for_details.LetterforNameChange == true) {
		var getLetterfornamechange = await functions.getUserLetterfornamechange(user_id, app_id);

		extension = getLetterfornamechange.file_name.split('.').pop();

		letterfornamechangeData.push({
			name: getLetterfornamechange.name,
			filePath: constant.BASE_URL + "/api/upload/NameChangeLetter/" + user_id + "/" + getLetterfornamechange.file_name,
			extension: extension,
			firstnameaspermarksheet: getLetterfornamechange.firstnameaspermarksheet,
			fathersnameaspermarksheet: getLetterfornamechange.fathersnameaspermarksheet,
			mothersnameaspermarksheet: getLetterfornamechange.mothersnameaspermarksheet,
			lastnameaspermarksheet: getLetterfornamechange.lastnameaspermarksheet,
			firstnameasperpassport: getLetterfornamechange.firstnameasperpassport,
			fathersnameasperpassport: getLetterfornamechange.fathersnameasperpassport,
			lastnameasperpassport: getLetterfornamechange.lastnameasperpassport,
		})
	}

	preViewApplication.push({
		collegeData: collegeData,
		educationalDetails: educationalDetails,
		marksheetsData: marksheetsData,
		transcriptsData: transcriptsData,
		curriculumData: curriculumData,
		gradtoperData: gradtoperData,
		competencyData: competencyData,
		letterfornamechangeData: letterfornamechangeData,
		instructionalData: instructionalData,
		affiliationData: affiliationData,
	})

	if (preViewApplication.length > 0) {
		res.json({
			status: 200,
			data: preViewApplication
		});
	} else {
		res.json({
			status: 400,
		});
	}
})

/** Get Routes */

/**
 * Fetched the Document of curriculum Uploaded by user by its UserId.
 * @query {Integer} userId - The userId of the Uploaded curriculum Document to fetch the Data of user.
 */
router.get('/getuploadedCurriculum',middlewares.getUserInfo, async (req, res) => {
	const userId = req.User.id;
	const curriculumInfos = [];
	let counts = 0
	const curriculums = await models.User_Curriculum.findAll({
		where: {
			user_id: userId,
		}
	})
	if (curriculums) {
		if (curriculums.length > 0) {
			for (const curriculum of curriculums) {
				filename = constant.BASE_URL + "/upload/curriculum/" + userId + "/" + curriculum.file_name
				TranscriptId = curriculum.id,
					transcriptNamee = curriculum.name
				const college = await models.College.findOne({
					where: {
						id: curriculum.collegeId
					}
				})
				if (college) {
					curriculumInfos.push({
						user_id: curriculum.user_id,
						collegeId: curriculum.collegeId,
						collegeName: college.name,
						fileName: filename ? filename : '',
						curriculumId: curriculum.id,
						curriculum_name: curriculum.file_name ? curriculum.file_name : '',
						lock_transcript: curriculum.lock_transcript
					})
					counts++
					if (curriculumInfos.length === counts) {
						res.send({
							status: 200,
							data: curriculumInfos
						})
					}
				}
			}
		} else {
			res.json({
				status: 400,
				data: curriculumInfos
			})
		}
	}
})

/**
 * Fetched the Data of ExtraDocuments uploaded by User by its userId.
 * @query {Integer} userId - The userId of the Uploaded ExtraDocument to fetch the Data of user.
 */
router.get('/getExtraDocuments',middlewares.getUserInfo, async (req, res) => {
	try {
		const data = [];
		const userId = req.User.id;
		const userExtraDoc = await models.User_Transcript.findAll({
			where: {
				user_id: userId,
				type: "extraDocument"
			},
			order: [
				['name', 'ASC']
			]
		})
		if (userExtraDoc) {
			if (userExtraDoc.length > 0) {
				userExtraDoc.forEach(userDoc => {
					data.push({
						doc_id: (userDoc) ? (userDoc.id) : null,
						name: (userDoc) ? (userDoc.name) : null,
						type: (userDoc) ? (userDoc.file_name).split('.').pop() : null,
						filename: (userDoc) ? (constant.BASE_URL + "/upload/transcript/" + userId + "/" + userDoc.file_name) : null,
						filePath: (userDoc) ? constant.FILE_LOCATION + "public/upload/transcript/" + userId + "/" + userDoc.file_name : null,
						lock_transcript: (userDoc) ? (userDoc.lock_transcript) : false,
						upload_step: (userDoc) ? (userDoc.upload_step) : 'default',
						app_id: (userDoc) ? (userDoc.app_id) : null,
					})
				})
				return res.json({
					status: 200,
					data: data
				})
			} else {
				return res.json({
					status: 200,
					data: null
				})
			}
		}
	} catch (error) {
		console.error("Error in /getExtraDocuments", error);
		return res.status(500).json({
			status: 500,
			message: "Internal Server Error"
		});
	}
})

/**
 * Fetched the College List for user to display in Dropdown.
 */
router.get('/getCollegeList', async (req, res) => {

	const collegeList = await models.College.findAll({})
	if (collegeList) {
		res.json({
			status: 200,
			data: collegeList
		});
	}
})
/**
 * Fetch Details such as college course pattern and upload documents.
 */
router.post('/ScanData',middlewares.getUserInfo, async (req, res) => {
	try {
		var user_id = req.User.id;
		var app_id = req.query.app_id;
		var type = req.query.value;
		// var education_type = req.query.education_type;
		// var collegeid = req.query.collegeid;
		// var pattern = req.query.pattern;
		// var faculty = req.query.faculty;
		var dir = constant.FILE_LOCATION + "public/upload/" + type + '/' + user_id;
		var image;
		var coursedata = [];
		var collegedata = [];
		if (!fs.existsSync(dir)) {
			fs.mkdirSync(dir);
		}
		var storage = multer.diskStorage({
			destination: function (req, file, callback) {
				callback(null, constant.FILE_LOCATION + "public/upload/" + type + '/' + user_id);
			},
			filename: function (req, file, callback) {
				var extension = path.extname(file.originalname)
				var randomString = functions.generateRandomString(10, 'alphabetic');
				var newFileName = randomString.concat(extension);
				image = newFileName;
				callback(null, newFileName);
			}
		});

		var upload = multer({
			storage: storage,
		}).single('file');
		upload(req, res, async function (err, data) {
			imageLocationToCallClient = image;
			var alldata = [];
			// if (type == 'marklist') {
			// 	var data = tesseract.recognize(constant.FILE_LOCATION + 'public/upload/' + type + '/' + user_id + '/' + image, config).then(async (text_data) => {
			// 		var getCollege = await functions.getCollegeList();
			// 		var getCourse = await functions.getProgramList();
			// 		var getApplied = await functions.getAppliedFor(user_id, '');
			// 		var str = text_data.replace(/(\r\n|\n|\r)/gm, "");
			// 		var text = str.replace('&', 'and');
			// 		var collegeName;
			// 		var courseName;
			// 		var courseCheck;
			// 		var pattern;
			// 		var whichduration = [];
			// 		getCollege.forEach(function (college) {
			// 			if (text.includes(college.name)) {
			// 				collegeName = college.name
			// 				collegedata.push(college)
			// 			}
			// 		})
			// 		if (text.includes('semester') || text.includes('Semester')) {
			// 			pattern = 'Semester'
			// 			if (text.includes('X')) {
			// 				whichduration.push({ name: 'Semester 10', value: 'Semester' })
			// 			}
			// 			if (text.includes('IX')) {
			// 				whichduration.push({ name: 'Semester 9', value: 'Semester' })
			// 			}
			// 			if (text.includes('VIII')) {
			// 				whichduration.push({ name: 'Semester 8', value: 'Semester' })
			// 			}
			// 			if (text.includes('VII')) {
			// 				whichduration.push({ name: 'Semester 7', value: 'Semester' })
			// 			}
			// 			if (text.includes('VI')) {
			// 				whichduration.push({ name: 'Semester 6', value: 'Semester' })
			// 			}


			// 			if (text.includes('IV')) {
			// 				whichduration.push({ name: 'Semester 4', value: 'Semester' })
			// 			}

			// 			if (text.includes('V')) {
			// 				whichduration.push({ name: 'Semester 5', value: 'Semester' })
			// 			}



			// 			if (text.includes('III')) {
			// 				whichduration.push({ name: 'Semester 3', value: 'Semester' })
			// 			}

			// 			if (text.includes('II')) {
			// 				whichduration.push({ name: 'Semester 2', value: 'Semester' })
			// 			}

			// 			if (text.includes('I')) {
			// 				whichduration.push({ name: 'Semester 1', value: 'Semester' })
			// 			}


			// 		} else {
			// 			pattern = 'Annual'
			// 			if (text.includes('F.Y')) {
			// 				whichduration = 'First Year'
			// 			}
			// 			else if (text.includes('S.Y')) {
			// 				whichduration = 'Second Year'
			// 			}
			// 			else if (text.includes('T.Y')) {
			// 				whichduration = 'Third Year'
			// 			}
			// 		}
			// 		getCourse.forEach(function (course) {
			// 			if (text.includes(course.short_name) || text.includes(course.full_name)) {
			// 				courseName = course.full_name
			// 				courseCheck = course.degree
			// 				coursedata.push(course)
			// 			} else {
			// 			}
			// 		})
			// 		var uploadDocuments;
			// 		// var uploadDocuments = await functions.uploadDocuments(pattern, collegeid, education_type, faculty, user_id, type, imageLocationToCallClient);
			// 		alldata.push(collegedata, coursedata, whichduration, null,imageLocationToCallClient);
			// 		res.json({
			// 			data: alldata,
			// 			status: 200
			// 		})

			// 	}).catch((error) => { console.log('**********error.message***************', error.message) });
			// } else {
				if(type == 'paymentIssue'){
				alldata.push(imageLocationToCallClient);
				if(alldata){
					res.json({
						status: 200,
						data: alldata
					})
				}else{res.json({status : 400})}
				
				}else{
					var uploadDocuments = await functions.uploadDocuments(user_id, type, imageLocationToCallClient);
				alldata.push(uploadDocuments.id);
				if(uploadDocuments){
					res.json({
						status: 200,
						data: alldata
					})
				}else{res.json({status : 400})}
				
				}
			// }

		});
	} catch (err) {
		console.error(err);
		return res.status(500).json({
			status: 500,
			message: `Internal server error.`,
			error: err.message
		});
	}
})
/**
 * Fetched the Course List for user to display in Dropdown.
 */
router.get('/getFacultyLists', async (req, res) => {

	const collegeCourse = await models.facultymaster.findAll({})
	if (collegeCourse) {
		res.json({
			status: 200,
			data: collegeCourse
		});
	}

})

/**
 * Fetched the NameChange Data of user by its UserId.
 * @query {Integer} userId - The userId of the NameChangeData Document to fetch the Data of user.
 */
router.get('/getNameChangeData', middlewares.getUserInfo,async (req, res) => {
	const userId = req.User.id;
	let filename = [];
	const user = await models.Letterfor_NameChange.findOne({
		where: {
			user_id: userId
		}
	})
	if (user) {
		filename.push({
			filePath: (user.file_name) ? constant.FILE_LOCATION + "public/upload/NameChangeLetter/" + userId + "/" + user.file_name : null,
			filename: (user.file_name) ? constant.BASE_URL + "/" + "upload/NameChangeLetter/" + userId + "/" + user.file_name : null,
		})
		res.json({
			status: 200,
			data: user,
			filename: filename
		})
	}
})

/** Instructional and Affiliation Details*/
router.get('/getletterDetails',middlewares.getUserInfo, async (req, res) => {
	try {
		const userId = req.User.id;
		// const appId = req.query.app_id;
		const degreeValue = 'Bachelors,Masters,Phd';
		var degreeVal = degreeValue.split(",");
		const educationDetailsInstructional = {
			bachelors: [],
			masters: [],
			phd: []
		};
		const educationDetailsAffiliation = {
			bachelors: [],
			masters: [],
			phd: []
		};
		for (let i = 0; i < degreeVal.length; i++) {
			const type = ['instructional', 'affiliation']
			for (let j = 0; j < type.length; j++) {
				const instructionalDetails = await models.letter_details.findAll({
					where: {
						user_id: userId,
						education_type: degreeVal[i],
						type: type[j]
					}
				})
				if (instructionalDetails) {
					for (const inst of instructionalDetails) {
						if (inst.education_type == "Masters" && inst.type == "instructional") {
							educationDetailsInstructional.masters.push({
								instructionalDetails: instructionalDetails
							})
						} else if (inst.education_type == "Masters" && inst.type == "affiliation") {
							educationDetailsAffiliation.masters.push({
								affiliationDetails: instructionalDetails
							})
						}
						if (inst.education_type == "Bachelors" && inst.type == "instructional") {
							educationDetailsInstructional.bachelors.push({
								instructionalDetails: instructionalDetails
							})
						} else if (inst.education_type == "Bachelors" && inst.type == "affiliation") {
							educationDetailsAffiliation.bachelors.push({
								affiliationDetails: instructionalDetails
							})
						}
						if (inst.education_type == "Phd" && inst.type == "instructional") {
							educationDetailsInstructional.phd.push({
								instructionalDetails: instructionalDetails
							})
						} else if (inst.education_type == "Phd" && inst.type == "affiliation") {
							educationDetailsAffiliation.phd.push({
								affiliationDetails: instructionalDetails
							})
						}
					}
				}
			}
		}
		res.json({
			status: 200,
			dataInstructional: educationDetailsInstructional,
			dataAffiliation: educationDetailsAffiliation
		})
	} catch (error) {
		console.error("Error in getletterDetails", error);
		return res.status(500).json({
			status: 500,
			message: "Internal Server Error"
		});
	}
})


/**Instructional And Affiliation Form Length  */
router.get('/getInstructionalForms',middlewares.getUserInfo, async (req, res) => {
	try {
		const userId = req.User.id;
		const userMarkList = await models.UserMarklist_Upload.findAll({
			where: {
				user_id: userId
			},
			attributes: ['education_type', 'pattern'],
			order: [
				['education_type', 'ASC']
			]
		})
		const setDegreeValue = new Set(userMarkList.map(item => item.education_type));
		const degree = Array.from(setDegreeValue);

		const results = [];

		for (let i = 0; i < degree.length; i++) {
			const collegeLength = await models.UserMarklist_Upload.count({
				distinct: true,
				col: 'collegeId',
				where: {
					user_id: userId,
					education_type: degree[i]
				}
			});

			const courseLength = await models.UserMarklist_Upload.count({
				distinct: true,
				col: 'faculty',
				where: {
					user_id: userId,
					education_type: degree[i]
				}
			});

			let formLength;
			if (collegeLength == 1 && courseLength > 1) {
				formLength = courseLength;
			} else if (collegeLength > 1 && courseLength == 1) {
				formLength = collegeLength;
			} else {
				formLength = 1;
			}

			if (userMarkList[i].pattern == "Semester") {
				formLength *= 2
			}
			results.push({
				education_type: degree[i],
				formLength: formLength
			});
		}
		return res.json(results);
	} catch (error) {
		console.error("Error in getInstructionalForms", error);
		return res.status(500).json({
			status: 500,
			message: "Internal Server Error"
		});
	}
})


/** Get Route of user Applied Details */
router.get('/getAppliedUserDetail',middlewares.getUserInfo, async (req, res) => {
	try {
		const userId = req.User.id;
		const user = await models.Applied_For_Details.findOne({
			where: {
				user_id: userId
			}
		})
		if (user) {
			res.json({
				status: 200,
				data: user
			});
		}
	} catch (error) {
		return res.status(500).json({
			status: 500,
			message: "Internal Server Error"
		});
	}
})


/** Post Routes */

/**
 * Uploads the Grade to Percentage Letter document for a user using multer and parameters passed in the URL.
 * @param {Integer} doc_id - ID of the user document
 * @param {Integer} userId - User ID of the user
 * @param {Integer} app_id - App ID of the user document
 * @param {String} degree_name - Degree name of the user document
 * @param {String} transcript_doc - Type of the document
 * @param {Integer} collegeId - College ID of the document
 */
router.post('/upload_gradeToPercentLetter',middlewares.getUserInfo, async (req, res) => {
	try {
		const userId = req.User.id;
		let image;
		const degree_name = req.query.degree_name;
		const transcript_doc = req.query.hiddentype;
		const doc_id = req.query.doc_id;
		const app_id = req.query.app_id;
		const collegeId = req.query.clgId;
		const dir = constant.FILE_LOCATION + "public/upload/gradeToPercentLetter/" + userId;

		if (!fs.existsSync(dir)) {
			fs.mkdirSync(dir);
		}

		const storage = multer.diskStorage({
			destination: function (req, file, callback) {
				callback(null, constant.FILE_LOCATION + 'public/upload/gradeToPercentLetter/' + userId);
			},
			filename: function (req, file, callback) {
				const extension = path.extname(file.originalname)
				const randomString = functions.generateRandomString(10, 'alphabetic')
				const newFileName = randomString.concat(extension);
				image = newFileName;
				callback(null, newFileName);
			}
		});

		const upload = multer({
			storage: storage,
			fileFilter: function (req, file, callback) {
				ext = path.extname(file.originalname)
				if (ext !== '.png' && ext !== '.jpg' && ext !== '.jpeg' && ext !== '.pdf' && ext !== '.PNG' && ext !== '.JPG' && ext !== '.JPEG' && ext !== '.PDF') {
					return callback(res.end('Please upload your document in .pdf, .jpeg, .jpg or .png formats only'), null)
				}
				callback(null, true)
			}
		}).single('file');

		upload(req, res, function (err, data) {
			imageLocationToCallClient = image;
			if (ext == '.pdf') {
				fs.readFile(constant.FILE_LOCATION + 'public/upload/gradeToPercentLetter/' + userId + '/' + image, (err, pdfBuffer) => {
					new pdfreader.PdfReader().parseBuffer(pdfBuffer, function (err, item) {
						if (err) {
							uploadValue = false;
							ValueUpdateData(uploadValue);
						} else if (!item) {
							uploadValue = true;
							ValueUpdateData(uploadValue);
						} else if (item.text) { }
					});
				});
			} else {
				uploadValue = true;
				ValueUpdateData(uploadValue);
			}

			async function ValueUpdateData(uploadValue) {
				if (uploadValue == true) {
					let fileStatus = false;
					const data = await models.GradeToPercentageLetter.findAll({
						where: {
							user_id: userId
						}
					})
					if (data) {
						if (data.length > 0) {
							data.forEach(function (marklistData) {
								if (marklistData) {
									if (marklistData.file_name == imageLocationToCallClient) {
										fileStatus = true;
									}
								}
							})
						}
						if (fileStatus == true) {
							return res.json({
								status: 200,
								message: `File already exist. please upload another file!!!..`
							})
						} else {
							if (doc_id != null && doc_id != undefined && doc_id != '') {
								const gradeToPercentageLetter = await models.GradeToPercentageLetter.findOne({
									where: {
										id: doc_id,
									}
								})
								if (gradeToPercentageLetter) {
									const updatedLetter = await gradeToPercentageLetter.update({
										file_name: imageLocationToCallClient,
										lock_transcript: false,
										upload_step: 'changed'
									})
									if (updatedLetter) {
										return res.json({
											status: 200,
											message: `Upload Completed.`,
											data: updatedLetter
										})
									} else {
										return res.json({
											status: 400,
											message: `Error occured in uploading document.`
										});
									}
								}
							} else {
								if (app_id == null) {
									const gradeToPercentageLetter = await models.GradeToPercentageLetter.create({
										name: degree_name,
										user_id: userId,
										type: transcript_doc,
										file_name: imageLocationToCallClient,
										lock_transcript: false,
										collegeId: collegeId
									})
									if (gradeToPercentageLetter) {
										return res.json({
											status: 200,
											message: `Upload Completed.`,
											data: transcript_doc
										})
									} else {
										return res.json({
											status: 400,
											message: `Error occured in uploading document.`
										});
									}
								} else {
									const gradeToPercentageLetter = await models.GradeToPercentageLetter.create({
										name: transcript_name,
										user_id: userId,
										type: degree_name,
										file_name: imageLocationToCallClient,
										lock_transcript: false,
										collegeId: collegeId,
										upload_step: "changed",
										app_id: app_id
									})
									if (gradeToPercentageLetter) {
										return res.json({
											status: 200,
											message: `Upload Completed.`,
											data: transcript_doc
										})
									} else {
										return res.json({
											status: 400,
											message: `Error occured in uploading document.`
										});
									}
								}
							}
						}
					}
				} else if (uploadValue == false) {
					fs.unlink(constant.FILE_LOCATION + 'public/upload/gradeToPercentLetter/' + userId + '/' + image, function (err) {
						if (err) {
							return res.json({
								status: 400,
								message: `Error occured in uploading document.`
							});
						} else {
							return res.json({
								status: 401,
								message: 'You have uploaded the Password Protected Document. Please Upload correct document.'
							});
						}
					});
				}
			}
		})
	} catch (error) {
		console.error("Error in /upload_gradeToPercentLetter", error);
		return res.status(500).json({
			status: 500,
			message: "Internal Server Error"
		});
	}
})

/**
 * @
 */
router.post('/saveUserMarkList',middlewares.getUserInfo, async (req, res) => {
	var app_id = req.body.app_id;
	var user_id = req.User.id;
	var type = req.body.value;
	var data = req.body.data;
	var updateDocuments = await functions.updateDocuments(data, type , user_id);
	if (updateDocuments) {
		res.json({ status: 200 })
	} else {
		res.json({ status: 400 })
	}
})

/**
 * Uploads the Transcript  document of user using multer and parameters passed in the URL.
 * @param {Integer} doc_id - ID of the user document
 * @param {Integer} userId - User ID of the user
 * @param {Integer} app_id - App ID of the user document
 * @param {String} transcript_name - Degree name of the user document
 * @param {String} transcript_doc - Type of the document
 * @param {Integer} collegeId - College ID of the document
 */
router.post('/upload_transcript',middlewares.getUserInfo, async (req, res) => {
	try {
		const userId = req.User.id;
		let image;
		const transcript_name = req.query.transcript_name;
		const transcript_doc = req.query.hiddentype;
		const dir = constant.FILE_LOCATION + "public/upload/transcript/" + userId;
		const doc_id = req.query.doc_id;
		const app_id = req.query.app_id;
		const collegeId = req.query.clgId;

		if (!fs.existsSync(dir)) {
			fs.mkdirSync(dir);
		}

		const storage = multer.diskStorage({
			destination: function (req, file, callback) {
				callback(null, constant.FILE_LOCATION + 'public/upload/transcript/' + userId);
			},
			filename: function (req, file, callback) {
				const extension = path.extname(file.originalname)
				const randomString = functions.generateRandomString(10, 'alphabetic')
				const newFileName = randomString.concat(extension);
				image = newFileName;
				callback(null, newFileName);

			}
		});

		const upload = multer({
			storage: storage,
			fileFilter: function (req, file, callback) {
				ext = path.extname(file.originalname)
				if (ext !== '.png' && ext !== '.jpg' && ext !== '.jpeg' && ext !== '.pdf' && ext !== '.PNG' && ext !== '.JPG' && ext !== '.JPEG' && ext !== '.PDF') {
					return callback(res.end('Please upload your document in .pdf, .jpeg, .jpg or .png formats only'), null)
				}
				callback(null, true)
			}
		}).single('file');

		upload(req, res, function (err, data) {
			imageLocationToCallClient = image;
			if (ext == '.pdf') {
				fs.readFile(constant.FILE_LOCATION + 'public/upload/transcript/' + userId + '/' + image, (err, pdfBuffer) => {
					new pdfreader.PdfReader().parseBuffer(pdfBuffer, function (err, item) {
						if (err) {
							uploadValue = false;
							ValueUpdateData(uploadValue);
						} else if (!item) {
							uploadValue = true;
							ValueUpdateData(uploadValue);
						} else if (item.text) { }
					});
				});
			} else {
				uploadValue = true;
				ValueUpdateData(uploadValue);
			}

			async function ValueUpdateData(uploadValue) {
				if (uploadValue == true) {
					let fileStatus = false;
					const data = await models.User_Transcript.findAll({
						where: {
							user_id: userId,
						}
					})
					if (data) {
						if (data.length > 0) {
							data.forEach(function (marklistData) {
								if (marklistData) {
									if (marklistData.file_name == imageLocationToCallClient) {
										fileStatus = true;
									}
								}
							})
						}
						if (fileStatus == true) {
							return res.json({
								status: 200,
								message: `File already exist. please upload another file!!!..`,
							})
						} else {
							if (doc_id != undefined && doc_id != null && doc_id != '') {
								const transcriptUpload = await models.User_Transcript.findOne({
									where: {
										id: doc_id
									}
								})
								if (transcriptUpload) {
									const updatedtranscriptUpload = await transcriptUpload.update({
										file_name: imageLocationToCallClient,
										lock_transcript: false,
										upload_step: 'changed'
									})
									if (updatedtranscriptUpload) {
										return res.json({
											status: 200,
											message: `Upload Completed.`,
											data: updatedtranscriptUpload
										});
									} else {
										return res.json({
											status: 400,
											message: `Error occured in uploading document.`
										});
									}
								}
							} else {
								if (app_id == null || app_id == '' || app_id == undefined) {
									const userTranscript = await models.User_Transcript.create({
										name: transcript_name,
										user_id: userId,
										type: transcript_doc,
										file_name: imageLocationToCallClient,
										lock_transcript: false,
										collegeId: collegeId
									})
									if (userTranscript) {
										return res.json({
											status: 200,
											message: `Upload Completed.`,
											data: transcript_doc
										});
									} else {
										return res.json({
											status: 400,
											message: `Error occured in uploading document.`
										});
									}
								} else {
									const userTranscript = await models.User_Transcript.create({
										name: transcript_name,
										user_id: userId,
										type: transcript_doc,
										file_name: imageLocationToCallClient,
										lock_transcript: false,
										collegeId: collegeId,
										upload_step: "changed",
										app_id: app_id
									})
									if (userTranscript) {
										return res.json({
											status: 200,
											message: `Upload Completed.`,
											data: transcript_doc
										});
									} else {
										return res.json({
											status: 400,
											message: `Error occured in uploading document.`
										});
									}
								}
							}
						}
					}
				} else if (uploadValue == false) {
					fs.unlink(constant.FILE_LOCATION + 'public/upload/transcript/' + userId + '/' + image, function (err) {
						if (err) {
							return res.json({
								status: 400,
								message: `Error occured in uploading document.`
							});
						} else {
							return res.json({
								status: 401,
								message: 'You have uploaded the Password Protected Document. Please Upload correct document.'
							});
						}
					});
				}
			}
		});
	} catch (err) {

	}
})

/**
 * Uploads the curriculum document of user using multer and parameters passed in the URL.
  * @param {Integer} doc_id - ID of the user document
 * @param {Integer} userId - User ID of the user
 * @param {Integer} app_id - App ID of the user document
 * @param {String} transcript_name - Degree name of the user document
 * @param {String} transcript_doc - Type of the document
 * @param {Integer} collegeId - College ID of the document
 * 
 */
router.post('/upload_curriculum',middlewares.getUserInfo, async (req, res) => {
	const userId = req.User.id;
	let image;
	const transcript_name = req.query.transcript_name;
	const transcript_doc = req.query.hiddentype;
	const doc_id = req.query.doc_id;
	let dir = constant.FILE_LOCATION + "public/upload/curriculum/" + userId;
	const app_id = req.query.app_id;
	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir);
	}

	let storage = multer.diskStorage({
		destination: function (req, file, callback) {
			callback(null, constant.FILE_LOCATION + 'public/upload/curriculum/' + userId);
		},
		filename: function (req, file, callback) {
			let extension = path.extname(file.originalname)
			let randomString = functions.generateRandomString(10, 'alphabetic')
			let newFileName = randomString.concat(extension);
			image = newFileName;
			callback(null, newFileName);
		}
	});

	let upload = multer({
		storage: storage,
		fileFilter: function (req, file, callback) {
			ext = path.extname(file.originalname)
			if (ext !== '.png' && ext !== '.jpg' && ext !== '.jpeg' && ext !== '.pdf' && ext !== '.PNG' && ext !== '.JPG' && ext !== '.JPEG' && ext !== '.PDF') {
				return callback(res.end('Please upload your document in .pdf, .jpeg, .jpg or .png formats only'), null)
			}
			callback(null, true)
		}
	}).single('file');

	upload(req, res, function (err, data) {
		imageLocationToCallClient = image;
		if (ext == '.pdf') {
			fs.readFile(constant.FILE_LOCATION + 'public/upload/curriculum/' + userId + '/' + image, (err, pdfBuffer) => {
				new pdfreader.PdfReader().parseBuffer(pdfBuffer, function (err, item) {
					if (err) {
						uploadValue = false;
						ValueUpdateData(uploadValue);
					} else if (!item) {
						uploadValue = true;
						ValueUpdateData(uploadValue);
					} else if (item.text) { }
				});
			});
		} else {
			uploadValue = true;
			ValueUpdateData(uploadValue);
		}
		async function ValueUpdateData(uploadValue) {
			if (uploadValue == true) {
				var fileStatus = false;
				const curriculum = await models.User_Curriculum.findAll({
					where: {
						user_id: userId
					}
				})
				if (curriculum) {
					if (curriculum.length > 0) {
						curriculum.forEach(function (marklistData) {
							if (marklistData) {
								if (marklistData.file_name == imageLocationToCallClient) {
									fileStatus = true;
								}
							}
						})
					}
					if (fileStatus == true) {
						res.json({
							status: 200,
							message: `File already exist. please upload another file!!!..`,
						})
					} else {
						if (doc_id != undefined && doc_id != null && doc_id != '') {
							const curriculum_data = await models.User_Curriculum.findOne({
								where: {
									user_id: userId,
									id: doc_id
								}
							})
							if (curriculum_data) {
								const userdata = await curriculum_data.update({
									file_name: imageLocationToCallClient,
									lock_transcript: false,
									collegeId: req.query.collegeId,
									upload_step: "changed"
								})
								if (userdata) {
									return res.json({
										status: 200,
										message: `Upload Completed.`,
										data: transcript_doc
									});
								} else {
									return res.json({
										status: 400,
										message: `Error occured in uploading document.`
									});
								}

							}
						} else {
							if (app_id == null) {
								const userCurriculum = await models.User_Curriculum.create({
									name: transcript_name,
									user_id: userId,
									file_name: imageLocationToCallClient,
									lock_transcript: false,
									collegeId: req.query.collegeId,
									upload_step: "default"
								})
								if (userCurriculum) {
									return res.json({
										status: 200,
										message: `Upload Completed.`,
										data: transcript_doc
									});
								} else {
									return res.json({
										status: 400,
										message: `Error occured in uploading document.`
									});
								}
							} else {
								const curriculumData = await models.User_Curriculum.create({
									name: transcript_name,
									user_id: userId,
									file_name: imageLocationToCallClient,
									lock_transcript: false,
									collegeId: req.query.collegeId,
									upload_step: "changed",
									app_id: app_id
								})
								if (curriculumData) {
									return res.json({
										status: 200,
										message: `Upload Completed.`,
										data: transcript_doc
									});
								} else {
									return res.json({
										status: 400,
										message: `Error occured in uploading document.`
									});
								}
							}
						}
					}
				}

			} else if (uploadValue == false) {
				fs.unlink(constant.FILE_LOCATION + 'public/upload/curriculum/' + userId + '/' + image, function (err) {
					if (err) {
						return res.json({
							status: 400,
							message: `Error occured in uploading document.`
						});
					} else {
						return res.json({
							status: 401,
							message: 'You have uploaded the Password Protected Document. Please Upload correct document.'
						});
					}
				});
			}
		}

	})

})

/**
 * Uploads the Competency Letter document of user using multer and parameters passed in the URL.
 * @param {Integer} doc_id - ID of the user document
 * @param {Integer} userId - User ID of the user
 * @param {Integer} app_id - App ID of the user document
 * @param {String} competency_name - Degree name of the user document
 * @param {String} competency_doc - Type of the document
 * @param {Integer} collegeId - College ID of the document
 */
router.post('/upload_CompetencyLetter',middlewares.getUserInfo, async (req, res) => {
	const userId = req.User.id;
	let image;
	const competency_name = req.query.degree_name;
	const competency_doc = req.query.hiddentype;
	const dir = constant.FILE_LOCATION + "public/upload/CompetencyLetter/" + userId;
	const doc_id = req.query.doc_id;
	const app_id = req.query.app_id;
	const collegeId = req.query.clgId

	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir);
	}

	const storage = multer.diskStorage({
		destination: function (req, file, callback) {
			callback(null, constant.FILE_LOCATION + 'public/upload/CompetencyLetter/' + userId);
		},
		filename: function (req, file, callback) {
			var extension = path.extname(file.originalname)
			var randomString = functions.generateRandomString(10, 'alphabetic')
			var newFileName = randomString.concat(extension);
			image = newFileName;
			callback(null, newFileName);
		}
	});

	const upload = multer({
		storage: storage,
		fileFilter: function (req, file, callback) {
			ext = path.extname(file.originalname)
			if (ext !== '.png' && ext !== '.jpg' && ext !== '.jpeg' && ext !== '.pdf' && ext !== '.PNG' && ext !== '.JPG' && ext !== '.JPEG' && ext !== '.PDF') {
				return callback(res.end('Please upload your document in .pdf, .jpeg, .jpg or .png formats only'), null)
			}
			callback(null, true)
		}
	}).single('file');

	upload(req, res, function (err, data) {
		imageLocationToCallClient = image;
		if (ext == '.pdf') {
			fs.readFile(constant.FILE_LOCATION + 'public/upload/CompetencyLetter/' + userId + '/' + image, (err, pdfBuffer) => {
				new pdfreader.PdfReader().parseBuffer(pdfBuffer, function (err, item) {
					if (err) {
						uploadValue = false;
						ValueUpdateData(uploadValue);
					} else if (!item) {
						uploadValue = true;
						ValueUpdateData(uploadValue);
					} else if (item.text) { }
				});
			});
		} else {
			uploadValue = true;
			ValueUpdateData(uploadValue);
		}

		async function ValueUpdateData(uploadValue) {
			if (uploadValue == true) {
				let fileStatus = false;
				const data = await models.competency_letter.findAll({
					where: {
						user_id: userId
					}
				})
				if (data) {
					if (data.length > 0) {
						data.forEach(function (marklistData) {
							if (marklistData) {
								if (marklistData.file_name == imageLocationToCallClient) {
									fileStatus = true;
								}
							}
						})
					}
					if (fileStatus == true) {
						return res.json({
							status: 200,
							message: `File already exist. please upload another file!!!..`
						})
					} else {
						if (doc_id != undefined && doc_id != null && doc_id != '') {
							const competencyUpload = await models.competency_letter.findOne({
								where: {
									id: doc_id
								}
							})
							if (competencyUpload) {
								const updatedCompetencyUpload = await competencyUpload.update({
									file_name: imageLocationToCallClient,
									lock_transcript: false,
									upload_step: 'changed'
								})
								if (updatedCompetencyUpload) {
									return res.json({
										status: 200,
										message: `Upload Completed.`,
										data: updatedCompetencyUpload
									});
								} else {
									return res.json({
										status: 400,
										message: `Error occured in uploading document.`
									});
								}
							}
						} else {
							if (app_id == null || app_id == '' || app_id == undefined) {
								const userCompetency = await models.competency_letter.create({
									name: competency_name,
									user_id: userId,
									type: competency_doc,
									file_name: imageLocationToCallClient,
									lock_transcript: false,
									collegeId: collegeId
								})
								if (userCompetency) {
									return res.json({
										status: 200,
										message: `Upload Completed.`,
										data: competency_doc
									});
								} else {
									return res.json({
										status: 400,
										message: `Error occured in uploading document.`
									});
								}
							} else {
								const userCompetency = await models.competency_letter.create({
									name: competency_name,
									user_id: userId,
									type: competency_doc,
									file_name: imageLocationToCallClient,
									lock_transcript: false,
									collegeId: collegeId,
									upload_step: "changed",
									app_id: app_id
								})
								if (userCompetency) {
									return res.json({
										status: 200,
										message: `Upload Completed.`,
										data: competency_doc
									});
								} else {
									return res.json({
										status: 400,
										message: `Error occured in uploading document.`
									});
								}

							}
						}
					}
				}
			} else if (uploadValue == false) {
				fs.unlink(constant.FILE_LOCATION + 'public/upload/CompetencyLetter/' + userId + '/' + image, function (err) {
					if (err) {
						return res.json({
							status: 400,
							message: `Error occured in uploading document.`
						});
					} else {
						return res.json({
							status: 401,
							message: 'You have uploaded the Password Protected Document. Please Upload correct document.'
						});
					}
				});
			}
		}
	})
})

/**
 * Uploads a document of letter for Name change using multer and parameters passed in URL
 * @param {Integer} doc_id - ID of the user document
 * @param {Integer} userId - User ID of the user
 * @param {Integer} app_id - App ID of the user document
 * @param {String} transcript_doc - Type of the document
 */
router.post('/upload_letterforNameChange',middlewares.getUserInfo, async (req, res) => {
	const userId = req.User.id;
	let image;
	const transcript_name = req.query.transcript_name;
	const transcript_doc = req.query.hiddentype;
	const dir = constant.FILE_LOCATION + "public/upload/NameChangeLetter/" + userId;
	const doc_id = req.query.doc_id;
	const app_id = req.query.app_id_namechange;

	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir);
	}
	let storage = multer.diskStorage({
		destination: function (req, file, callback) {
			callback(null, constant.FILE_LOCATION + 'public/upload/NameChangeLetter/' + userId);
		},
		filename: function (req, file, callback) {
			let extension = path.extname(file.originalname)
			let randomString = functions.generateRandomString(10, 'alphabetic')
			let newFileName = randomString.concat(extension);
			image = newFileName;
			callback(null, newFileName);
		}
	});

	let upload = multer({
		storage: storage,
		fileFilter: function (req, file, callback) {
			ext = path.extname(file.originalname)
			if (ext !== '.png' && ext !== '.jpg' && ext !== '.jpeg' && ext !== '.pdf' && ext !== '.PNG' && ext !== '.JPG' && ext !== '.JPEG' && ext !== '.PDF') {
				return callback(res.end('Please upload your document in .pdf, .jpeg, .jpg or .png formats only'), null)
			}
			callback(null, true)
		}
	}).single('file');

	upload(req, res, function (err, data) {
		imageLocationToCallClient = image;
		if (ext == '.pdf') {
			fs.readFile(constant.FILE_LOCATION + 'public/upload/NameChangeLetter/' + userId + '/' + image, (err, pdfBuffer) => {
				new pdfreader.PdfReader().parseBuffer(pdfBuffer, function (err, item) {
					if (err) {
						uploadValue = false;
						ValueUpdateData(uploadValue);
					} else if (!item) {
						uploadValue = true;
						ValueUpdateData(uploadValue);
					} else if (item.text) { }
				});
			});
		} else {
			uploadValue = true;
			ValueUpdateData(uploadValue);
		}
		async function ValueUpdateData(uploadValue) {
			if (uploadValue == true) {
				let fileStatus = false;
				const data = await models.Letterfor_NameChange.findOne({
					where: {
						user_id: userId
					}
				})
				if (data) {
					if (data.length > 0) {
						data.forEach(function (marklistData) {
							if (marklistData) {
								if (marklistData.file_name == imageLocationToCallClient) {
									fileStatus = true;
								}
							}
						})
					}
					if (fileStatus == true) {
						res.json({
							status: 200,
							message: `File already exist. please upload another file!!!..`
						})
					} else {
						const fileData = await models.Letterfor_NameChange.findOne({
							where: {
								user_id: userId
							}
						})
						if (fileData) {
							fileData.update({
								file_name: imageLocationToCallClient,
								name: 'Passport'
							})
							return res.json({
								status: 200,
								message: `Upload Completed.`,
								data: transcript_doc
							})
						} else {
							return res.json({
								status: 400,
								message: `Error occured in uploading document.`
							})
						}

					}
				}
			} else if (uploadValue == false) {
				fs.unlink(constant.FILE_LOCATION + 'public/upload/NameChangeLetter/' + userId + '/' + image, function (err) {
					if (err) {
						return res.json({
							status: 400,
							message: `Error occured in uploading document.`
						});
					} else {
						return res.json({
							status: 401,
							message: 'You have uploaded the Password Protected Document. Please Upload correct document.'
						});
					}
				});
			}
		}
	})
})


/**
 * Uploads a document of letter for Name change using multer and parameters passed in URL
 * @param {Integer} doc_id - ID of the user document
 * @param {Integer} userId - User ID of the user
 * @param {Integer} app_id - App ID of the user document
 * @param {String} transcript_doc - Type of the document
 * @param {String} transcript_name - DocumentType name of the user document
 */
router.post('/upload_letterforNameChange',middlewares.getUserInfo, async (req, res) => {
	const userId = req.User.id;
	let image;
	const transcript_name = req.query.transcript_name;
	const transcript_doc = req.query.hiddentype;
	const dir = constant.FILE_LOCATION + "public/upload/NameChangeLetter/" + userId;
	const doc_id = req.query.doc_id;
	const app_id = req.query.app_id_namechange;

	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir);
	}
	let storage = multer.diskStorage({
		destination: function (req, file, callback) {
			callback(null, constant.FILE_LOCATION + 'public/upload/NameChangeLetter/' + userId);
		},
		filename: function (req, file, callback) {
			let extension = path.extname(file.originalname)
			let randomString = functions.generateRandomString(10, 'alphabetic')
			let newFileName = randomString.concat(extension);
			image = newFileName;
			callback(null, newFileName);
		}
	});

	let upload = multer({
		storage: storage,
		fileFilter: function (req, file, callback) {
			ext = path.extname(file.originalname)
			if (ext !== '.png' && ext !== '.jpg' && ext !== '.jpeg' && ext !== '.pdf' && ext !== '.PNG' && ext !== '.JPG' && ext !== '.JPEG' && ext !== '.PDF') {
				return callback(res.end('Please upload your document in .pdf, .jpeg, .jpg or .png formats only'), null)
			}
			callback(null, true)
		}
	}).single('file');

	upload(req, res, function (err, data) {
		imageLocationToCallClient = image;
		if (ext == '.pdf') {
			fs.readFile(constant.FILE_LOCATION + 'public/upload/NameChangeLetter/' + userId + '/' + image, (err, pdfBuffer) => {
				new pdfreader.PdfReader().parseBuffer(pdfBuffer, function (err, item) {
					if (err) {
						uploadValue = false;
						ValueUpdateData(uploadValue);
					} else if (!item) {
						uploadValue = true;
						ValueUpdateData(uploadValue);
					} else if (item.text) { }
				});
			});
		} else {
			uploadValue = true;
			ValueUpdateData(uploadValue);
		}
		async function ValueUpdateData(uploadValue) {
			if (uploadValue == true) {
				let fileStatus = false;
				const data = await models.Letterfor_NameChange.findOne({
					where: {
						user_id: userId
					}
				})
				if (data) {
					if (data.length > 0) {
						data.forEach(function (marklistData) {
							if (marklistData) {
								if (marklistData.file_name == imageLocationToCallClient) {
									fileStatus = true;
								}
							}
						})
					}
					if (fileStatus == true) {
						res.json({
							status: 200,
							message: `File already exist. please upload another file!!!..`
						})
					} else {
						const fileData = await models.Letterfor_NameChange.findOne({
							where: {
								user_id: userId
							}
						})
						if (fileData) {
							fileData.update({
								file_name: imageLocationToCallClient,
								name: 'Passport'
							})
							return res.json({
								status: 200,
								message: `Upload Completed.`,
								data: transcript_doc
							})
						} else {
							return res.json({
								status: 400,
								message: `Error occured in uploading document.`
							})
						}

					}
				}
			} else if (uploadValue == false) {
				fs.unlink(constant.FILE_LOCATION + 'public/upload/NameChangeLetter/' + userId + '/' + image, function (err) {
					if (err) {
						return res.json({
							status: 400,
							message: `Error occured in uploading document.`
						});
					} else {
						return res.json({
							status: 401,
							message: 'You have uploaded the Password Protected Document. Please Upload correct document.'
						});
					}
				});
			}
		}
	})
})

/**
 * Save and Update the Data of user for Letter for name change letter by its userId.
 * @param {String} formData - By using form-data
 */
router.post('/saveLetterNameChangeData',middlewares.getUserInfo, async (req, res) => {
	try {
		const userId = req.User.id;

		const user = await models.Letterfor_NameChange.findOne({
			where: {
				user_id: userId,
				id : req.body.data.id
			}
		});

		if (user) {
			await user.update({
				firstnameaspermarksheet: req.body.data.firstNameMarksheetCtrl,
				fathersnameaspermarksheet: req.body.data.fatherNameMarksheetCtrl,
				mothersnameaspermarksheet: req.body.data.motherNameMarksheetCtrl,
				lastnameaspermarksheet: req.body.data.lastNameMarksheetCtrl,
				firstnameasperpassport: req.body.data.firstNamePassportCtrl,
				fathersnameasperpassport: req.body.data.fatherNamePassportCtrl,
				lastnameasperpassport: req.body.data.lastNamePassportCtrl,
				type: 'Passport'
			});

			res.json({
				status: 200,
				message: 'Data saved successfully!!!'
			});

		} else {
			const userCreated = await models.Letterfor_NameChange.create({
				user_id: userId,
				firstnameaspermarksheet: req.body.data.firstNameMarksheetCtrl,
				fathersnameaspermarksheet: req.body.data.fatherNameMarksheetCtrl,
				mothersnameaspermarksheet: req.body.data.motherNameMarksheetCtrl,
				lastnameaspermarksheet: req.body.data.lastNameMarksheetCtrl,
				firstnameasperpassport: req.body.data.firstNamePassportCtrl,
				fathersnameasperpassport: req.body.data.fatherNamePassportCtrl,
				lastnameasperpassport: req.body.data.lastNamePassportCtrl,
				type: 'Passport'
			});

			if (userCreated) {
				res.json({
					status: 200,
					message: 'Data saved successfully!!!'
				});
			} else {
				res.status(400);
			}
		}
	} catch (error) {
		console.error("Error:", error);
		res.status(500).json({
			error: 'Internal server error'
		});
	}
});

/**
 * Saved and Update the Instructional letter Data of user.
 * @param {String} formData - By using form-data and params are doc_id,name,college,specialization,division,duration,yearOfpassing,education,user_id
 */

router.post('/saveInstructionalData',middlewares.getUserInfo, upload.none(), async (req, res) => {
	try {
		const doc_id = req.body.idCtrl;
		const name = req.body.name;
		const college = req.body.college;
		const course = req.body.course;
		const specialization = req.body.specialization;
		const division = req.body.division;
		const duration = req.body.duration;
		const yearOfpassing = req.body.yearOfPassing;
		const education = req.body.education
		const user_id = req.User.id;
		const faculty = course.split(' of ')[1];
		const type = req.body.type;
		const user = await models.letter_details.findOne({
			where: {
				id: doc_id
			}
		})
		if (user) {
			await user.update({
				user_d: user_id,
				studentName: name,
				courseName: course,
				collegeName: college,
				specialization: specialization,
				duration: duration,
				yearofpassing: yearOfpassing,
				division: division,
				education_type: education,
				faculty: faculty,
				type: type
			})
			return res.json({
				status: 200,
				message: 'Data Updated successfully!!!'
			});
		} else {
			await models.letter_details.create({
				user_id: user_id,
				studentName: name,
				courseName: course,
				collegeName: college,
				specialization: specialization,
				duration: duration,
				yearofpassing: yearOfpassing,
				division: division,
				education_type: education,
				faculty: faculty,
				type: type
			})
			return res.json({
				status: 200,
				message: 'Data saved successfully!!!'
			});
		}
	} catch (error) {
		console.error("Error:", error);
		res.status(500).json({
			error: 'Internal server error'
		});
	}
})



/** Delete Routes */

/**
 * Delete the Document of user based on parameters passed in the API request
 * @param {String} doc_type - Type of the document
 * @param {Integer} doc_id - Id of the document
 */
router.delete('/deleteDocument', async (req, res) => {
	try {
		const doc_id = req.query.id;
		const doc_type = req.query.type;
		if (doc_type == 'gradToPer') {
			try {
				const letter = await models.GradeToPercentageLetter.findOne({
					where: {
						id: doc_id
					}
				})
				if (letter) {
					const letterDelete = await letter.destroy()
					if (letterDelete) {
						return res.json({
							status: 200,
							data: letterDelete
						})
					}
				} else {
					return res.json({
						status: 400,
						message: 'File Not Deleted!!..'
					});
				}
			} catch (error) {
				return res.json({
					status: 500,
					message: 'An error occurred while updating GradeToPercentageLetter.'
				});
			}
		} else if (doc_type == 'extraDocument') {
			try {
				const file = await models.User_Transcript.findOne({
					where: {
						id: doc_id
					}
				})
				if (file) {
					const fileDelete = await file.destroy()
					if (fileDelete) {
						return res.json({
							status: 200,
							data: fileDelete
						})
					}
				} else {
					return res.json({
						status: 400,
						message: 'File Not Deleted!!..'
					});
				}
			} catch (error) {
				return res.json({
					status: 500,
					message: 'An error occurred while updating GradeToPercentageLetter.'
				});
			}
		} else if (doc_type == 'marklist') {
			try {
				const file = await models.UserMarklist_Upload.findOne({
					where: {
						id: doc_id
					}
				})
				if (file) {
					const fileDelete = await file.destroy()
					if (fileDelete) {
						return res.json({
							status: 200,
							data: fileDelete
						})
					}
				} else {
					return res.json({
						status: 400,
						message: 'File Not Deleted!!..'
					});
				}
			} catch (error) {
				return res.json({
					status: 500,
					message: 'An error occurred while updating UserMarklist_Upload.'
				});
			}
		} else if (doc_type == 'transcript') {
			try {
				const file = await models.User_Transcript.findOne({
					where: {
						id: doc_id
					}
				})
				if (file) {
					const fileDelete = await file.destroy()
					if (fileDelete) {
						return res.json({
							status: 200,
							data: fileDelete
						})
					}
				} else {
					return res.json({
						status: 400,
						message: 'File Not Deleted!!..'
					});
				}
			} catch (error) {
				return res.json({
					status: 500,
					message: 'An error occurred while updating User_Transcript.'
				});
			}
		} else if (doc_type == 'curriculum') {
			try {
				const file = await models.User_Curriculum.findOne({
					where: {
						id: doc_id
					}
				})
				if (file) {
					const fileDelete = await file.destroy()
					if (fileDelete) {
						return res.json({
							status: 200,
							data: fileDelete
						})
					}
				} else {
					return res.json({
						status: 400,
						message: 'File Not Deleted!!..'
					});
				}
			} catch (error) {
				return res.json({
					status: 500,
					message: 'An error occurred while updating User_Curriculum.'
				});
			}
		} else if (doc_type == 'compentencyLetter') {
			try {
				const file = await models.competency_letter.findOne({
					where: {
						id: doc_id
					}
				})
				if (file) {
					const fileDelete = await file.destroy()
					if (fileDelete) {
						return res.json({
							status: 200,
							data: fileDelete
						})
					}
				} else {
					return res.json({
						status: 400,
						message: 'File Not Deleted!!..'
					});
				}
			} catch (error) {
				return res.json({
					status: 500,
					message: 'An error occurred while updating competency_letter.'
				});
			}
		} else if (doc_type == 'NameChangeDocument') {
			try {
				const user = await models.Letterfor_NameChange.findOne({
					where: {
						id: req.query.id
					}
				});
				if (user) {
					const del = await user.update({
						file_name: null,
						name: null
					});
					if (del) {
						return res.json({
							status: 200,
						});
					}
				}
			} catch (error) {
				return res.json({
					status: 500,
					message: 'An error occurred while updating Letterfor_NameChange.'
				});
			}
		} else if (doc_type == 'PaymentIssue') {
			try {
				const user = await models.paymenterror_details.findOne({
					where: {
						user_id: req.User.id
					}
				})
				if (user) {
					const data = await user.destroy()
					if (data) {
						res.json({
							status: 200,
						})
					}
				}
			} catch (error) {
				return res.json({
					status: 500,
					message: 'An error occurred while updating paymenterror_details.'
				});
			}
		}
	} catch (error) {
		console.error("Error in /deleteDocument", error);
		return res.json({
			status: 500,
			message: "Internal Server Error"
		});
	}
})

/**
 * Delete the form of user based on parameters passed in the API request
 * @param {String} info_type - Type of the Form document
 * @param {Integer} userId - userId of the Form document
 * @param {Integer} doc_id - Id of the Document
 */
router.delete('/deleteInfo',middlewares.getUserInfo, async (req, res) => {
	try {
		const userId = req.User.id;
		const info_type = req.query.type;
		const doc_id = req.query.id;    
		 if (info_type == 'NameChangeletter') {
			try {
				const letter = await models.Letterfor_NameChange.findOne({
					where: {
						user_id: userId
					}
				})
				if (letter) {
					const data = await letter.destroy();
					if (data) {
						return res.json({
							status: 200
						})
					}
				}
			} catch (error) {
				return res.json({
					status: 500,
					message: 'An error occurred while updating GradeToPercentageLetter.'
				})
			}

		}else { 
				try {
					const instructional = await models.letter_details.findOne({
						where: {
							user_id: userId,
							id:doc_id,
							type:info_type
						}
					})
					if (instructional) { 
						const data = await instructional.destroy();
	
						if (data) { 
							return res.json({
								status: 200
							})
						}
					}
				} catch (error) {
					return res.json({
						status: 500,
						message: 'An error occurred while deleting Your Data.'
					});
				}
			} 
	} catch (error) {
		console.error("Error in /deleteInfo", error);
		return res.json({
			status: 500,
			message: "Internal Server Error"
		})
	}
})
/**
 * Fetched all the documents on ngonit
 */
router.get('/getUploadeddocument_student',middlewares.getUserInfo,async function (req, res) {
	var user_id = req.User.id;
	// var type = 'transcript';
	var app_id = null;
	var DocumentData = [];
	var marksheetData = [];
	var extraData = [];
	var transcriptData = [];
	var transcriptDisplay = [];
	var curriculumData = [];
	var gradtoperData = [];
	var unique_college = [];
	var Applied = await functions.getAppliedFor(user_id, app_id);
	if (Applied) {
		var uniqueData = await functions.getDistinctData(user_id);
		const uniqueValues = uniqueData.map((item) => item.dataValues.uniqueValues);
		for (var i = 0; i < uniqueValues.length; i++) {
			college = await functions.getCollegeDetails_student(uniqueValues[i]);
			transcriptDisplay.push({ 'coursename': college[0].coursename, 'college': college[0].college, 'collegeid': college[0].collegeid, 'faculty': college[0].faculty, 'education_type': college[0].education_type, 'pattern': college[0].pattern });
		}
		var marksheet = await functions.getDocumentFuntion(user_id, app_id, 'marklist');
		if (marksheet.length > 0) {
			for (var i = 0; i < marksheet.length; i++) {
				college = await functions.getCollegeName(marksheet[i].collegeId);
				marksheetData.push({
					'name': marksheet[i].name,
					'CollegeName': college ? college.name : 'null',
					'filePath': constant.FILE_LOCATION + 'public/upload/' + 'marklist' + '/' + user_id + '/' + marksheet[i].file_name,
					'fileName': marksheet[i].file_name,
					'extension':marksheet[i].file_name ? marksheet[i].file_name.split('.').pop(): 'null',
					'id': marksheet[i].id,
					'user_id': marksheet[i].user_id,
					'app_id': marksheet[i].app_id,
					'upload_step': marksheet[i].upload_step,
					'lock_transcript': marksheet[i].lock_transcript
				})
			}
			var uniqueData = await functions.getCollegeName_unique(user_id);
			const uniqueValues = uniqueData.map((item) => item.dataValues.uniqueValues);
			for (var i = 0; i < uniqueValues.length; i++) {
				college = await functions.getCollegeDetails_unique(uniqueValues[i]);
				unique_college.push(college)
			}

		}
		if (Applied.educationalDetails == true) {
			var transcript = await functions.getDocumentFuntion(user_id, app_id, 'transcript');
			if (transcript) {
				if (transcript.length > 0) {
					for (var i = 0; i < transcript.length; i++) {
						college = await functions.getCollegeName(transcript[i].collegeId);
						transcriptData.push({
							'name': transcript[i].name,
							'CollegeName': college ? college.name : 'null',
							'filePath': constant.FILE_LOCATION + 'public/upload/' + 'transcript' + '/' + user_id + '/' + transcript[i].file_name,
							'fileName': transcript[i].file_name,
							'extension': transcript[i].file_name ? transcript[i].file_name.split('.').pop() : 'null',
							'id': transcript[i].id,
							'user_id': transcript[i].user_id,
							'app_id': transcript[i].app_id,
							'upload_step': transcript[i].upload_step,
							'lock_transcript': transcript[i].lock_transcript
						})
					}
				};
			}
		}
		if (Applied.curriculum == true) {
			var curriculum = await functions.getDocumentFuntion(user_id, app_id, 'curriculum');
			if ( curriculum && curriculum.length > 0) {
				for (var i = 0; i < curriculum.length; i++) {
					college = await functions.getCollegeName(curriculum[i].collegeId);
					curriculumData.push({
						'name': curriculum[i].name,
						'CollegeName': college ? college.name : 'null',
						'filePath': constant.FILE_LOCATION + 'public/upload/' + 'curriculum' + '/' + user_id + '/' + curriculum[i].file_name,
						'fileName': curriculum[i].file_name,
						'extension':curriculum[i].file_name ? curriculum[i].file_name.split('.').pop() : 'null',
						'id': curriculum[i].id,
						'user_id': curriculum[i].user_id,
						'app_id': curriculum[i].app_id,
						'upload_step': curriculum[i].upload_step,
						'lock_transcript': curriculum[i].lock_transcript
					})
				}
			}
		}
		if (Applied.instructionalField == true) {

		}
		if (Applied.gradToPer == true) {
			var gradtoper = await functions.getDocumentFuntion(user_id, app_id, 'GradeToPercentageLetter');
			if ( gradtoper && gradtoper.length > 0) {
				for (var i = 0; i < gradtoper.length; i++) {
					college = await functions.getCollegeName(gradtoper[i].collegeId);
					gradtoperData.push({
						'name': gradtoper[i].name,
						'CollegeName': college ? college.name : 'null',
						'filePath': constant.FILE_LOCATION + 'public/upload/' + 'gradtoper' + '/' + user_id + '/' + gradtoper[i].file_name,
						'fileName': gradtoper[i].file_name,
						'extension': gradtoper[i].file_name ? gradtoper[i].file_name.split('.').pop() : 'null',
						'id': gradtoper[i].id,
						'user_id': gradtoper[i].user_id,
						'app_id': gradtoper[i].app_id,
						'upload_step': gradtoper[i].upload_step,
						'lock_transcript': gradtoper[i].lock_transcript
					})
				}
			}
		}
		if (Applied.affiliation == true) {

		}
		if (Applied.CompetencyLetter == true) {

		}
		if (Applied.LetterforNameChange == true) {

		}
		var extra = await functions.getDocumentFuntion(user_id, app_id, 'extra');
		if (extra) {
			if (extra.length > 0) {
				for (var i = 0; i < extra.length; i++) {
					college = await functions.getCollegeName(extra[i].collegeId);
					extraData.push({
						'name': extra[i].name,
						'filePath': constant.FILE_LOCATION + 'public/upload/' + 'extra' + '/' + user_id + '/' + extra[i].file_name,
						'fileName': extra[i].file_name,
						'extension': extra[i].file_name ? extra[i].file_name.split('.').pop() : 'null',
						'id': extra[i].id,
						'user_id': extra[i].user_id,
						'app_id': extra[i].app_id,
						'upload_step': extra[i].upload_step,
						'lock_transcript': extra[i].lock_transcript
					})
				}
				var uniqueData = await functions.getCollegeName_unique(user_id);
				const uniqueValues = uniqueData.map((item) => item.dataValues.uniqueValues);
				console.log(uniqueValues);
				for (var i = 0; i < uniqueValues.length; i++) {
					college = await functions.getCollegeDetails_unique(uniqueValues[i]);
					unique_college.push(college)
				}

			}
		}

		DocumentData.push(marksheetData, transcriptData, transcriptDisplay, unique_college, extraData, curriculumData, gradtoperData)
		res.json({ status: 200, data: DocumentData });
		} else {
			res.json({ status: 400 });
		}
})

/**
 * checkstepper route for students. Throws to the tab where the student has to filled its required details
 */
router.get('/checkstepper', middlewares.getUserInfo, async function (req, res) {
	var user_id = req.User.id;
	var app_id = req.query.app_id;
	if (app_id == 'null') { app_id = null };
	var obj = {};
	var obj_inner = {};
	var count = 0;
	var marksheets = 0;
	var transcript = 0;
	var curriculum = 0;
	var gradToPer = 0;
	obj['tab1'] = false,
		obj['tab2'] = false,
		obj['tab3'] = false

	obj_inner['tab1'] = false,
		obj_inner['tab2'] = false,
		obj_inner['tab3'] = false

	var appliedFor = await functions.getAppliedForDetails(user_id, app_id);
	if (appliedFor) {
		marksheets = await functions.getDocuments_checkstepper(user_id, app_id, 'marklist', '', '');
		transcript = await functions.getDocuments_checkstepper(user_id, app_id, 'transcript', '', '');
		instructional = await functions.getDocuments_checkstepper(user_id, app_id, 'instructional', '', '');
		curriculum = await functions.getDocuments_checkstepper(user_id, app_id, 'curriculum', '', '');
		gradToPer = await functions.getDocuments_checkstepper(user_id, app_id, 'GradeToPercentageLetter', '', '');
		affiliation = await functions.getDocuments_checkstepper(user_id, app_id, 'affiliation', '', '');

	// getDistinctData = await functions.getDistinctData(user_id);
	// const uniqueValues = getDistinctData.map((item) => item.dataValues.uniqueValues);
	// for (var i = 0; i < uniqueValues.length; i++) {
	// 	degree = uniqueValues[i].split('_')[0];
	// 	faculty = uniqueValues[i].split('_')[1];
	// 	if (appliedFor.educationalDetails == true) {
	// 		transcript = await functions.getDocuments_checkstepper(user_id, app_id, 'transcript', degree, faculty);
	// 	}
	// 	if (appliedFor.instructionalField == true) {
	// 		instructional = await functions.getDocuments_checkstepper(user_id, app_id, 'instructional', degree, faculty);
	// 	}
	// 	if (appliedFor.curriculum == true) {
	// 		curriculum = await functions.getDocuments_checkstepper(user_id, app_id, 'curriculum', degree, faculty);
	// 	}
	// 	if (appliedFor.gradToPer == true) {
	// 		gradToPer = await functions.getDocuments_checkstepper(user_id, app_id, 'GradeToPercentageLetter', degree, faculty);
	// 	}
	// 	if (appliedFor.affiliation == true) {
	// 		affiliation = await functions.getDocuments_checkstepper(user_id, app_id, 'affiliation', degree, faculty);
	// 	}
	// 	if (appliedFor.CompetencyLetter == true) {
	// 	}
	// 	if (appliedFor.LetterforNameChange == true) {
	// 	}
	// }

	require('async').series([
			function (callback) {
				if (appliedFor) {
					if ((appliedFor.isphd != null) && (appliedFor.instructionalField == true || appliedFor.curriculum == true || appliedFor.educationalDetails == true || appliedFor.gradToPer == true || appliedFor.affiliation == true || appliedFor.CompetencyLetter == true || appliedFor.LetterforNameChange == true)) {
						obj['tab1'] = true;
						count = count + 1;
						callback(null, appliedFor);
					} else {
						// if applied for details (1st step) is not completely filled. Stops to the first step.
						obj['tab1'] = false
						callback(null, appliedFor);
					}
				} else {
					obj['tab1'] = false
					callback(null, appliedFor);
				}


			},
			function (callback) {
				if (appliedFor.educationalDetails == true) {
					if (transcript && transcript.length > 0 ) { transcriptFlag = true } else { transcriptFlag = false }
				} else {
					transcriptFlag = true
				}

				if (appliedFor.instructionalField == true) {
					if (instructional.length > 0 ) { instructionalFieldFlag = true } else { instructionalFieldFlag = false }
				} else {
					instructionalFieldFlag = true
				}

				if (appliedFor.curriculum == true) {
					if (curriculum && curriculum.length > 0) { curriculumFlag = true } else { curriculumFlag = false }
				} else {
					curriculumFlag = true
				}

				if (appliedFor.gradToPer == true) {
					if (gradToPer && gradToPer.length> 0) { gradFlag = true } else { gradFlag = false }
				} else {
					gradFlag = true
				}

				if (appliedFor.affiliation == true) {
					if (affiliation.length > 0) { affiliationFlag = true } else { affiliationFlag = false }
				} else {
					affiliationFlag = true
				}

				if (appliedFor.CompetencyLetter == true) {
					// if(transcript.length >=  uniqueValues.length){transcriptFlag = true}else{transcriptFlag = false}
					competencyFlag = true
				} else {
					competencyFlag = true
				}

				if (appliedFor.LetterforNameChange == true) {
					// if(transcript.length >=  uniqueValues.length){transcriptFlag = true}else{transcriptFlag = false}
					LetterforNameChange = true
				} else {
					LetterforNameChange = true
				}

				if (transcriptFlag == true && instructionalFieldFlag == true && curriculumFlag == true && gradFlag == true && affiliationFlag == true && competencyFlag == true && LetterforNameChange == true) {
					obj['tab2'] = true;
					count = count + 1;
					callback(null, appliedFor);
				} else {
					obj['tab2'] = false
					callback(null, appliedFor);
				}
			},
			function (callback) {
				obj['tab3'] = false
				callback(null, appliedFor);
			},
		],
			function (err, result) {
				console.log('*********** obj ***********', obj);
				res.json({
					status: 200,
					message: 'Sending Tab Status',
					data: obj,
				});
			});
	
	}
	else {
		res.json({
			status: 400,
			message: 'Sending Tab Status',
			data: obj,
		});
	}

})
/**
 * checkstepper route for students. Throws to the tab where the student has to filled its required details, for 2nd step
 */
router.get('/checkstepper_inner',middlewares.getUserInfo, async function (req, res) {
	var user_id = req.User.id;
	var app_id = req.query.app_id;
	if (app_id == 'null') {app_id = null}
	var data = [];
	var obj = {};
	var obj_inner = {};
	var count = 0;
	var marksheets = 0;
	var transcript = 0;
	var curriculum = 0;
	var gradToPer = 0;
	var competency = 0;
	var Letterfor_NameChange = 0;
	var faculty;
	var degree;
	var educationalDetails = true;
	obj_inner['tab1'] = false, //marksheet
	obj_inner['tab2'] = false, // transcript
	obj_inner['tab3'] = false, // instruction
	obj_inner['tab4'] = false, // affiliation
	obj_inner['tab5'] = false, // Curriculum
	obj_inner['tab6'] = false,//GradeToPercentageLetter
	obj_inner['tab7'] = false // competency
	obj_inner['tab8'] = false //Letter For Mother Name on Marksheet Details
	// obj_inner['tab9'] = false

	var appliedFor = await functions.getAppliedForDetails(user_id, app_id);
	if (appliedFor) {
		marksheets = await functions.getDocuments_checkstepper(user_id, app_id, 'marklist', '', '');
		transcript = await functions.getDocuments_checkstepper(user_id, app_id, 'transcript', '', '');
		instructional = await functions.getDocuments_checkstepper(user_id, app_id, 'instructional', '', '');
		curriculum = await functions.getDocuments_checkstepper(user_id, app_id, 'curriculum', '', '');
		gradToPer = await functions.getDocuments_checkstepper(user_id, app_id, 'GradeToPercentageLetter', '', '');
		affiliation = await functions.getDocuments_checkstepper(user_id, app_id, 'affiliation', '', '');
		Letterfor_NameChange = await functions.getDocuments_checkstepper(user_id, app_id, 'Letterfor_NameChange', '', '');
		competency = await functions.getDocuments_checkstepper(user_id, app_id, 'competency', '', '');
		// getDistinctData = await functions.getDistinctData(user_id);
		// const uniqueValues = getDistinctData.map((item) => item.dataValues.uniqueValues);
	
		// for (var i = 0; i < uniqueValues.length; i++) {
		// 	degree = uniqueValues[i].split('_')[0];
		// 	faculty = uniqueValues[i].split('_')[1];
		// 	if (appliedFor.educationalDetails == true) {
		// 		transcript = await functions.getDocuments_checkstepper(user_id, app_id, 'transcript', degree, faculty);
		// 	}
		// 	if (appliedFor.instructionalField == true) {
		// 		instructional = await functions.getDocuments_checkstepper(user_id, app_id, 'instructional', degree, faculty);
		// 	}
		// 	if (appliedFor.curriculum == true) {
		// 		curriculum = await functions.getDocuments_checkstepper(user_id, app_id, 'curriculum', degree, faculty);
		// 	}
		// 	if (appliedFor.gradToPer == true) {
		// 		gradToPer = await functions.getDocuments_checkstepper(user_id, app_id, 'GradeToPercentageLetter', degree, faculty);
		// 	}
		// 	if (appliedFor.affiliation == true) {
		// 		affiliation = await functions.getDocuments_checkstepper(user_id, app_id, 'affiliation', degree, faculty);
		// 	}
		// 	if (appliedFor.CompetencyLetter == true) {
		// 	}
		// 	if (appliedFor.LetterforNameChange == true) {
		// 	}
		// }

		require('async').series([
			// for marksheets
			function (callback) {
				
				if (marksheets.length > 0) {
					obj_inner['tab1'] = true;
					count = count + 1;
					callback(null, appliedFor);
				} else {
					obj_inner['tab1'] = false;
					callback(null, appliedFor);
				}
			},
			// for transcripts
			function (callback) {
				
				if (appliedFor.educationalDetails == true) {
					if (transcript && transcript.length > 0) {
						obj_inner['tab2'] = true;
						count = count + 1;
						callback(null, appliedFor);
					} else {
						obj_inner['tab2'] = false;
						callback(null, appliedFor);
					}
				} else {
					obj_inner['tab2'] = true;
					count = count + 1;
					callback(null, appliedFor);
				}
			},
			// Instructional Details
			function (callback) {
			
				if (appliedFor.instructionalField == true) {
					if (instructional.length > 0) {
						obj_inner['tab3'] = true;
						count = count + 1;
						callback(null, appliedFor);
					} else {
						obj_inner['tab3'] = false
						callback(null, appliedFor);
					}
				} else {
					obj_inner['tab3']= true;
					count = count + 1;
					callback(null, appliedFor);
				}
			},
			// Affiliation details
			function (callback) {
				
				if (appliedFor.affiliation == true) {
					if (affiliation.length > 0) {
						obj_inner['tab4'] = true;
						count = count + 1;
						callback(null, appliedFor);
					} else {
						obj_inner['tab4'] = false
						callback(null, appliedFor);
					}
				} else {
					obj_inner['tab4']= true;
					count = count + 1;
					callback(null, appliedFor);
				}
			},
			//Curriculum
			function (callback) {
				
				if (appliedFor.curriculum == true) {
					if (curriculum && curriculum.length > 0) {
						obj_inner['tab5'] = true;
						count = count + 1;
						callback(null, appliedFor);
					} else {
						obj_inner['tab5'] = false
						callback(null, appliedFor);
					}
				} else {
					obj_inner['tab5'] = true;
					count = count + 1;
					callback(null, appliedFor);
				}
			},
			// GradeToPercentageLetter
			function (callback) {
				
				if (appliedFor.gradToPer == true) {
					if (gradToPer && gradToPer.length > 0) {
						obj_inner['tab6'] = true;
						count = count + 1;
						callback(null, appliedFor);
					} else {
						obj_inner['tab6'] = false
						callback(null, appliedFor);
					}
				} else {
					obj_inner['tab6'] = true;
					count = count + 1;
					callback(null, appliedFor);
				}
			},
			//competency
			function (callback) {
				
				if (appliedFor.CompetencyLetter == true) {
					if (competency && competency.length > 0) {
						obj_inner['tab7'] = true;
						count = count + 1;
						callback(null, appliedFor);
					} else {
						obj_inner['tab7'] = false
						callback(null, appliedFor);
					}
				} else {
					obj_inner['tab7'] = true;
					count = count + 1;
					callback(null, appliedFor);
				}
			},
			//Letter For Mother Name on Marksheet Details
			function (callback) {
				
				if (appliedFor.LetterforNameChange == true) {
					if (Letterfor_NameChange && Letterfor_NameChange.length > 0) {
						obj_inner['tab8'] = true;
						count = count + 1;
						callback(null, appliedFor);
					} else {
						obj_inner['tab8'] = false
						callback(null, appliedFor);
					}
				} else {
					obj_inner['tab8']= true;
					count = count + 1;
					callback(null, appliedFor);
				}
			},
			// function (callback) {
			// 	obj_inner['tab9'] = false
			// 	callback(null, appliedFor);
			// }
		],
			function (err, result) {
				console.log('*********** obj_inner ***********', obj_inner);
				res.json({
					status: 200,
					message: 'Sending Tab Status',
					data: obj_inner,
				});
			});
	} 
	else {
		res.json({
			status: 400,
			message: 'Sending Tab Status',
			data: obj_inner,
		});
	}
})

/**
 *  Country Details
 */
router.get('/getCountry', async function (req, res) {
	var country = await functions.getCountry();
	if (country) {
		res.json({ status: 200, data: country })
	} else {
		res.json({ status: 400 })
	}
})

/**
 *  captcha for registration
 */
router.get('/captcha', function (req, res) {
	var captcha = svgCaptcha.create();
	var data = {
		captchadata: captcha.data,
		captchaText: captcha.text
	}
	res.send({
		status: 200,
		data: data,
		type: 'svg'
	});

});

/**
 * Add the Payment Issue Details.
 * @param {String} data - All data get from stundet
 */
router.post('/savePaymentIssueData',middlewares.getUserInfo, async (req, res) => {
	try {
		var user_id = req.User.id;
		var values = req.body.data;
		var type = 'paymentIssue'
		var Date = moment(values.paymentdateCtrl).format('DD/MM/YYYY');


			const userCreated = await models.paymenterror_details.create({
				user_id: user_id,
				file_name: values.filename,
				email: values.emailCtrl,
				transaction_id: values.transactionCtrl,
				date: Date,
				order_id: values.ordeidCtrl,
				bank_refno: values.bankrefCtrl,
				amount: values.amountCtrl,
				note: values.noteCtrl,
				name: 'Payment Not Reflecting',
			});

			if (userCreated) {
				res.json({ status: 200 })
			}
	} catch (err) {
		console.error(err);
		return res.status(500).json({
			status: 500,
			message: `Internal server error.`,
			error: err.message
		});
	}
})

/**
 * Get Route of user Payment Issue Details.
 */
router.get('/getPaymentIssueData', middlewares.getUserInfo, async (req, res) => {
	var userId = req.User.id;
	var user_type = req.query.user_type;
	var tracker = req.query.tracker;
	var payerror = [];
	try {
		if (user_type == 'student') {
			var user = await models.paymenterror_details.findAll({
				where: {
					user_id: userId,
				}
			})

			if (user) {
				user.forEach(async function (paymenterror) {
					var extension = paymenterror.file_name.split('.').pop();
					payerror.push({
						id: paymenterror.id,
						name: paymenterror.name,
						filePath: constant.BASE_URL + "/api/upload/paymentIssue/" + userId + "/" + paymenterror.file_name,
						extension: extension,
						fileName: paymenterror.file_name,
						date: paymenterror.date,
						transaction_id: paymenterror.transaction_id,
						bank_refno: paymenterror.bank_refno,
						tracker: paymenterror.tracker,
						order_id: paymenterror.order_id,
						user_id: paymenterror.user_id,
						amount: paymenterror.amount,
						note: paymenterror.note,
						email: paymenterror.email,
						tracker: paymenterror.tracker,
						notes: paymenterror.note,
						admin_notes: paymenterror.admin_notes,
					})
				})
			} else {
				res.json({
					status: 400,
					message: 'Something went wrong!'
				});
			}
		} else {
			var user = await models.paymenterror_details.findAll({
				where:{
					tracker: tracker,
				}
			});

			if (user) {
				user.forEach(async function (paymenterror) {
					var extension = paymenterror.file_name.split('.').pop();
					payerror.push({
						id: paymenterror.id,
						name: paymenterror.name,
						filePath: constant.BASE_URL + "/api/upload/paymentIssue/" + paymenterror.user_id + "/" + paymenterror.file_name,
						extension: extension,
						fileName: paymenterror.file_name,
						date: paymenterror.date,
						transaction_id: paymenterror.transaction_id,
						bank_refno: paymenterror.bank_refno,
						tracker: paymenterror.tracker,
						order_id: paymenterror.order_id,
						user_id: paymenterror.user_id,
						amount: paymenterror.amount,
						note: paymenterror.note,
						email: paymenterror.email,
						tracker: paymenterror.tracker,
						notes: paymenterror.note,
						admin_notes: paymenterror.admin_notes,
					})
				})
			}else {
				res.json({
					status: 400,
					message: 'Something went wrong!'
				});
			}
		}

		if(payerror.length > 0){
			res.json({
				status: 200,
				data: payerror
			});
		}else{
			res.json({
				status: 400,
			});
		}
	} catch (error) {
		console.error("Error in getPaymentIssueData", error);
		return res.status(500).json({
			status: 500,
			message: "Internal Server Error"
		});
	}
})

router.get('/getMyApplicationData', middlewares.getUserInfo, async (req, res) => {
	console.log('/getMyApplicationData');

	var user_id = req.User.id;
	var applicationData = [];

	var applicationDetails = await functions.getApplicationsData(user_id);

	if (applicationDetails.length > 0) {
		for (let application of applicationDetails) {

			//marksheets errata
			var marksheetErrata = await functions.getErrataInMarksheets(application.user_id, application.id, 1);

			if (marksheetErrata.length > 0) {
				var marksheetsErrata = true;
			}

			//transcripts errata
			var trascriptErrata = await functions.getErrataInTranscripts(application.user_id, application.id, 1);

			if (trascriptErrata.length > 0) {
				var transcriptsErrata = true;
			}

			//instructional errata
			var instructionalErrata = await functions.getErrataInInstructionalAndAffiliation(application.user_id, application.id, 1, 'instructional');
			if (instructionalErrata.length > 0) {
				var instructionalsErrata = true;
			}

			//curriculum errata
			var curriculumErrata = await functions.getErrataInCurriculums(application.user_id, application.id, 1);

			if (curriculumErrata.length > 0) {
				var curriculumsErrata = true;
			}

			//gradtoper errata
			var gradetoperErrata = await functions.getErrataInGradtoper(application.user_id, application.id, 1);

			if (gradetoperErrata.length > 0) {
				var gradetopersErrata = true;
			}

			//affiliation errata
			var affiliationErrata = await functions.getErrataInInstructionalAndAffiliation(application.user_id, application.id, 1, 'affiliation');

			if (affiliationErrata.length > 0) {
				var affiliationsErrata = true;
			}

			//competency errata
			var competencyErrata = await functions.getErrataInCompetency(application.user_id, application.id, 1);

			if (competencyErrata.length > 0) {
				var competencysErrata = true;
			}

			//letter for name change errata
			var letterfornamechangeErrata = await functions.getErrataInLetterForNameChange(application.user_id, application.id, 1);

			if (letterfornamechangeErrata.length > 0) {
				var letterfornamechangesErrata = true;
			}

			//name change proof errata
			var namechangeproofErrata = await functions.getErrataInNameChangeProof(application.user_id, application.id, 1, 'extra_document');

			if (namechangeproofErrata.length > 0) {
				var namechangeproofsErrata = true;
			}

			//educational details
			var applied_for_details = await functions.getAppliedForDetails(application.user_id, application.id);

			//purpose details
			var purpose_details = await functions.getInstituteDataAll(application.user_id, application.id);

			applicationData.push({
				id: application.id,
				tracker: application.tracker,
				status: application.status,
				created_at: application.created_at ? moment(new Date(application.created_at)).format("DD-MM-YYYY") : '',
				appliedData: applied_for_details,
				purposeData: purpose_details,
				marksheetsErrata: marksheetsErrata ? marksheetsErrata : null,
				transcriptsErrata: transcriptsErrata ? transcriptsErrata : null,
				instructionalsErrata: instructionalsErrata ? instructionalsErrata : null,
				curriculumsErrata: curriculumsErrata ? curriculumsErrata : null,
				gradetopersErrata: gradetopersErrata ? gradetopersErrata : null,
				affiliationsErrata: affiliationsErrata ? affiliationsErrata : null,
				competencysErrata: competencysErrata ? competencysErrata : null,
				letterfornamechangesErrata: letterfornamechangesErrata ? letterfornamechangesErrata : null,
				namechangeproofsErrata: namechangeproofsErrata ? namechangeproofsErrata : null,
			})
		}

		if (applicationData.length > 0) {
			return res.json({
				status: 200,
				data: applicationData,
			})
		} else {
			return res.json({
				status: 400
			})
		}
	} else {
		return res.json({
			status: 400
		})
	}
})

router.get('/getEducationalDetails',middlewares.getUserInfo, async (req, res) => {
	console.log('/getEducationalDetails');
	user_id = req.User.id;

	var applied_for_details = await functions.getAppliedForDetails(user_id, null)

	if (applied_for_details) {
		return res.json({
			status: 200,
			data: applied_for_details
		})
	} else {
		return res.json({
			status: 400,
			data: applied_for_details
		})
	}
})


/**getProfilevalue Route to get user profile Data */
router.get('/getProfileValue',middlewares.getUserInfo, async (req, res) => {
	try{
		const userId=req.User.id;
		const view_data={};

		const user = await functions.getUser(userId);
		if(user){
			const orders = await functions.getOrders(userId);

			if(orders){
				if(orders.length > 0){
					view_data.amount_paid = true;
				}else{
					view_data.amount_paid = false;
				}
			}
			view_data.profile = user;
			return res.json({
				status:200,
				data:view_data
			})
		}else{
			return res.json({
				status:400,
				message:'User Not found!'
			})	
		}
	}catch(error){
		console.error("Error in /getProfileValue", error);
		return res.json({
			status: 500,
			message: "Internal Server Error"
		})
	} 
})

/**updateProfile Route to update user profile Data */
router.post('/updateProfile',middlewares.getUserInfo, async (req, res) => {
	try{
		console.log("req.body",req.body.data.username);
		const userId = req.User.id;
		const username = req.body.data.username;
		const surname = req.body.data.surname;
		const gender = req.body.data.gender; 
		const email = req.body.data.email;  
		const mobile_country_code = req.body.data.mobile_country_code;
		const mobile = req.body.data.mobile; 
		const whatsappCountryCode = req.body.data.whatsappCountryCode || req.body.data.mobile_country_code;
		const whatsappMobile = req.body.data.whatsappMobile ||  req.body.data.mobile;

		const user = await functions.getUser(userId);
		if(user){
			const profileUpdated = await user.update({
				name: username,
				surname: surname,
				gender: gender,
				email:email,  
				mobile_country_code: mobile_country_code, 
				mobile: mobile,
				what_mobile_country_code: whatsappCountryCode,
				what_mobile: whatsappMobile,
			})
			if(profileUpdated){
				return res.json({
					status: 200,
					message: 'User Profile Successfully Updated !'
				});
			}else{
				return res.json({
					status: 400,
					message: 'User Profile Not Updated !'
				});
			}
		}
	}catch(error){
		console.error("Error in /getProfileValue", error);
		return res.json({
			status: 500,
			message: "Internal Server Error"
		})
	}
})

/**ChangePassword Route to change the password of user itself */
router.post('/changePassword',middlewares.getUserInfo, async(req,res)=>{ 
	console.log("changePassword");
	try{
		const userId = req.User.id;
		const passwords = req.body.data; 

		const User = await functions.getUser(userId);

		if(User){
			const passwordUpdated = await User.update({
				password: passwords
			});
			if(passwordUpdated){
				return res.json({
					status:200,
					message:"Password Changed successfully!"
				})
			}else{
				return res.json({
					status:400,
					message:"Password Not Changed!"
				})	
			}
		}else{
			return res.json({
				status:400,
				message:"something Went wrong!"
			})	
		}
	}catch(error){
		console.error("Error in /changePassword", error);
		return res.json({
			status: 500,
			message: "Internal Server Error"
		})	
	}
})

router.post('/forgotPasswordSendEmailToUser', (req, res)=>{
	console.log('/forgotPasswordSendEmailToUser');	
})

/**getNotification route to get data of user Notification. */
router.get('/getNotification',middlewares.getUserInfo, async (req,res) => { 
	try{
	 const userId = req.User.id; 
	 const notification = await models.Notifications.findAll({
		 where:{
			user_id:userId,
		 }
	 })  
	 const notificationsWithTimeAgo = notification.map((item) => {
		 const createdAt = item.dataValues.created_at;
		 const timeAgo = moment(createdAt).fromNow(); // Calculate the time difference
		 return {
		   ...item.dataValues,
		   timeAgo,
		 };
	   }); 
	 if(notification){
		 return res.json({
			 status:200,
			 data:notificationsWithTimeAgo
		 })
	 }else{
		 return res.json({
			 status:400
		 })
	 }
 
	}catch(error){
	 console.error("Error in /changePassword", error);
	 return res.json({
		 status: 500,
		 message: "Internal Server Error"
	 })	
	}
 })
 
 /**markASRead route to update the read state true */
 router.post('/markAsRead', middlewares.getUserInfo, async (req, res) => {
	 try {
	   const userId = req.User.id;
	   const notifications = await models.Notifications.findAll({
		 where: {
		   user_id: userId,
		 },
	   });
   
	   if (notifications && notifications.length > 0) {
		 // Loop through all notifications and update each one individually
		 for (const notification of notifications) {
		   await notification.update({
			 read: true,
		   });
		 }
	   }
   
	   return res.json({
		 status: 200,
		 message: "Notifications marked as read successfully",
	   });
	 } catch (error) {
	   console.error("Error in /markAsRead", error);
	   return res.status(500).json({ 
		 message: "Internal Server Error",
	   });
	 }
   }); 

   /* Author : Prathmesh Pawar
Route : educationalDetails - create & update educational details of step 1.
Paramater : app_id of student */
router.get('/getDownloadPaymentReceipt', middlewares.getUserInfo, async (req, res) => {
	console.log('/getDownloadPaymentReceipt');

	var user_id = req.User.id;
	var app_id = req.query.app_id;
	var user_email = req.User.email;

	var filePath = constant.FILE_LOCATION + 'public/upload/transcript/' + user_id + '/' + app_id + '_Attestation_Payment_Challan.pdf';

	if (fs.existsSync(filePath)) {
		return res.json({
			status: 200,
			data: filePath,
		})
	} else {
		var orderDetails = await functions.getOrderDetails(user_id, app_id);

		if (orderDetails) {
			var transctionDetails = await functions.getTrasactionDetails(orderDetails.id);

			if (transctionDetails) {
				self_PDF.online_payment_challan(user_id, app_id, transctionDetails.amount, transctionDetails.merchant_param5, transctionDetails.created_at, transctionDetails.order_status, orderDetails.id, user_email, function (err) {
					if (err) {
						return res.json({
							status: 400,
							message: "Something Went wrong!"
						})
					} else {
						return res.json({
							status: 200,
							data: filePath,
						})
					}
				})
			} else {
				return res.json({
					status: 400,
					message: "Something Went wrong!"
				})
			}
		} else {
			return res.json({
				status: 400,
				message: "Something Went wrong!"
			})
		}
	}
})

module.exports = router;
