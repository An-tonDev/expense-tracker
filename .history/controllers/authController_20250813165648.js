const jwt=require('jsonwebtoken')
const User=require('../models/userModel')
const catchAsync = require('../utils/catchAsync')


const signToken= id=>{
    return jwt.sign({id},process.env.JWT_SECREt,{
        expiresIn: process.env.JWT_EXPIRES_IN
    })
}

const createToken= (user,statusCode,res)=>{
   const token= signToken(user._id)

   res.cookie('jwt',token,{
    expires:new Date(Date.now()+process.env.JWT_COOKIE_EXPIRES_IN*60*60*24*1000),
    httpOnly:true,
    secure: process.env.NODE_ENV ==='production'
   })

     user.password=undefined

   res.status(statusCode).json({
     status:'success',
     token,
     date:user
   })
}


exports.signup= catchAsync(async(req,res,next)=>{
 const newUser= User.create({
    name:req.body.name,
    email:req.body.email,
    passsword:req.body.passsword,
    passwordConfirm: req.body.passwordConfirm
 })
   
 createToken(newUser,201,res)
      

})

exports.login = 
exports.logout
exports.resetPassword
exports.forgotPassword
exports.restrictTo
exports.protect