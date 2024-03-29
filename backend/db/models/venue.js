'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Venue extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {

      Venue.belongsTo(models.Group, {
        foreignKey: "groupId"
      });

      Venue.belongsToMany(models.Group, {
        through: models.Event,
        foreignKey: "venueId",
        otherKey: "groupId"
      });
      
    }
  }
  Venue.init({
    groupId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isAlphanumeric: true
      }
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    state: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lat: DataTypes.DECIMAL,
    lng: DataTypes.DECIMAL
  }, {
    sequelize,
    modelName: 'Venue',
  });
  return Venue;
};


// add onDelete cascades later after testing and finding which sould sty and which should go
// as well as changing allow nulls as needed for certain columns, or setting up an error message which
// will state you can not delete a user untill you transfer ownership of a group.
