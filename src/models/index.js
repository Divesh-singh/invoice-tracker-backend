const User = require('./User');
const UserType = require('./UserType');
const Bill = require('./Bill');
const PaidBill = require('./PaidBill');

// Setup associations that require all models to be defined to avoid circular requires
Bill.hasMany(PaidBill, { foreignKey: 'bill_id', as: 'payments' });
PaidBill.belongsTo(Bill, { foreignKey: 'bill_id', as: 'bill' });

PaidBill.belongsTo(User, { foreignKey: 'added_by', as: 'createdBy' });
User.hasMany(PaidBill, { foreignKey: 'added_by', as: 'paidBills' });

module.exports = {
  User,
  UserType,
  Bill,
  PaidBill,
};
