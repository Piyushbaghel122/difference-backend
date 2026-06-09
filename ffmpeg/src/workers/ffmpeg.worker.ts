import "dotenv/config";
import { Worker } from "bullmq";
import ffmpeg from "fluent-ffmpeg";
import path from "path";
import { promises as fs } from "fs";
import Post from "../models/postModel";
import { connectDB } from "../db/db";
import { MEDIA_QUEUE_NAME, workerRedisOptions } from "../db/redis";

type ProcessVideoJob = {
  postId: string;
  videoPath: string;
};

const processVideo = (input: string, output: string) => {
  return new Promise<void>((resolve, reject) => {
    ffmpeg(input)
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

const createThumbnail = (input: string, outputFolder: string) =>
  new Promise<void>((resolve, reject) => {
    ffmpeg(input)
      .screenshots({
        timestamps: ["00:00:02"],
        filename: "thumbnail.jpg",
        folder: outputFolder,
      })
      .on("end", () => resolve())
      .on("error", reject);
  });

const createHLS = (input: string, outputFolder: string) =>
  new Promise<void>((resolve, reject) => {
    ffmpeg(input)
      .outputOptions([
        "-profile:v baseline",
        "-level 3.0",
        "-start_number 0",
        "-hls_time 10",
        "-hls_list_size 0",
        "-f hls",
      ])
      .output(path.join(outputFolder, "index.m3u8"))
      .on("end", () => resolve())
      .on("error", reject)
      .run();
  });

const worker = new Worker<ProcessVideoJob>(
  MEDIA_QUEUE_NAME,
  async (job) => {
    const { postId, videoPath } = job.data;
    const outputFolder = path.resolve("processed", postId);
    const compressedPath = path.join(outputFolder, "compressed.mp4");

    await fs.mkdir(outputFolder, { recursive: true });

    try {
      await processVideo(videoPath, compressedPath);
      await createThumbnail(compressedPath, outputFolder);
      await createHLS(compressedPath, outputFolder);

      await Post.findByIdAndUpdate(postId, {
        compressedVideo: compressedPath,
        thumbnail: path.join(outputFolder, "thumbnail.jpg"),
        hlsUrl: path.join(outputFolder, "index.m3u8"),
        status: "completed",
      });

      console.log("Video processed:", postId);
    } catch (error) {
      await Post.findByIdAndUpdate(postId, { status: "failed" });
      console.error("FFmpeg error:", error);
      throw error;
    }
  },
  {
    connection: workerRedisOptions,
    autorun: false,
  }
);

worker.on("completed", (job) => {
  console.log(`Video job ${job.id} completed`);
});

worker.on("failed", (job, error) => {
  console.error(`Video job ${job?.id} failed:`, error);
});

const verifyFFmpeg = () =>
  new Promise<void>((resolve, reject) => {
    ffmpeg.getAvailableCodecs((error, codecs) => {
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
  await connectDB();
  console.log("FFmpeg worker started");
  await worker.run();
}

startWorker().catch(async (error) => {
  console.error("Failed to start FFmpeg worker:", error);
  await worker.close();
  process.exitCode = 1;
});
