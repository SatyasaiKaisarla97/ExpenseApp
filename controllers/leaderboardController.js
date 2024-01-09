const users = require("../models/user");
const expenses = require("../models/expense");
const Sequelize = require("sequelize");

async function getLeaderboard(req, res) {
  try {
    const leaderboardData = await users.findAll({
      attributes: [
        "username",
        [
          Sequelize.fn("SUM", Sequelize.col("expenses.expenseAmount")),
          "totalExpense",
        ],
      ],
      include: [
        {
          model: expenses,
          attributes: [],
        },
      ],
      group: ["users.id"],
      order: [[Sequelize.fn("SUM", Sequelize.col("expenses.expenseAmount")), "DESC"]],
      raw: true,
    });
    console.log(leaderboardData);
    res.json(leaderboardData);
  } catch (error) {
    console.error("Error fetching leaderboard data:", error);
    res.status(500).send("Server error");
  }
}

module.exports = {
  getLeaderboard,
};
