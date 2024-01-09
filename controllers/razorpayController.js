const Razorpay = require("razorpay");
const crypto = require("crypto");
const users = require("../models/user");

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

exports.createOrder = async (req, res) => {
  try {
    const options = {
      amount: 5000 * 100,
      currency: "INR",
      receipt: `receipt_${req.userId}`,
      payment_capture: "1",
    };

    const order = await razorpayInstance.orders.create(options);
    console.log(order);
    res.json(order);
  } catch (error) {
    console.error("Error in createOrder:", error);
    res.status(500).send("Error creating Razorpay order");
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const { order_id, payment_id, signature } = req.body;
    console.log(req.body);
    const dataString = `${order_id}|${payment_id}`;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(dataString.toString())
      .digest("hex");
    console.log(`${expectedSignature},${signature}`);
    if (expectedSignature === signature) {
      await updatePremiumStatus(req.user.userId);

      res.json({ success: true, message: "Payment verified successfully" });
    } else {
      res
        .status(400)
        .json({ success: false, message: "Invalid payment signature" });
    }
  } catch (error) {
    console.error("Error in verifyPayment:", error);
    res.status(500).send("Error verifying payment");
  }
};

async function updatePremiumStatus(userId) {
  await users.update({ isPremium: true }, { where: { id: userId } });
}
