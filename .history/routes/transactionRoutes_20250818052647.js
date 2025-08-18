const express= require('express')
const transactionController= require('../controllers/transactionController')
const authController= require('../controllers/authController')


const router=express.Router()
router.use(authController.login)
router
.route('/')
.get(transactionController.getTransactions)
.post(transactionController.createTransaction)

router
.route('/:id')
.get(transactionController.getTransaction)
.patch(transactionController.updateTransaction)
.delete(transactionController.deleteTransaction)

module.exports=router
