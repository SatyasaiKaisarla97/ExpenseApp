const express = require("express");
const path = require("path");
const app = express();
const sequelize = require("./util/database");
const userDetails = require("./models/signup");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(express.static("public"));

app.get("/user/signup", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "signup.html"));
});

app.get("/user/login", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

app.post("/user/signup", async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).send("All fields are required");
  }
  try {
    let user = await userDetails.findOne({ where: { email: email } });
    if (user) {
      res.status(409).send("User already exists.");
    } else {
      const response = await userDetails.create({ username, email, password });
      res.json(response);
    }
  } catch (error) {
    console.error(error);
  }
});

sequelize
  .sync()
  .then((res) => {
    app.listen(3000);
  })
  .catch((err) => console.log(err));