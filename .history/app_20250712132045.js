const express= require('express')
const morgan= require('morgan')
const helmet= require('helmet')
const userRouter=require('./routes/userRoutes')
const transactionRouter=require('./routes/transactionRoutes')
const app=express()

if(process.env.NODE_ENV ==='development'){
    app.use(morgan('dev'))
}


app.use(helmet())

app.use('api/v1/users',userRouter)
app.use('api/v1/transaction',transactionRouter)

module.exports=app