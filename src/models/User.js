const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const UserType = require('./UserType');

const User = sequelize.define(
  'User',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    first_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    last_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    username: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    usertypeid: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: UserType,
        key: 'id',
      },
    },
  },
  {
    tableName: 'user',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

// Associations
User.belongsTo(UserType, { foreignKey: 'usertypeid', as: 'userType' });
UserType.hasMany(User, { foreignKey: 'usertypeid', as: 'users' });

module.exports = User;
