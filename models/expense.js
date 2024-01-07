const { Sequelize } = require("sequelize");
const { v4: uuidv4 } = require("uuid");
const sequelize = require("../util/database");
const userDetails = require("../models/signup");

const Expense = sequelize.define("expense", {
  userId: {
    type: Sequelize.INTEGER,
    allowNull: false,
    references: {
      model: userDetails,
      key: "userId",
    },
  },
  id: {
    type: Sequelize.UUID,
    defaultValue: () => uuidv4(),
    allowNull: false,
    primaryKey: true,
  },
  expenseAmount: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  description: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  category: {
    type: Sequelize.STRING,
    allowNull: false,
  },
});

module.exports = Expense;
