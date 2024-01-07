const { Sequelize } = require("sequelize");
const sequelize = require("../util/database");

const userDetails = sequelize.define("userdetails", {
  userId: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    unique: true,
    autoIncrement: true,
  },
  username: { type: Sequelize.STRING, allowNull: false, unique: true },
  email: { type: Sequelize.STRING, allowNull: false, unique: true },
  password: { type: Sequelize.STRING, allowNull: false, unique: true },
});

module.exports = userDetails;
