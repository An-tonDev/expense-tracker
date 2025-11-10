const jwt=require('jsonwebtoken')
const User=require('../models/userModel')
const catchAsync = require('../utils/catchAsync')
const AppError  = require('../utils/appError')
const crypto=require('crypto')
const Email=require('../utils/email')

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
     data:{user}
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


exports.logout= (res)=>{
    res.cookie('jwt','loggedout',{
        expiresIn: new Date(Date.now()+10*1000),
        httpOnly:true,
        secure: process.env.NODE_ENV === 'production'
    })

    res.status(200).json({status:'success'})
}

exports.resetPassword= catchAsync( async(req,res,next)=>{
    const hashedToken=crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex')

 const user= await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: {$gt: Date.now()}
 })

 if(!user){
    return next(new AppError('this token is invalid oe expired',404))
 }

 user.password=req.body.password
 user.passwordConfirm=req.body.passwordConfirm
 user.passwordResetToken=undefined
 user.passwordResetExpires=undefined

 await user.save()

 createToken(user,200,res)
})

exports.forgotPassword= catchAsync(async(req,res,next)=>{
    const user= await User.findOne({email:req.body.email})
    if(!user){
        return next(new AppError('no user with this email exists',404))
    }
  const resetToken = user.createPasswordResetToken()
     await user.save({validateBeforeSave:false})

     try{

        const resetUrl=`${req.protocol}://${req.get('host')}/reset-password/${resetToken}`
        await new Email(user,resetUrl).sendPasswordReset()
        res.status(200).json({
            status:"success",
            message:"the reset token has been sent to your email"
        })
     }catch(err){
         user.passwordResetToken=undefined
         user.passwordResetExpires=undefined

         await user.save({validateBeforeSave:false})
         return next(new AppError('could not send token to email',500))
     }
})

exports.restrictTo=(...roles)=>{
 return(req,res,next)=>{
    if(!roles.includes(req.user.role)){
        return next(new AppError('you do not have permission to access this file',403))
    }
     next()
 }

}

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

exports.updatePassword =catchAsync( async (req, res, next) => {
  
    //Get user 
    const user = await User.findById(req.user._id).select('+password');

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    const isCurrentPasswordCorrect = await user.correctPassword(
      req.body.currentPassword,
      user.password
    );

    if (!isCurrentPasswordCorrect) {
      return next(new AppError('Your current password is incorrect', 401));
    }

     //Validate new password
    if (!req.body.newPassword || req.body.newPassword.length < 8) {
      return next(new AppError('Password must be at least 8 characters', 400));
    }

    if (req.body.newPassword === req.body.currentPassword) {
      return next(new AppError('New password must be different from current password', 400));
    }

    // Update password
    user.password = req.body.newPassword;
    user.passwordChangedAt = Date.now();
    await user.save();

    createToken(user,200,res);
  } 
);