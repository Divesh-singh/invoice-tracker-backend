const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const Bill = sequelize.define(
  'Bill',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    bill_amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    paid: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    added_by: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: User,
        key: 'id',
      },
    },
    invoice_pdf_url: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: 'bills',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
  }
);

// Associations
Bill.belongsTo(User, { foreignKey: 'added_by', as: 'createdBy' });
User.hasMany(Bill, { foreignKey: 'added_by', as: 'bills' });

module.exports = Bill;
