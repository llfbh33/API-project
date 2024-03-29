'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Membership extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define proper associations between users and Groups through this table
    }
  }
  Membership.init({
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      onDelete: 'CASCADE'
    },
    groupId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      onDelete: 'CASCADE'
    },
    status: {
      type: DataTypes.ENUM,
      values: ["active", "in-active"],
      allowNull: false
    },
  }, {
    sequelize,
    modelName: 'Membership',
  });
  return Membership;
};
