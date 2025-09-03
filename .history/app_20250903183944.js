const express= require('express')
const morgan= require('morgan')
const securityMiddleware= require('./utils/security')
const ratelimiter=require('express-rate-limit')
const userRouter=require('./routes/userRoutes')
const transactionRouter=require('./routes/transactionRoutes')
const app=express()


app.use(express.json())

if(process.env.NODE_ENV ==='development'){
    app.use(morgan('dev'))
}


app.use(securityMiddleware)
const ratelimit=ratelimiter({
    
})

app.use('/api/v1/users',userRouter)
app.use('/api/v1/transaction',transactionRouter)

module.exports=app