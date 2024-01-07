require("dotenv").config();
const express = require("express");
const jwt = require("jsonwebtoken");
const { expressjwt: expressJwt } = require("express-jwt");
const sequelize = require("./util/database");
const loginRoutes = require("./routes/signup");
const expenseRoutes = require("./routes/expense");
const Expense = require("./models/expense");
const userDetails = require("./models/signup");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(
  expressJwt({
    secret: process.env.JWT_SECRET,
    algorithms: ["HS256"],
  }).unless({
    path: ["/user/login", "/user/signup"],
  })
);

app.use(express.static("public"));

app.use("/user", loginRoutes);
app.use("/user/expense", expenseRoutes);

Expense.belongsTo(userDetails, { foreignKey: "userId" });
userDetails.hasMany(Expense, { foreignKey: "userId" });

sequelize
  .sync()
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log(`Server is running on port ${process.env.PORT}`);
    });
  })
  .catch((err) => console.log(err));
