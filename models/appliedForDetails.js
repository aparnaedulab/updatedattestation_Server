"use strict";

module.exports = function (sequelize, DataTypes) {
  var Applied_For_Details = sequelize.define("Applied_For_Details", {
    instructionalField: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
  },
    curriculum : {
      type: DataTypes.BOOLEAN,
      defaultValue: false
  },
    educationalDetails :  {
      type: DataTypes.BOOLEAN,
      defaultValue: false
  },
    gradToPer :  {
      type: DataTypes.BOOLEAN,
      defaultValue: false
  },
    affiliation :  {
      type: DataTypes.BOOLEAN,
      defaultValue: false
  },
    CompetencyLetter :  {
      type: DataTypes.BOOLEAN,
      defaultValue: false
  },
    LetterforNameChange :  {
      type: DataTypes.BOOLEAN,
      defaultValue: false
  },
    current_year: DataTypes.BOOLEAN(),
    diplomaHolder: DataTypes.BOOLEAN(),
    isphd: DataTypes.BOOLEAN(),
    applied_for: DataTypes.STRING(21),
    user_id: DataTypes.INTEGER
  });



  Applied_For_Details.deleteUserData = function (user_id) {
    var query = "DELETE FROM Applied_For_Details WHERE user_id = " + user_id;
    return sequelize.query(query, { type: sequelize.QueryTypes.DELETE });
  }

  Applied_For_Details.belongsTo(sequelize.models.Application, { foreignKey: 'app_id' });

  Applied_For_Details.associate = (models) => {
    Applied_For_Details.belongsTo(models.User, { foreignKey: 'id' });
  };

  return Applied_For_Details;
};
