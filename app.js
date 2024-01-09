require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const loginRoutes = require("./routes/loginRoutes");
const expenseRoutes = require("./routes/expenseRoutes");
const razorpayRoutes = require("./routes/razorpayRoutes");
const leaderboardRoutes = require('./routes/leaderboardRoutes')
const sequelize = require("./util/database");
const expenses = require("./models/expense");
const users = require("./models/user");
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use("/", loginRoutes);
app.use("/user", expenseRoutes);
app.use("/razorpay", razorpayRoutes);
app.use('/', leaderboardRoutes)

expenses.belongsTo(
  users,
  { foreignKey: "userId" },
  { constraints: true, onDelete: "CASCADE" }
);
users.hasMany(expenses, { foreignKey: "userId" });

sequelize
  .sync({ force: false })
  .then((res) => {
    app.listen(process.env.PORT);
  })
  .catch((err) => console.log(err));
