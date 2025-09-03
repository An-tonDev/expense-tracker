const express= require('express')
const morgan= require('morgan')
const securityMiddleware= require('./utils/security')
const ratelimiter=require('express-rate-limit')
const xss=require('xss')
const mongoSanitize=require('mongo-sanitize')
const authRouter=require('./routes/authRoutes')
const userRouter=require('./routes/userRoutes')
const transactionRouter=require('./routes/transactionRoutes')
const app=express()


app.use(express.json())

if(process.env.NODE_ENV ==='development'){
    app.use(morgan('dev'))
}

app.use(securityMiddleware)

const ratelimit=ratelimiter({
    windowMs:10*60*1000,
    Max:100,
    message:{
        status:'fail',
        mesaage:'to many requests from this IP'
    }
})

app.use('/api',ratelimit)

app.use(xss())

app.use(mongoSanitize())

app.use('/api/v1/users',userRouter)
app.use('/api/v1/transaction',transactionRouter)
app.use('/api/auth',authRouter)

module.exports=app