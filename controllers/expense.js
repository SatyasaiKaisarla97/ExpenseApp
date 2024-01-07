const Expense = require("../models/expense");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const jwt = require("jsonwebtoken");

async function postExpenses(req, res) {
  try {
    const { expenseAmount, description, category } = req.body;
    const userId = req.user.userId;
    const id = uuidv4();
    const expense = await Expense.create({
      id,
      expenseAmount,
      description,
      category,
      userId, 
    });
    res.json(expense);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error in creating expense");
  }
}

async function showExpenses(req, res) {
  res.sendFile(path.join(__dirname, "..", "public", "expense.html"));
}

async function getExpenses(req, res) {
  try {
    const userId = req.user.userId;
    const expenses = await Expense.findAll({ where: { userId: userId } });
    res.json(expenses);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error in fetching expenses");
  }
}

async function updateExpenses(req, res) {
  try {
    const expenseId = req.params.id;
    const userId = req.user.userId;
    const { expenseAmount, description, category } = req.body;

    const expense = await Expense.findOne({
      where: { id: expenseId, userId: userId },
    });
    if (expense) {
      await expense.update({ expenseAmount, description, category });
      res.json(expense);
    } else {
      res.status(404).send("Expense not found");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Error in updating expense");
  }
}

async function getExpense(req, res) {
  try {
    const expenseId = req.params.id;
    const userId = req.user.userId;
    const expense = await Expense.findOne({
      where: { id: expenseId, userId: userId },
    });

    if (expense) {
      res.json(expense);
    } else {
      res.status(404).send("Expense not found");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Error in fetching the expense");
  }
}

async function deleteExpense(req, res) {
  try {
    const expenseId = req.params.id;
    const userId = req.user.userId;
    const expense = await Expense.findOne({
      where: { id: expenseId, userId: userId },
    });

    if (expense) {
      await expense.destroy();
      res.json({ message: "Expense deleted" });
    } else {
      res.status(404).send("Expense not found");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Error in deleting expense");
  }
}

module.exports = {
  postExpenses,
  showExpenses,
  getExpenses,
  updateExpenses,
  getExpense,
  deleteExpense,
};
