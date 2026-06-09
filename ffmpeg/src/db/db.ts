import mongoose from "mongoose";


export async function connectDB() {
    try {
      const mongourl =
        process.env.MONGO_URL ?? "mongodb://localhost:27017/video-processing";

      await mongoose.connect(mongourl)

      console.log("db connected")
    } catch (error) {
        console.log(error)
        throw error;
    }
}
