const Transaction=require('../models/transactionModel')
const AppError=require('../utils/appError')
const catchAsync=require('../utils/catchAsync')
const factory=require('./handlerFactory')

exports.getTransaction= factory.getOne(Transaction)
exports.getTransactions= async (req,res,next)=>{
    const transactions= await Transaction.find()
    if(!transactions){
        return next(new AppError('no document found ',404))
    }
   res.staus(200).json({
    status:'success',
    data: transactions
   })
}
exports.createTransaction= factory.createOne(Transaction)
exports.updateTransaction= factory.updateOne(Transaction)
exports.updateTransaction= factory.deleteOne(Transaction)