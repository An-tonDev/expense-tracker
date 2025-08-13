const jwt=require('jsonwebtoken')
const User=require('../models/userModel')
const catchAsync = require('../utils/catchAsync')
const AppError  = require('../utils/appError')


const signToken= id=>{
    return jwt.sign({id},process.env.JWT_SECRET,{
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
     date:{user}
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

exports.login = catchAsync( async (req,res,next)=>{
    const {email,password}=req.body

    if(!email ||!password){
        return next(new AppError('please provide an email or password',400))
    }

    const user= User.findOne({email}).select('+password')
    if(!user|| await user.correctPassword(password, user.password)){
        return next(new AppError('invalid email or password',401))
    }
      
    createToken(user,200,res)
})


exports.logout= (req,res)=>{
    res.cookie('jwt','loggedout',{
        expiresIn: new Date(Date.now()+10*1000),
        httpOnly:true,
        secure: process.env.NODE_ENV === 'production'
    })

    res.status(200).json({status:'success'})
}

exports.resetPassword={}
exports.forgotPassword={}
exports.restrictTo={}

exports.protect=catchAsync(async (req,res,next)=>{
    
    let token
    if (req.headers.authorization?.startsWith('bearer'))
        token=req.headers.authorization.split('')[1]
    else if (req.cookie.jwt){
        token=req.cookie.jwt
    }

         if(!token){
            return next(new AppError('please log in',401))
         }

     const decoded= await promisify (jwt.verify)(token,process.env.JWT_SECRET)

     const currentUser= await User.findById(decoded._id)
     
     
     if(!currentUser){
        return next (AppError(('user does not exist',401)))
         }

     req.users=currentUser
     res.locals.users=currentUser

})