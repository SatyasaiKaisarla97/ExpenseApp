const crypto = require("crypto");
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
const users = require("../models/user");
const { Op } = require("sequelize");
const SibApiV3Sdk = require("sib-api-v3-sdk");

// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: process.env.EMAIL,
//     pass: process.env.EMAIL_APP_PASSWORD,
//   },
// });

// exports.forgotPassword = async (req, res, next) => {
//   try {
//     const user = await users.findOne({ where: { email: req.body.email } });
//     if (!user) {
//       return res.status(400).send("User with given email does not exist");
//     }

//     const token = crypto.randomBytes(32).toString("hex");
//     const tokenExpiration = Date.now() + 3600000; // 1 hour from now

//     await user.update({
//       resetToken: token,
//       resetTokenExpiration: tokenExpiration,
//     });

//     const resetUrl = `http://localhost:3000/passwordreset.html?token=${token}`;
//     await transporter.sendMail({
//       to: user.email,
//       from: process.env.EMAIL,
//       subject: "Password Reset",
//       html: `<p>You requested a password reset</p>
//              <p>Click this <a href="${resetUrl}">link</a> to set a new password.</p>`,
//     });

//     res.send("Password reset link has been sent to your email.");
//   } catch (error) {
//     console.error("Forgot Password Error:", error);
//     res.status(500).send("Error resetting password.");
//   }
// };

let defaultClient = SibApiV3Sdk.ApiClient.instance;
let apiKey = defaultClient.authentications["api-key"];
apiKey.apiKey = process.env.API_KEY;

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

exports.forgotPassword = async (req, res, next) => {
  try {
    const user = await users.findOne({ where: { email: req.body.email } });
    if (!user) {
      return res.status(400).send("User with given email does not exist");
    }

    const token = crypto.randomBytes(32).toString("hex");
    const tokenExpiration = Date.now() + 3600000; 

    await user.update({
      resetToken: token,
      resetTokenExpiration: tokenExpiration,
    });

    const resetUrl = `http://localhost:3000/passwordreset.html?token=${token}`;
    let sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

    sendSmtpEmail = {
      to: [{ email: user.email }],
      sender: { email: process.env.EMAIL },
      subject: "Password Reset",
      htmlContent: `<p>You requested a password reset</p>
                    <p>Click this <a href="${resetUrl}">link</a> to set a new password.</p>`,
    };

    apiInstance.sendTransacEmail(sendSmtpEmail).then(
      function (data) {
        console.log("API called successfully. Returned data: " + data);
      },
      function (error) {
        console.error(error);
      }
    );

    res.send("Password reset link has been sent to your email.");
  } catch (error) {
    console.error("Forgot Password Error:", error);
    res.status(500).send("Error resetting password.");
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    const user = await users.findOne({
      where: {
        resetToken: token,
        resetTokenExpiration: {
          [Op.gt]: Date.now(),
        },
      },
    });

    if (!user) {
      return res.status(400).send("Invalid or expired password reset token.");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await user.update({
      password: hashedPassword,
      resetToken: null,
      resetTokenExpiration: null,
    });

    res.send("Password has been reset successfully.");
  } catch (error) {
    console.error("Reset Password Error:", error);
    res.status(500).send("Error resetting password.");
  }
};
