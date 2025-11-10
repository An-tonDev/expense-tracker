const Transaction=require('../models/transactionModel')
const AppError=require('../utils/appError')
const catchAsync=require('../utils/catchAsync')
const APIFeatures=require('../utils/apiFeatures')
const factory=require('./handlerFactory')
const generatePDF=require('../utils/pdfGenerator')
const Email=require('../utils/email')

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

exports.sendMonthlyReport = catchAsync(async (req, res,next) => {
  const { email, userId, month, year } = req.body;

  if (!email) {
   return next(new AppError('email is required',400))
  }

  //validate the email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return next( new AppError('email format is invalid',400))
  }

  // Date range
  const reportYear = year || new Date().getFullYear();
  const reportMonth = month || new Date().getMonth();

  const startDate = new Date(reportYear, reportMonth, 1);
  const endDate = new Date(reportYear, reportMonth + 1, 0, 23, 59, 59);

  // Find user
  const user = userId
    ? await User.findById(userId)
    : await User.findOne({ email });

  if (!user) {
    return next ( new AppError("User not found",400))
  }

  // Transactions
  const transactions = await Transaction.find({
    userId: user._id,
    date: { $gte: startDate, $lte: endDate }
  }).sort({ date: 1 });

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const netBalance = totalIncome - totalExpenses;

  const reportData = {
    clientName: user.name,
    companyName: user.companyName,
    month: startDate.toLocaleString("default", { month: "long", year: "numeric" }),
    transactions,
    totalIncome,
    totalExpenses,
    netBalance,
    currency: user.preferences?.currency || 'USD'
  };

  // Generate PDF
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `monthly-report-${user._id}-${timestamp}.pdf`;
  const filePath = path.join(__dirname, '../reports', filename);

  await generatePDF(reportData, filePath);

  // Send email?
  await sendEmail(
    email,
    `Your Monthly Financial Report - ${reportData.month}`,
    `Attached is your monthly financial report for ${reportData.month}.`,
    [{ filename: `Monthly-Report-${reportData.month}.pdf`, path: filePath }]
  );

  // Clean up
  fs.unlinkSync(filePath);

  res.status(200).json({
    status: "success",
    message: `Monthly report sent to ${email}`,
    data: {
      period: reportData.month,
      transactionCount: transactions.length,
      totalIncome,
      totalExpenses,
      netBalance
    }
  });
});

exports.getMonthlyReportData = catchAsync(async (req, res,next) => {
  const { userId, month, year } = req.params;

  const user = await User.findById(userId);
  if (!user) {
   return next(new AppError('user not found',404))
  }

  const reportYear = parseInt(year) || new Date().getFullYear();
  const reportMonth = parseInt(month) || new Date().getMonth();

  const startDate = new Date(reportYear, reportMonth, 1);
  const endDate = new Date(reportYear, reportMonth + 1, 0, 23, 59, 59);

  const transactions = await Transaction.find({
    userId,
    date: { $gte: startDate, $lte: endDate }
  }).sort({ date: 1 });

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const netBalance = totalIncome - totalExpenses;

  res.status(200).json({
    status: "success",
    data: {
      clientName: user.name,
      companyName: user.companyName,
      period: startDate.toLocaleString("default", { month: "long", year: "numeric" }),
      transactions,
      summary: { totalIncome, totalExpenses, netBalance }
    }
  });
});

exports.transactionHistory = catchAsync(async (req,res,next) =>{
    const {startDate,endDate}=req.query
    const baseFilter= filter({user: req.user._id})

    if(startDate || endDate)
        baseFilter.date={}
    if(startDate) baseFilter.date.$gte = new Date(startDate)
    if(endDate) baseFilter.date.$lte=new Date(endDate)

    const features= new APIFeatures(
        Transaction.find(baseFilter),req.query
    )
    .filter()
    .sort()
    .limitFields()
    
    //cloning the query without pagination
    const countQuery=features.query.clone()

    features.query=features.query.paginate()
     
    features.query=features.query.populate('category','name icon color')
    const {transactions,total} = await Promise.all([features.query,countQuery.countDocuments()])

    res.json({
        status:'success',
        results: transactions.length,
        total,
        data:transactions
    })

})

exports.getTransactionStats=catchAsync(async (req,res,next)=>{
         const {startDate,endDate}=req.query
         const matchStage={user:req.user._id}

        if(startDate||endDate)
            matchStage.date={}

        if(startDate) matchStage.date.$gte=new Date(startDate)
        if(endDate) matchStage.date.$lte=new Date(endDate)

            const Stats= await Transaction.aggregate([
                {$match:matchStage},
                { 
                        $group:{
                        _id:'$type',
                        totalAmount:{$sum:'$amount'},
                        count:{$sum:1}
                    }
                },
                {
                    $group:{
                        _id:null,
                        income:{
                            $sum:{ $cond: [ { $eq:['$_id','income'] } , '$totalAmount', 0 ] }
                        },
                        expenses:{
                            $sum: {$cond : [ { $eq: ['$_id','expenses'] } , '$totalAmount', 0]}
                        },
                        totalTransactions: {$sum:'$count'}
                    }
                    
                },
                {
                    $project:{
                        _id:0,
                        income:1,
                        expenses:1,
                        balance: {$subtract: ['$income','$expenses']},
                        totalTransactions:1
                    }
                }
            ])

         if(!stats){
            return next(new AppError('failed to fetch transaction stats',404))
         }
         
    res.data.json({
        status:'success',
        data: stats[0] || {income:0,expenses:0,balance:0,totalTransactions:0}
    })

})