const jwt=require('jsonwebtoken')
const User=require('../models/userModel')


const signToken= id=>{
    return jwt.sign({id},process.env.JWT_SECREt,{
        expiresIn: process.env.JWT_EXPIRES_IN
    })
}

exports.signup= async(req,res,next)=>{
 const newUser= User.create({
    name:req.body.name,
    email:req.body.email,
    passsword:req.body.passsword,
    passwordConfirm: req.body.passwordConfirm
 })
   const token=signToken(newUser._id)
      res.status(201).json({
        status:'success',
        token,
        data:{
            user:newUser
        }
      })

}
exports.login = 
exports.logout
exports.resetPassword
exports.forgotPassword
exports.restrictTo
exports.protect