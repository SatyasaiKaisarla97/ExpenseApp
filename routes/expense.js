const express = require("express");
const router = express.Router();
const expenseController = require("../controllers/expense");
const verifyToken = require("../middleware").verifyToken;

router.post("/", verifyToken, expenseController.postExpenses);

router.get("/expenses", verifyToken, expenseController.showExpenses);

router.get("/", verifyToken, expenseController.getExpenses);

router.put("/:id", verifyToken, expenseController.updateExpenses);

router.get("/:id", verifyToken, expenseController.getExpense);

router.delete("/:id", verifyToken, expenseController.deleteExpense);

module.exports = router;
