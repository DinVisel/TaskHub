import Task from "../models/Task.js"
import Offer from "../models/Offer.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import AppError from "../utils/appError.js"

export const getMyTasks = asyncHandler(async(req,res)=>{
    const tasks = await Task.find({ postedBy: req.user.id})
    if (!tasks) {
        throw new AppError("Tasks not found",404)
    }
    res.json({tasks})
})

export const getMyOffers = asyncHandler(async(req,res)=>{
    const offers = await Offer.find({applicantId: req.user.id})
    if(!offers) throw new AppError("Offers not found",404)
    res.json({offers})
})

export const getMyJobs = asyncHandler(async(req,res)=>{
    const tasks = await Task.find({
        assignedTo: req.user.id,
        status: "in_progress"
    })
    res.json({tasks})
})