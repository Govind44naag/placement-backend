import mongoose from 'mongoose'

const connectDB=async()=>{
    try{
        await mongoose.connect(process.env.MONGO_URI)
        console.log("MongoDB connected")
    }
    catch(e){
        console.error(e)
    }
}
export default connectDB
 