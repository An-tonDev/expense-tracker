const { AppError } = require("../utils/appError")

exports.getAll=model=> async(req,res,next)=> {
    const data= await model.find()
    if(!data){
        return next(new AppError('there is no data ',404))
    }
    res.status(200).json({
        status:'success',
        data
    })
}
exports.getOne=model=>async(req,res,next)=> {
const data= await model.findById(req.params.id)
if(!data){
        return next(new AppError(`there is no ${model} with this id`,404))
    }
    res.status(200).json({
        status:'success',
        data
    })
}
exports.updateOne=model=>async(req,res,next)=> {
const data= await model.findByIdAndUpdate(req.params.id)
if(!data){
        return next(new AppError(`there is no ${model} with this id`,404))
    }
    res.status(200).json({
        status:'success',
        data
    })
}
exports.deleteOne=model=>async(req,res,next)=> {
 const data= await model.findByIdAndDelete(req.params.id)
    res.status(200).json({
        status:'success',
        data
    })
}

exports.createOne= model => async (req,res,next)=>{
   const data=await model.create(req.body)
      res.status(200).json({
        status:'success',
        data
    })
}