const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const users = require("../models/user");

async function signUp(req, res, next) {
  try {
    const { username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await users.create({
      username,
      email,
      password: hashedPassword,
    });
    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    console.log("Error in Sign Up: ", error);
    res.status(500).json({ message: "server error" });
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await users.findOne({ where: { email: email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET
    );
    res.status(200).json({ token, userId: user.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "server error" });
  }
}

module.exports = {
  signUp,
  login,
};
