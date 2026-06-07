import { Queue } from "bullmq";
import { redisConnection } from "./redis";

const notificationQueue = new Queue("email-queue", {
  connection: redisConnection
});

async function init() {
  try {
    const job = await notificationQueue.add("email-to-piyush", {
      email: "piyushkumar898923@gmail.com",
      subject: "Welcome message",
      body: "Hey Piyush, welcome"
    });

    console.log("Job added to queue:", job.id);
  } catch (error) {
    console.error("Failed to add job to queue:", error);
    process.exitCode = 1;
  } finally {
    await notificationQueue.close();
  }
}

void init();
