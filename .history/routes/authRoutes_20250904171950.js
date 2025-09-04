const authController=require('../controllers/authController')
const express=require('express')

const router=express.Router()

router.post('/login',authController.login)

router.get('/logout',authController.logout)

router.patch('/reset-password/:token',authController.resetPassword)

router.patch('/update-password',authController.protect,authController.resetPassword)

router.post('/forgot-password',authController.forgotPassword)

module.exports=router