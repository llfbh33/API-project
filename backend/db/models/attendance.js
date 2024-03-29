'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Attendance extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      // associations for eventId and userId in event and user models through this model

    }
  }
  Attendance.init({
    eventId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      onDelete: 'CASCADE',
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      onDelete: 'CASCADE',
    },
    status: {
      type: DataTypes.ENUM,
      defaultValue: "unknown",
      values: ["attending", "maybe", "can't make it"],
      allowNull: false
    },
  }, {
    sequelize,
    modelName: 'Attendance',
  });
  return Attendance;
};
