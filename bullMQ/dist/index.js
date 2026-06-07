"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bullmq_1 = require("bullmq");
const redis_1 = require("./redis");
const notificationQueue = new bullmq_1.Queue("email-queue", {
    connection: redis_1.redisConnection
});
async function init() {
    try {
        const job = await notificationQueue.add("email-to-piyush", {
            email: "piyushkumar898923@gmail.com",
            subject: "Welcome message",
            body: "Hey Piyush, welcome"
        });
        console.log("Job added to queue:", job.id);
    }
    catch (error) {
        console.error("Failed to add job to queue:", error);
        process.exitCode = 1;
    }
    finally {
        await notificationQueue.close();
    }
}
void init();
