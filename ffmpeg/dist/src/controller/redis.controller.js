"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadVideoPost = void 0;
const redis_1 = require("../db/redis");
const postModel_1 = __importDefault(require("../models/postModel"));
const uploadVideoPost = async (req, res) => {
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
        const post = await postModel_1.default.create({
            caption,
            originalVideo: req.file.path,
            status: "processing",
        });
        let job;
        try {
            job = await redis_1.mediaQueue.add("process-video", {
                postId: post._id.toString(),
                videoPath: req.file.path,
            });
        }
        catch (error) {
            await postModel_1.default.findByIdAndUpdate(post._id, { status: "failed" });
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
    }
    catch (error) {
        console.error("Failed to upload video:", error);
        return res.status(500).json({
            message: "Failed to upload video",
        });
    }
};
exports.uploadVideoPost = uploadVideoPost;
