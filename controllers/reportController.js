const expenses = require("../models/expense");
const PDFDocument = require("pdfkit");
const ExcelJS = require("exceljs");
const { Parser } = require("json2csv");
const fs = require("fs");

exports.generateExpenseReport = async (req, res) => {
  try {
    const userId = req.user.userId; 
    const format = req.query.format || "pdf"; 


    const Expenses = await expenses.findAll({
      where: { userId },
      attributes: ["expenseAmount", "description", "category", "createdAt"],
    });

   
    const data = Expenses.map((e) => e.get({ plain: true }));

    switch (format.toLowerCase()) {
      case "xlsx":
        await generateExcelReport(data, res);
        break;
      case "csv":
        generateCSVReport(data, res);
        break;
      default:
        generatePDFReport(data, res);
        break;
    }
  } catch (error) {
    console.error("Error generating report:", error);
    res.status(500).send("Failed to generate report");
  }
};

function generatePDFReport(data, res) {
  const doc = new PDFDocument();
  const filename = `ExpenseReport_${Date.now()}.pdf`;
  res.setHeader("Content-disposition", "attachment; filename=" + filename);
  res.setHeader("Content-type", "application/pdf");
  doc.pipe(res);

  doc.text("Expense Report", { align: "center" });
  data.forEach((expense) => {
    doc.text(
      `Amount: ${expense.expenseAmount}, Description: ${expense.description}, Category: ${expense.category}, Date: ${expense.createdAt}`
    );
    doc.moveDown(0.5);
  });
  doc.end();
}

async function generateExcelReport(data, res) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Expenses");
  worksheet.columns = [
    { header: "Amount", key: "expenseAmount", width: 10 },
    { header: "Description", key: "description", width: 30 },
    { header: "Category", key: "category", width: 15 },
    { header: "Date", key: "createdAt", width: 20 },
  ];
  worksheet.addRows(data);

  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader(
    "Content-Disposition",
    "attachment; filename=" + `ExpenseReport_${Date.now()}.xlsx`
  );

  await workbook.xlsx.write(res);
  res.end();
}

function generateCSVReport(data, res) {
  const parser = new Parser();
  const csv = parser.parse(data);
  res.setHeader("Content-Type", "text/csv");
  res.setHeader(
    "Content-Disposition",
    "attachment; filename=" + `ExpenseReport_${Date.now()}.csv`
  );
  res.send(csv);
}
