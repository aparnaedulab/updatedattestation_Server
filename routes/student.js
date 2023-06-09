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
								} else { }

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

/* Author : Prathmesh Pawar
Route : educationalDetails - create & update educational details of step 1.
Paramater : formdata and user_id of student */
router.post('/educationalDetails', async (req, res) => {
	console.log("/educationalDetails");

	var user_id = req.body.user_id;

	var applied_for_details = await functions.getAppliedForDetails(user_id, null);

	if (applied_for_details) {
		var updatedAppliedDetails = await functions.getUpdatedEducationalDetails(user_id, req.body.formdata);
		if (updatedAppliedDetails) {
			res.json({
				status: 200,
				message: "updated"
			})
		}
	}
	else {
		var createdAppliedDetails = await functions.getCreateEducationalDetails(user_id, req.body.formdata);
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
router.get('/getPurposeList', async (req, res) => {
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
router.post('/updateAllInstitute', async (req, res) => {
	console.log('/updateAllInstitute');

	var formData = req.body.formData;
	var email = req.body.formData.emails;
	var emailArr;
	var anotherEmailArr;
	var anotherEmail;
	var user_id = req.body.user_id;
	var amount;
	var app_id = req.body.app_id;
	var type = req.body.type;
	var institute_id = req.body.institute_id;
	var function_type = req.body.function_type;
	var admin_id = req.body.admin_id;
	var admin_email = req.body.admin_email;
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
			var createActivityTrackerAdd = await functions.getCreateActivityTrackerAdd(user_id, user_email, formData.type, app_id);

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
		var updateInstitute = await functions.getUpdateInstitution(formData, emailArr, user_id, type, app_id, anotherEmailArr, anotherEmail, institute_id);

		if (updateInstitute == true) {
			if (user_type == 'student') {
				var createActivityTrackerUpdate = await functions.getCreateActivityTrackerUpdate(user_id, user_email, formData.type, app_id);
			} else {
				var createActivityTrackerUpdate = await functions.getCreateActivityTrackerUpdate(admin_id, admin_email, formData.type, app_id);
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
	}
})

/* Author : Prathmesh Pawar
Route : deleteInstituteHrd - delete both purpose records all institute as well as hrd.
Paramater : institute_id, purpose_name and user_id of student */
router.post('/deleteInstituteHrd', async (req, res) => {
	console.log('/deleteInstitute');

	var institute_id = req.body.institute_id;
	var purpose_name = req.body.purpose_name;
	var user_id = req.body.user_id;

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
router.get('/getInstituteData', async (req, res) => {
	console.log('/getInstituteData');

	var purpose_name = req.query.purpose_name;
	var app_id = req.query.app_id;
	var user_id = req.query.user_id;
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
		var getInstituteData = await functions.getInstituteDataAll(user_id, null);
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
router.get('/getAppliedDetails', async (req, res) => {
	console.log('/getAppliedDetails');

	var user_id = req.query.user_id;
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
router.get('/getHrdInfo', async (req, res) => {
	console.log('/getHrdInfo');

	var user_id = req.query.user_id;
	var degree_type = req.query.degree_type;
	var data = [];
	let encounteredFaculties = {};
	var faculty_types = req.query.faculty_type;
	var app_id = req.query.app_id;

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
				pattern: item.pattern,
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
router.post('/updateAllHrd', async (req, res) => {
	console.log('/updateAllHrd');

	var formData = req.body.formData;
	var user_id = req.body.user_id;
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
					var createActivityTrackerAdd = await functions.getCreateActivityTrackerAdd(user_id, user_email, formData.course_name, app_id);

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

		if (updateHrd.length == true) {
			if (user_type == 'student') {
				var createActivityTrackerUpdate = await functions.getCreateActivityTrackerUpdate(user_id, user_email, formData.course_name, app_id);
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
router.get('/getHrdData', async (req, res) => {
	console.log('/getHrdData');

	var user_id = req.query.user_id;
	console.log('/user_id', user_id);
	var hrd_id = req.query.hrd_id;
	console.log('/hrd_id', hrd_id);
	var purpose_name = req.query.purpose_name;
	var app_id = req.query.app_id;
	console.log('/app_id', app_id);

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
router.get('/preViewApplication', async (req, res) => {
	console.log('/preViewApplication');

	var user_id = req.query.user_id;
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

	//educational details
	var applied_for_details = await functions.getAppliedForDetails(user_id, null);

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
	var getApplied = await functions.getAppliedDetails(user_id, null);

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
	var getTranscripts = await functions.getUserTrascripts(user_id, null);

	getTranscripts.forEach(function (transcripts) {
		extension = transcripts.file_name.split('.').pop();

		transcriptsData.push({
			name: transcripts.name,
			filePath: constant.BASE_URL + "/api/upload/transcript/" + user_id + "/" + transcripts.file_name,
			extension: extension,
		})
	})

	//instructional
	var getInstructional = await functions.getUserInstructional(user_id, null);

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

	//curriculum
	var getCurriculum = await functions.getUserCurriculum(user_id, null);

	getCurriculum.forEach(function (curriculum) {
		extension = curriculum.file_name.split('.').pop();

		curriculumData.push({
			name: curriculum.name,
			filePath: constant.BASE_URL + "/api/upload/curriculum/" + user_id + "/" + curriculum.file_name,
			extension: extension,
		})
	})

	//gradetoper
	var getGradtoper = await functions.getUserGradtoper(user_id, null);

	getGradtoper.forEach(function (gradtoper) {
		extension = gradtoper.file_name.split('.').pop();

		gradtoperData.push({
			name: gradtoper.name,
			filePath: constant.BASE_URL + "/api/upload/gradeToPercentLetter/" + user_id + "/" + gradtoper.file_name,
			extension: extension,
		})
	})

	//affiliation
	var getAffiliation = await functions.getUserAffiliation(user_id, null);

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

	//competency
	var getCompetency = await functions.getUserCompetency(user_id, null);

	getCompetency.forEach(function (competency) {
		extension = competency.file_name.split('.').pop();

		competencyData.push({
			name: competency.name,
			filePath: constant.BASE_URL + "/api/upload/CompetencyLetter/" + user_id + "/" + competency.file_name,
			extension: extension,
		})
	})

	//letter for name change
	var getLetterfornamechange = await functions.getUserLetterfornamechange(user_id, null);

	extension = getLetterfornamechange[0].file_name.split('.').pop();

	letterfornamechangeData.push({
		name: getLetterfornamechange[0].name,
		filePath: constant.BASE_URL + "/api/upload/NameChangeLetter/" + user_id + "/" + getLetterfornamechange[0].file_name,
		extension: extension,
		firstnameaspermarksheet: getLetterfornamechange[0].firstnameaspermarksheet,
		fathersnameaspermarksheet: getLetterfornamechange[0].fathersnameaspermarksheet,
		mothersnameaspermarksheet: getLetterfornamechange[0].mothersnameaspermarksheet,
		lastnameaspermarksheet: getLetterfornamechange[0].lastnameaspermarksheet,
		firstnameasperpassport: getLetterfornamechange[0].firstnameasperpassport,
		fathersnameasperpassport: getLetterfornamechange[0].fathersnameasperpassport,
		lastnameasperpassport: getLetterfornamechange[0].lastnameasperpassport,
	})

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

	console.log('preViewApplication--============================----', preViewApplication);

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
router.get('/getuploadedCurriculum', async (req, res) => {
	const userId = req.query.user_id;
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
router.get('/getExtraDocuments', async (req, res) => {
	try {
		const data = [];
		const userId = req.query.user_id;
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
 * Fetch Details such as college course patteren and upload documents.
 */
router.post('/ScanData', async (req, res) => {
	try {
		var user_id = req.query.user_id;
		var app_id = req.query.app_id;
		var type = req.query.value;
		var education_type = req.query.education_type;
		var collegeid = req.query.collegeid;
		var patteren = req.query.patteren;
		var faculty = req.query.faculty;
		var dir = constant.FILE_LOCATION + "public/upload/" + type +'/' + user_id;
		var image;
			if (!fs.existsSync(dir)) {
				fs.mkdirSync(dir);
			}
			var storage = multer.diskStorage({
				destination: function(req, file, callback) {
					callback(null, constant.FILE_LOCATION + "public/upload/" + type +'/' + user_id);
				},
				filename: function(req, file, callback) {
					var extension = path.extname(file.originalname)
					var randomString = functions.generateRandomString(10,'alphabetic')
					var newFileName = randomString.concat(extension);
					image = newFileName;
					callback(null, newFileName);
				}
			});

			var upload = multer({
				storage: storage,
			}).single('file');
			upload(req, res,async function (err, data) {
				imageLocationToCallClient = image;
				var uploadDocuments = await functions.uploadDocuments(patteren,collegeid,education_type,faculty,user_id,type,imageLocationToCallClient);
				if(uploadDocuments){
					if(type == 'marklist'){
						var data = tesseract.recognize(constant.FILE_LOCATION  + 'public/upload/' + type+'/'+ user_id +  '/' +   image,config).then(async (text_data) => {
							// if(text_data){
							var getCollege = await functions.getCollegeList();
							var getCourse = await functions.getProgramList();
							var str = text_data.replace(/(\r\n|\n|\r)/gm, "");
							var text = str.replace('&', 'and');
							var collegeName;
							var courseName;
							var patteren;
							var whichduration;
							var data = [];
							getCollege.forEach(function (college) {
								if (text.includes(college.name)) {
									collegeName =  college.name
								}
							})
							if(text.includes('semester') || text.includes('Semester') ){
								patteren = 'Semester'
								if(text.includes('I')){
									whichduration = 'Semester 1'
								}
								if(text.includes('II')){
									whichduration = 'Semester 2'
								}
								if(text.includes('III')){
									whichduration = 'Semester 3'
								}
								if(text.includes('IV')){
									whichduration = 'Semester 4'
								}
								if(text.includes('V')){
									whichduration = 'Semester 5'
								}
								if(text.includes('VI')){
									whichduration = 'Semester 6'
								}
								if(text.includes('VII')){
									whichduration = 'Semester 7'
								}
								if(text.includes('VIII')){
									whichduration = 'Semester 8'
								}
								if(text.includes('IX')){
									whichduration = 'Semester 9'
								}
								if(text.includes('X')){
									whichduration = 'Semester 10'
								}
							}else{
								patteren = 'Annual'
								if(text.includes('F.Y')){
									whichduration = 'First Year'
								}
								else if(text.includes('S.Y')){
									whichduration = 'Second Year'
								}
								else if(text.includes('T.Y')){
									whichduration = 'Third Year'
								}
							}
							getCourse.forEach(function (course) {
								if (text.includes(course.short_name)) {
									courseName =  course.full_name
								}
							})
							data.push(collegeName,courseName,whichduration,uploadDocuments.id);
							res.json({
								data : data,
								status : 200
							})
						}).catch((error) => {console.log('**********error.message***************', error.message)});
					}else{
						res.json({
							status : 200
						})
					}
				}else{
					
					res.json({
						status : 400
					})
				}
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
router.get('/getNameChangeData', async (req, res) => {
	const userId = req.query.user_id
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
router.get('/getletterDetails', async (req, res) => {
	try {
		const userId = req.query.user_id;
		// const appId = req.query.app_id;
		const degreeValue = req.query.degrees;
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
router.get('/getInstructionalForms', async (req, res) => {
	try {
		const userId = req.query.user_id;
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
router.get('/getAppliedUserDetail', async (req, res) => {
	try {
		const userId = req.query.user_id;
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
		console.error("Error in getAppliedUserDetail", error);
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
router.post('/upload_gradeToPercentLetter', async (req, res) => {
	try {
		const userId = req.query.user_id;
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
router.post('/saveUserMarkList', upload.single('file'), async (req, res) => {
	try {
		let image;
		const file = req.file
		const userId = req.body.user_id
		const extension = path.extname(file.originalname)
		const randomString = functions.generateRandomString(10, 'alphabetic')
		const newFileName = randomString.concat(extension);
		image = newFileName;
		const doc_id = req.query.doc_id;
		const app_id = (req.query.app_id) ? req.query.app_id : null;
		const collegeId = req.body.college;
		const degree = req.body.degree;
		const semYear = req.body.semYearValue;
		const semYearValue = req.body.semYear
		const courseName = req.body.faculty;
		const name = degree + "_" + courseName + "_" + semYearValue;

		uploadValue = true;
		ValueUpdateData(uploadValue)
		async function ValueUpdateData(uploadValue) {
			if (uploadValue == true) {
				var fileStatus = false;
				const marklistUpload = await models.UserMarklist_Upload.findAll({
					where: {
						user_id: userId
					}
				})
				if (marklistUpload) {
					if (marklistUpload.length > 0) {
						marklistUpload.forEach(function (marklistData) {
							if (marklistData) {
								if (marklistData.file_name == image) {
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
							const marksheet_data = await models.UserMarklist_Upload.findOne({
								where: {
									user_id: userId,
									id: doc_id
								}
							})
							if (marksheet_data) {
								const userdata = await marksheet_data.update({
									file_name: image,
									lock_transcript: false,
									upload_step: "changed"
								})
								if (userdata) {
									return res.json({
										status: 200,
										message: `Upload Completed.`,
										data: userdata
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
								const userMarklist = await models.UserMarklist_Upload.create({
									name: degree + "_" + courseName + "_" + semYear,
									user_id: userId,
									file_name: image,
									lock_transcript: false,
									collegeId: collegeId,
									education_type: degree,
									pattern: semYear,
									faculty: courseName,
									upload_step: "default"
								})
								if (userMarklist) {
									return res.json({
										status: 200,
										message: `Upload Completed.`,
										data: userMarklist
									});
								} else {
									return res.json({
										status: 400,
										message: `Error occured in uploading document.`
									});
								}
							} else {
								const userMarklist = await models.UserMarklist_Upload.create({
									name: degree + "_" + courseName + "_" + semYear,
									user_id: userId,
									file_name: image,
									lock_transcript: false,
									collegeId: collegeId,
									education_type: degree,
									pattern: semYear,
									faculty: courseName,
									upload_step: "default"
								})
								if (userMarklist) {
									return res.json({
										status: 200,
										message: `Upload Completed.`,
										data: userMarklist
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
				fs.unlink(constant.FILE_LOCATION + 'public/upload/marklist/' + userId + '/' + image, function (err) {
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
 * Uploads the Transcript  document of user using multer and parameters passed in the URL.
 * @param {Integer} doc_id - ID of the user document
 * @param {Integer} userId - User ID of the user
 * @param {Integer} app_id - App ID of the user document
 * @param {String} transcript_name - Degree name of the user document
 * @param {String} transcript_doc - Type of the document
 * @param {Integer} collegeId - College ID of the document
 */
router.post('/upload_transcript', async (req, res) => {
	try {
		const userId = req.query.user_id;
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
router.post('/upload_curriculum', async (req, res) => {
	const userId = req.query.user_id;
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
router.post('/upload_CompetencyLetter', async (req, res) => {
	const userId = req.query.user_id;
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
router.post('/upload_letterforNameChange', async (req, res) => {
	const userId = req.query.user_id;
	console.log("id", userId);
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
router.post('/upload_letterforNameChange', async (req, res) => {
	const userId = req.query.user_id;
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
router.post('/saveLetterNameChangeData', async (req, res) => {
	try {
		const userId = req.body.user_id;

		const user = await models.Letterfor_NameChange.findOne({
			where: {
				user_id: userId
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

router.post('/saveInstructionalData', upload.none(), async (req, res) => {
	try {
		const doc_id = req.body.idCtrl;
		const name = req.body.name;
		const college = req.body.college;
		const course = req.body.course;
		const specialization = req.body.specialization;
		const division = req.body.division;
		const duration = req.body.duration;
		const yearOfpassing = req.body.yearOfpassing;
		const education = req.body.education
		const user_id = req.body.user_id;
		const faculty = course.split(' of ')[1];
		const type = req.body.type;
		console.log("formData", req.body);
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
			res.json({
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
			res.json({
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
 */
router.delete('/deleteInfo', async (req, res) => {
	try {
		const userId = req.query.id;
		const info_type = req.query.type;
		if (info_type == 'Instructional') {
			try {
				const instructional = await models.InstructionalDetails.findOne({
					where: {
						userId: userId
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
					message: 'An error occurred while updating GradeToPercentageLetter.'
				});
			}
		} else if (info_type == 'Affiliation') {
			try {
				const affiliation = await models.Affiliation_Letter.findOne({
					where: {
						user_id: userId
					}
				})
				if (affiliation) {
					const data = await affiliation.destroy();
					if (data) {
						return res.json({
							status: 200
						})
					}
				}
			} catch (error) {
				return res.json({
					status: 500,
					message: 'An error occurred while updating Affiliation_Letter.'
				})
			}
		} else if (info_type == 'NameChangeletter') {
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
router.get('/getUploadeddocument_student',async function(req,res){
	var user_id = req.query.user_id;
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
	var Applied = await functions.getAppliedFor(user_id,app_id);
	var uniqueData = await functions.getDistinctData(user_id);
		const uniqueValues = uniqueData.map((item) => item.dataValues.uniqueValues);
		for(var i = 0 ; i < uniqueValues.length ; i++){
		  college = await functions.getCollegeDetails_student(uniqueValues[i]);
		  transcriptDisplay.push({'coursename' : college[0].coursename ,'college' : college[0].college  , 'collegeid' : college[0].collegeid,'faculty' : college[0].faculty ,'education_type' :  college[0].education_type ,'patteren' : college[0].patteren});
		}
	var marksheet = await functions.getDocumentFuntion(user_id,app_id,'marklist');
	if(marksheet.length > 0){
		for(var i= 0 ; i< marksheet.length ; i++){
			college = await functions.getCollegeName(marksheet[i].collegeId);
			marksheetData.push({
				'name' : marksheet[i].name,
				'CollegeName' : college ? college.name : 'null',
				'filePath' : constant.FILE_LOCATION  + 'public/upload/' + 'marklist' + '/' + user_id +  '/' +   marksheet[i].file_name,
				'fileName' : marksheet[i].file_name,
				'extension' : marksheet[i].file_name.split('.').pop(),
				'id' : marksheet[i].id,
				'user_id' : marksheet[i].user_id,
				'app_id' : marksheet[i].app_id,
				'upload_step' : marksheet[i].upload_step,
				'lock_transcript' : marksheet[i].lock_transcript
			})
		}
		var uniqueData = await functions.getCollegeName_unique(user_id);
		const uniqueValues = uniqueData.map((item) => item.dataValues.uniqueValues);
		for(var i = 0 ; i < uniqueValues.length ; i++){
		  college = await functions.getCollegeDetails_unique(uniqueValues[i]);
		  unique_college.push(college)
		}
	
	}
	if(Applied.educationalDetails == true){
		var transcript = await functions.getDocumentFuntion(user_id,app_id,'transcript');
		if(transcript){
			if(transcript.length > 0){
				for(var i= 0 ; i< transcript.length ; i++){
					college = await functions.getCollegeName(transcript[i].collegeId);
					transcriptData.push({
						'name' : transcript[i].name,
						'CollegeName' : college ? college.name : 'null',
						'filePath' : constant.FILE_LOCATION  + 'public/upload/' + 'transcript' + '/' + user_id +  '/' +   transcript[i].file_name,
						'fileName' : transcript[i].file_name,
						'extension' : transcript[i].file_name.split('.').pop(),
						'id' : transcript[i].id,
						'user_id' : transcript[i].user_id,
						'app_id' : transcript[i].app_id,
						'upload_step' : transcript[i].upload_step,
						'lock_transcript' : transcript[i].lock_transcript
					})
				}
			};
		}
	}
	if(Applied.curriculum == true){
		var curriculum = await functions.getDocumentFuntion(user_id,app_id,'curriculum');
		if(curriculum.length > 0){
			for(var i= 0 ; i< curriculum.length ; i++){
				college = await functions.getCollegeName(curriculum[i].collegeId);
				curriculumData.push({
					'name' : curriculum[i].name,
					'CollegeName' : college ? college.name : 'null',
					'filePath' : constant.FILE_LOCATION  + 'public/upload/' + 'curriculum' + '/' + user_id +  '/' +   curriculum[i].file_name,
					'fileName' : curriculum[i].file_name,
					'extension' : curriculum[i].file_name.split('.').pop(),
					'id' : curriculum[i].id,
					'user_id' : curriculum[i].user_id,
					'app_id' : curriculum[i].app_id,
					'upload_step' : curriculum[i].upload_step,
					'lock_transcript' : curriculum[i].lock_transcript
				})
			}
		}
	}
	if(Applied.instructionalField == true){
		
	}
	if(Applied.gradToPer == true){
		var gradtoper = await functions.getDocumentFuntion(user_id,app_id,'GradeToPercentageLetter');
		if(gradtoper.length > 0){
			for(var i= 0 ; i< gradtoper.length ; i++){
				college = await functions.getCollegeName(gradtoper[i].collegeId);
				gradtoperData.push({
					'name' : gradtoper[i].name,
					'CollegeName' : college ? college.name : 'null',
					'filePath' : constant.FILE_LOCATION  + 'public/upload/' + 'gradtoper' + '/' + user_id +  '/' +   gradtoper[i].file_name,
					'fileName' : gradtoper[i].file_name,
					'extension' : gradtoper[i].file_name.split('.').pop(),
					'id' : gradtoper[i].id,
					'user_id' : gradtoper[i].user_id,
					'app_id' : gradtoper[i].app_id,
					'upload_step' : gradtoper[i].upload_step,
					'lock_transcript' : gradtoper[i].lock_transcript
				})
			}
		}
	}
	if(Applied.affiliation == true){
		
	}
	if(Applied.CompetencyLetter == true){
		
	}
	if(Applied.LetterforNameChange == true){
		
	}
	var extra = await functions.getDocumentFuntion(user_id,app_id,'extra');
	if(extra.length > 0){
		for(var i= 0 ; i< extra.length ; i++){
			college = await functions.getCollegeName(extra[i].collegeId);
			extraData.push({
				'name' : extra[i].name,
				'filePath' : constant.FILE_LOCATION  + 'public/upload/' + 'extra' + '/' + user_id +  '/' +   extra[i].file_name,
				'fileName' : extra[i].file_name,
				'extension' : extra[i].file_name.split('.').pop(),
				'id' : extra[i].id,
				'user_id' : extra[i].user_id,
				'app_id' : extra[i].app_id,
				'upload_step' : extra[i].upload_step,
				'lock_transcript' : extra[i].lock_transcript
			})
		}
		var uniqueData = await functions.getCollegeName_unique(user_id);
		const uniqueValues = uniqueData.map((item) => item.dataValues.uniqueValues);
		console.log(uniqueValues);
		for(var i = 0 ; i < uniqueValues.length ; i++){
		  college = await functions.getCollegeDetails_unique(uniqueValues[i]);
		  unique_college.push(college)
		}
	
	}
	DocumentData.push(marksheetData,transcriptData,transcriptDisplay,unique_college,extraData,curriculumData,gradtoperData)
	res.json({status : 200,data : DocumentData});
	
})

module.exports = router;
