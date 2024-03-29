'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Group extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define connection between group and user
      //a group belongs to an organizer, an organizer has many groups
      Group.belongsTo(models.User, {
        foreignKey: 'organizerId'
      });

      Group.hasMany(models.GroupImage, {
        foreignKey: 'groupid'
      });

      Group.hasMany(models.Venue, {
        foreignKey: "groupId"
      });

      Group.hasMany(models.Membership, {
        foreignKey: "groupId"
      });

      Group.hasMany(models.Event, {
        foreignKey: "groupId",
      });

    }
  }
  Group.init({
    organizerId: {
      type: DataTypes.INTEGER,
      // removed alloNull false for now so that we do not need to delete on cascade the coresponding group
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    about: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM,
      values: ["socializing", "active", "training", "elder-dogs", "puppies", "small dogs", "large dogs"],
      allowNull: false
    },
    private: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false
    },
    state: {
      type: DataTypes.STRING,
    },
  }, {
    sequelize,
    modelName: 'Group',
  });
  return Group;
};


// add onDelete cascades later after testing and finding which sould sty and which should go
// as well as changing allow nulls as needed for certain columns, or setting up an error message which
// will state you can not delete a user untill you transfer ownership of a group.
