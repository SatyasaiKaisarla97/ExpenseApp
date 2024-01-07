const Sequelize = require("sequelize");

const sequelize = new Sequelize("expenseapp", "root", "Satyasaik123", {
  host: "localhost",
  dialect: "mysql",
});

module.exports = sequelize;
