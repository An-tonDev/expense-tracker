const express= require('express')
const transactionController= require('../controllers/transactionController')
const authController= require('../controllers/authController')


const router=express.Router()
router.use(authController.protect)

router.route('/monthly-report-data').get(transactionController.getMonthlyReportData)
router.route('/send-monthly-report').get(transactionController.sendMonthlyReport)
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
