// src/models/post.model.ts
import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    caption: String,
    originalVideo: String,
    compressedVideo: String,
    thumbnail: String,
    hlsUrl: String,
    status: {
      type: String,
      enum: ["processing", "completed", "failed"],
      default: "processing",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Post", postSchema);