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
  

}
