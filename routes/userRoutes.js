const express= require('express')
const userController= require('../controllers/userController')
const authController= require('../controllers/authController')

const router=express.Router()


router.post('/login',authController.login)

router.get('/logout',authController.logout)

router.patch('/reset-password/:token',authController.resetPassword)

router.post('/forgot-password',authController.forgotPassword)

router.use(authController.protect)

router.patch('/update-password',authController.resetPassword)

router
.route('/')
.get(userController.getUsers)
.post(authController.restrictTo('admin'),userController.createUser)

router
.route('/:id')
.get(userController.getUser)
.patch(authController.restrictTo('admin'),userController.updateUser)
.delete(authController.restrictTo('admin'),userController.deleteUser)

module.exports=router