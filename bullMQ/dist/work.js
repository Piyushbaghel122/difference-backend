"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bullmq_1 = require("bullmq");
const redis_1 = require("./redis");
function sendEmail(data) {
    return new Promise((resolve) => {
        setTimeout(() => {
            console.log(`Email sent to ${data.email}`);
            resolve();
        }, 1000);
    });
}
function main() {
    const worker = new bullmq_1.Worker("email-queue", async (job) => {
        console.log(`Message received, job ID: ${job.id}`);
        console.log(`Sending email to ${job.data.email}`);
        await sendEmail(job.data);
    }, {
        connection: redis_1.redisConnection
    });
    worker.on("completed", (job) => {
        console.log(`Job ${job.id} completed`);
    });
    worker.on("failed", (job, error) => {
        console.error(`Job ${job?.id ?? "unknown"} failed:`, error);
    });
    worker.on("error", (error) => {
        console.error("Worker connection error:", error);
    });
    const shutdown = async (signal) => {
        console.log(`${signal} received. Closing worker...`);
        await worker.close();
        process.exit(0);
    };
    process.once("SIGINT", () => void shutdown("SIGINT"));
    process.once("SIGTERM", () => void shutdown("SIGTERM"));
    console.log("Email worker is waiting for jobs...");
}
main();
