const Transaction=require('../models/transactionModel')
const AppError=require('../utils/appError')
const catchAsync=require('../utils/catchAsync')
const factory=require('./handlerFactory')
const generatePDF=require('pdfkit')

exports.getTransaction= factory.getOne(Transaction)
exports.getTransactions= catchAsync(async (req,res,next)=>{
    const transactions= await Transaction.find()
    if(!transactions){
        return next(new AppError('no document found ',404))
    }
   res.status(200).json({
    status:'success',
    results: data.length,
    data: transactions
   })
})

exports.createTransaction= factory.createOne(Transaction)
exports.updateTransaction= factory.updateOne(Transaction)
exports.deleteTransaction= factory.deleteOne(Transaction)

exports.sendMonthlyReport = async (req, res) => {
  
    const userEmail = req.body.email; // client email passed in request
    const userName = req.body.name || "Client";

    // fetch last month transactions
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 1, 1);
    const endDate = new Date();
    endDate.setDate(0); // last day of previous month

    const transactions = await Transaction.find({
      createdAt: { $gte: startDate, $lte: endDate }
    });

    const reportData = {
      clientName,
      month: startDate.toLocaleString("default", { month: "long", year: "numeric" }),
      transactions
    };

    const filePath = path.join(__dirname, "../monthly-report.pdf");

    // generate PDF
    await generatePDF(reportData, filePath);

    // send email
    await transporter.sendMail({
      from: `"Reports" <${process.env.EMAIL_USERNAME}>`,
      to: userEmail,
      subject: "Your Monthly Transaction Report",
      text: "Attached is your monthly transaction report.",
      attachments: [
        {
          filename: "monthly-report.pdf",
          path: filePath
        }
      ]
    });

    res.status(200).json({
      status: "success",
      message: "Monthly report sent to " + userEmail
    });
}