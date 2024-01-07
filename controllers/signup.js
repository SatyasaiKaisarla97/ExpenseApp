const path = require("path");
const userDetails = require("../models/signup");
const bcrypt = require("bcrypt");
const saltRounds = 10;
function userSignUp(req, res) {
  res.sendFile(path.join(__dirname, "..", "public", "signup.html"));
}

function userLogin(req, res) {
  res.sendFile(path.join(__dirname, "..", "public", "login.html"));
}

async function signupUser(req, res, next) {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).send("All fields are required");
  }
  try {
    let user = await userDetails.findOne({ where: { email: email } });
    if (user) {
      return res.status(409).send("User already exists.");
    } else {
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      const newUser = await userDetails.create({
        username,
        email,
        password: hashedPassword,
      });
      res.json(newUser);
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Error during signup");
  }
}

async function loginUser(req, res, next) {
  const { email, password } = req.body;
  try {
    let userData = await userDetails.findOne({ where: { email: email } });
    if (!userData) {
      return res.status(401).send("User not found");
    }
    const match = await bcrypt.compare(password, userData.password);
    if (!match) {
      return res.status(401).send("Invalid Password");
    }
    return res.redirect("/");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error during login");
  }
}

module.exports = {
  userSignUp,
  userLogin,
  loginUser,
  signupUser,
};
