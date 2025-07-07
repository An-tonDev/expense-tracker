const fs=require('fs')
const mongoose=require('mongoose')
const User= require('../models/userModel')
const Transaction= require('../models/transactionModel')

const users=JSON.parse(fs.readFileSync('./users.json','utf-8'))
const transactions=JSON.parse(fs.readFileSync('./transaction.json','utf-8'))

const importData = async (Model,data)=>{
    try{
    await User.create(users)
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