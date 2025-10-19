import mongoose from "mongoose"

const messageSchema = new mongoose.Schema(
    {
        taskId: {type: mongoose.Schema.Types.ObjectId, ref: "Task", required: true},
        senderId: {type: mongoose.Schema.Types.ObjectId, ref: "User", required: true},
        recieverId: {type: mongoose.Schema.Types.ObjectId, ref: "User", required: true},
        content: {type:String,required:true}
    },
    {timestamps:true}
)

messageSchema.index({taskId: 1,createdAt:1})

export default mongoose.model("Message",messageSchema)