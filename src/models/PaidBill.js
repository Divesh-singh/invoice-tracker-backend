const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const Bill = require('./Bill');

const PaidBill = sequelize.define(
  'PaidBill',
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
    bill_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Bill,
        key: 'id',
      },
    },
    added_by: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: User,
        key: 'id',
      },
    },
    payment_invoice_url: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    amount_received: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
    },
  },
  {
    tableName: 'paid_bills',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
  }
);

// Associations
PaidBill.belongsTo(Bill, { foreignKey: 'bill_id', as: 'bill' });
PaidBill.belongsTo(User, { foreignKey: 'added_by', as: 'createdBy' });

Bill.hasMany(PaidBill, { foreignKey: 'bill_id', as: 'payments' });
User.hasMany(PaidBill, { foreignKey: 'added_by', as: 'paidBills' });

module.exports = PaidBill;
