const fs=require('fs')
const dotenv=require('dotenv')
const mongoose=require('mongoose')
const User= require('../models/userModel')
const Transaction= require('../models/transactionModel')

dotenv.config({ path: './config.env' });

const DB=process.env.DATABASE

mongoose.connect(DB).then(() => console.log('DB connection successful!'));



const users=JSON.parse(fs.readFileSync(`${__dirname}/users.json`,'utf-8'))
const transactions=JSON.parse(fs.readFileSync(`${__dirname}/transaction.json`,'utf-8'))

const importData = async () =>{
    try{
    await User.create(users,{ validateBeforeSave: false })
    await Transaction.create(transactions)
    }catch(err){
    console.log(err.message)
    }
    process.exit()
}

const deleteData = async ()=>{
    try{
    await User.deleteMany()
    await Transaction.deleteMany()
    }catch(err){
    console.log(err.message)
    }
    process.exit()
}

if(process.argv[2]==='--import'){
    importData()
}else if(process.argv[2]==='--delete'){
    deleteData()
}