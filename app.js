const express = require("express");
const app = express();
const sequelize = require("./util/database");
const loginRoutes = require("./routes/signup");
const expenseRoutes = require("./routes/expense");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(express.static("public"));

app.use("/user", loginRoutes);
app.use("/user/expense", expenseRoutes);

sequelize
  .sync()
  .then((res) => {
    app.listen(3000);
  })
  .catch((err) => console.log(err));
