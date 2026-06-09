"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const bullmq_1 = require("bullmq");
const fluent_ffmpeg_1 = __importDefault(require("fluent-ffmpeg"));
const path_1 = __importDefault(require("path"));
const fs_1 = require("fs");
const postModel_1 = __importDefault(require("../models/postModel"));
const db_1 = require("../db/db");
const redis_1 = require("../db/redis");
const processVideo = (input, output) => {
    return new Promise((resolve, reject) => {
        (0, fluent_ffmpeg_1.default)(input)
            .videoCodec("libx264")
            .outputOptions(["-crf 28", "-preset fast"])
            .on("start", (command) => {
            console.log("FFmpeg command:", command);
        })
            .on("end", () => resolve())
            .on("error", (error, stdout, stderr) => {
            console.error("FFmpeg process error:", error.message);
            console.error("FFmpeg stderr:", stderr);
            reject(error);
        })
            .save(output);
    });
};
const createThumbnail = (input, outputFolder) => new Promise((resolve, reject) => {
    (0, fluent_ffmpeg_1.default)(input)
        .screenshots({
        timestamps: ["00:00:02"],
        filename: "thumbnail.jpg",
        folder: outputFolder,
    })
        .on("end", () => resolve())
        .on("error", reject);
});
const createHLS = (input, outputFolder) => new Promise((resolve, reject) => {
    (0, fluent_ffmpeg_1.default)(input)
        .outputOptions([
        "-profile:v baseline",
        "-level 3.0",
        "-start_number 0",
        "-hls_time 10",
        "-hls_list_size 0",
        "-f hls",
    ])
        .output(path_1.default.join(outputFolder, "index.m3u8"))
        .on("end", () => resolve())
        .on("error", reject)
        .run();
});
const worker = new bullmq_1.Worker(redis_1.MEDIA_QUEUE_NAME, async (job) => {
    const { postId, videoPath } = job.data;
    const outputFolder = path_1.default.resolve("processed", postId);
    const compressedPath = path_1.default.join(outputFolder, "compressed.mp4");
    await fs_1.promises.mkdir(outputFolder, { recursive: true });
    try {
        await processVideo(videoPath, compressedPath);
        await createThumbnail(compressedPath, outputFolder);
        await createHLS(compressedPath, outputFolder);
        await postModel_1.default.findByIdAndUpdate(postId, {
            compressedVideo: compressedPath,
            thumbnail: path_1.default.join(outputFolder, "thumbnail.jpg"),
            hlsUrl: path_1.default.join(outputFolder, "index.m3u8"),
            status: "completed",
        });
        console.log("Video processed:", postId);
    }
    catch (error) {
        await postModel_1.default.findByIdAndUpdate(postId, { status: "failed" });
        console.error("FFmpeg error:", error);
        throw error;
    }
}, {
    connection: redis_1.workerRedisOptions,
    autorun: false,
});
worker.on("completed", (job) => {
    console.log(`Video job ${job.id} completed`);
});
worker.on("failed", (job, error) => {
    console.error(`Video job ${job?.id} failed:`, error);
});
const verifyFFmpeg = () => new Promise((resolve, reject) => {
    fluent_ffmpeg_1.default.getAvailableCodecs((error, codecs) => {
        if (error) {
            reject(error);
            return;
        }
        if (!codecs.libx264) {
            reject(new Error("FFmpeg is installed, but libx264 is unavailable"));
            return;
        }
        resolve();
    });
});
async function startWorker() {
    await verifyFFmpeg();
    console.log("FFmpeg connected");
    await (0, db_1.connectDB)();
    console.log("FFmpeg worker started");
    await worker.run();
}
startWorker().catch(async (error) => {
    console.error("Failed to start FFmpeg worker:", error);
    await worker.close();
    process.exitCode = 1;
});
