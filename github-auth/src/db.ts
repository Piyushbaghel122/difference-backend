import mongoose from "mongoose";


export async function conntionDB() {
  try {
    await mongoose.connect("mongodb://localhost:27017/github-auth");
    console.log("db connected");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    throw err;
  }
}
