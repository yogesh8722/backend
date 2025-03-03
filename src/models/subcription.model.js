import mongoose,{Schema} from "mongoose"

const subcriptionSchema =new Schema({
    suscriber:{
        type:Schema.Types.ObjectId,
        ref:"User"
    },
    channel:{
        type:Schema.Types.ObjectId,
        ref:"User"
    }
},{timestamps:true})

const Subcription=mongoose.model("Subcription",subcriptionSchema)