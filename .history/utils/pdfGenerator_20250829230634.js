// utils/pdfGenerator.js
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const generatePDF = async (reportData, filePath) => {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument();
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // Header
    doc.fontSize(20).font('Helvetica-Bold')
       .text('MONTHLY FINANCIAL REPORT', { align: 'center' });
    doc.moveDown();
    doc.fontSize(16).text(`Report for: ${reportData.month}`, { align: 'center' });
    doc.moveDown();

    // Client info
    doc.fontSize(12).text(`Client: ${reportData.clientName}`);
    if (reportData.companyName) {
      doc.text(`Company: ${reportData.companyName}`);
    }
    doc.text(`Report generated on: ${new Date().toLocaleDateString()}`);
    doc.moveDown();

    // Summary
    doc.fontSize(14).text('SUMMARY', { underline: true }).moveDown(0.5);
    doc.fontSize(12).text(`Total Income: ${reportData.currency}${reportData.totalIncome.toFixed(2)}`);
    doc.text(`Total Expenses: ${reportData.currency}${reportData.totalExpenses.toFixed(2)}`);
    doc.font('Helvetica-Bold')
       .text(`Net Balance: ${reportData.currency}${reportData.netBalance.toFixed(2)}`);
    doc.moveDown();

    // Transactions
    if (reportData.transactions?.length > 0) {
      doc.fontSize(14).text('TRANSACTION DETAILS', { underline: true }).moveDown(0.5);
      const tableTop = doc.y;
      doc.font('Helvetica-Bold');
      doc.text('Date', 50, tableTop);
      doc.text('Description', 150, tableTop);
      doc.text('Category', 300, tableTop);
      doc.text('Amount', 450, tableTop);
      doc.text('Type', 520, tableTop);

      let y = tableTop + 20;
      doc.font('Helvetica');

      reportData.transactions.forEach(transaction => {
        const date = new Date(transaction.date).toLocaleDateString();
        doc.text(date, 50, y);
        doc.text(transaction.description, 150, y, { width: 140 });
        doc.text(transaction.category, 300, y, { width: 140 });

        if (transaction.type === 'income') {
          doc.fillColor('green');
        } else {
          doc.fillColor('red');
        }
        doc.text(`${reportData.currency}${transaction.amount.toFixed(2)}`, 450, y);
        doc.fillColor('black');
        doc.text(transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1), 520, y);

        y += 20;
        if (y > 700) {
          doc.addPage();
          y = 50;
        }
      });
    } else {
      doc.text('No transactions found for this period.');
    }

    // Footer
    doc.addPage();
    doc.fontSize(10).text(
      'This report was generated automatically. For any questions, please contact support.',
      50, 50, { align: 'center' }
    );

    doc.end();

    stream.on('finish', resolve);
    stream.on('error', reject);
  });
};

module.exports = { generatePDF };
