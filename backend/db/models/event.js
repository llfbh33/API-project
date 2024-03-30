'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Event extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // put the proper associations for venueId and groupId in the venue and group models through this one
      Event.belongsTo(models.Venue, {
        foreignKey: "venueId"
      });

      Event.belongsTo(models.Group, {
        foreignKey: "groupId"
      });

      Event.hasMany(models.EventImage, {
        foreignKey: "eventId"
      });

      Event.belongsToMany(models.User, {
        through: models.Attendance,
        foreignKey: "eventId",
        otherKey: "userId"
      });
    }
  }
  Event.init({
    venueId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      onDelete: 'CASCADE'
    },
    groupId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      onDelete: 'CASCADE'
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [0, 100]
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        len: [10, 500]
      }
    },
    type: {
      type: DataTypes.ENUM,
      allowNull: false,
      values: ["Online", "In Person"],
    },
    capacity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        casualCapacity(value) {
          if(this.type === "casual" && value > 10) {
            throw new Error("Casual gatherings are defined as 10 or less dogs");
          }
        },
        intimateCapacity(value) {
          if(this.type === "intimate" && value > 4) {
            throw new Error("Intimate gatherings are defined as 3 or less dogs");
          }
        }
      }
    },
    price: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 0,
        max: 100
      }
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        isDate: true,
      }
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        isDate: true,
      }
    },
  }, {
    sequelize,
    modelName: 'Event',
  });
  return Event;
};
