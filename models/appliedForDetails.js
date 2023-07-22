"use strict";

module.exports = function(sequelize, DataTypes) {
  var appliedForDetails = sequelize.define("Applied_For_Details", {
    instructionalField : DataTypes.BOOLEAN(),
    curriculum : DataTypes.BOOLEAN(),
    educationalDetails : DataTypes.BOOLEAN(),
    gradToPer : DataTypes.BOOLEAN(),
    current_year : DataTypes.BOOLEAN(),
    diplomaHolder : DataTypes.BOOLEAN(),
    affiliation : DataTypes.BOOLEAN(),
    CompetencyLetter : DataTypes.BOOLEAN(),
    LetterforNameChange : DataTypes.BOOLEAN(),
    applied_for : DataTypes.STRING(21),
  });


  appliedForDetails.deleteUserData = function(user_id){
    var query = "DELETE FROM Applied_For_Details WHERE user_id = " + user_id;
    return sequelize.query(query, { type: sequelize.QueryTypes.DELETE});
  }

  appliedForDetails.belongsTo(sequelize.models.Application);
//   appliedForDetails.associate = (models) => {
//     appliedForDetails.belongsTo(models.User, {foreignKey: 'user_id'});
//     appliedForDetails.belongsTo(models.Application, {foreignKey: 'app_id'}); 
// };
  
  return appliedForDetails;
};
