const express= require('express')
const userController= require('../controllers/userController')
const authController= require('../controllers/authController')

const router=express.Router()
router.use(authController.protect)

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