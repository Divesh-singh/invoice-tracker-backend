const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const UserType = sequelize.define(
  'UserType',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    access_level: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isIn: [[1, 2]],
      },
    },
  },
  {
    tableName: 'user_type',
    timestamps: false,
  }
);

module.exports = UserType;
