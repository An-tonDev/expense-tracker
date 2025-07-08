const express= require('express')
const morgan= require('morgan')
const helmet= require('helmet')
const app=express()

if(process.env.NODE_ENV ==='development'){
    app.use(morgan('dev'))
}
app.use(helmet())


module.exports=app