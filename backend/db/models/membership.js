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
      // define proper associations for users and Groups in this table

      Membership.belongsTo(models.User, {
        foreignKey: "userId"
      });

      Membership.belongsTo(models.Group, {
        foreignKey: "groupId"
      });
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
    auth: {
      type: DataTypes.ENUM,
      values: ["host", "co-host", "member"],
      defaultValue: 'member'
    }
  }, {
    sequelize,
    modelName: 'Membership',
    defaultScope: {
      attributes: {exclude: ['auth']}
    },
    scopes: {
      findAuth: {
        auth: 'co-host'
      }
    }
  });
  return Membership;
};
