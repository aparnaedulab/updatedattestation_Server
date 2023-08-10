"use strict";

module.exports = function(sequelize, DataTypes) {
	var Activitytracker = sequelize.define("Activitytracker", {
		user_id: DataTypes.STRING(10),
		activity: DataTypes.STRING(500),
		data: DataTypes.STRING(500),
		application_id: DataTypes.STRING(10),
		ip_address: DataTypes.STRING(225),
		created_at: DataTypes.DATE,
	});
	return Activitytracker;
};

