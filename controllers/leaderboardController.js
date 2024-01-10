const users = require("../models/user");

async function getLeaderboard(req, res) {
  try {
    const leaderboardData = await users.findAll({
      attributes: ["username", "totalExpense"],
      order: [["totalExpense", "DESC"]],
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
