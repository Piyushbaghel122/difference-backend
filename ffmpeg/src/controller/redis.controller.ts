import { type Request, type Response } from "express";
import { mediaQueue } from "../db/redis";
import Post from "../models/postModel";

export const uploadVideoPost = async (req: Request, res: Response) => {
  try {
    console.log("Request body:", req.body);
    console.log("Uploaded file:", req.file
      ? {
          originalname: req.file.originalname,
          mimetype: req.file.mimetype,
          size: req.file.size,
          path: req.file.path,
        }
      : null);

    const { caption } = req.body;

    if (!req.file) {
      return res.status(400).json({
        message: "Video is required",
      });
    }

    const post = await Post.create({
      caption,
      originalVideo: req.file.path,
      status: "processing",
    });

    let job;

    try {
      job = await mediaQueue.add("process-video", {
        postId: post._id.toString(),
        videoPath: req.file.path,
      });
    } catch (error) {
      await Post.findByIdAndUpdate(post._id, { status: "failed" });
      console.error("Failed to queue video:", error);

      return res.status(503).json({
        message: "Redis queue is unavailable. Please try again.",
        postId: post._id,
      });
    }

    return res.status(201).json({
      message: "Video uploaded. Processing started.",
      post,
      jobId: job.id,
    });
  } catch (error) {
    console.error("Failed to upload video:", error);

    return res.status(500).json({
      message: "Failed to upload video",
    });
  }
};
