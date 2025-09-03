const express= require('express')
const transactionController= require('../controllers/transactionController')
const authController= require('../controllers/authController')


const router=express.Router()
router.use(authController.protect)

router.get('/monthly-report-data',transactionController.getMonthlyReportData)
router.get('/send-monthly-report',transactionController.sendMonthlyReport)
router
.route('/')
.get(transactionController.getTransactions)
.post(transactionController.createTransaction)

router
.route('/:id')
.get(transactionController.getTransaction)
.patch(authController.restrictTo('users'),transactionController.updateTransaction)
.delete(authController.restrictTo('users'),transactionController.deleteTransaction)

module.exports=router
