import { Job, Worker } from "bullmq";
import { redisConnection } from "./redis";

type EmailJobData = {
  email: string;
  subject: string;
  body: string;
};

function sendEmail(data: EmailJobData): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log(`Email sent to ${data.email}`);
      resolve();
    }, 1000);
  });
}

function main(): void {
  const worker = new Worker<EmailJobData>(
    "email-queue",
    async (job: Job<EmailJobData>) => {
      console.log(`Message received, job ID: ${job.id}`);
      console.log(`Sending email to ${job.data.email}`);

      await sendEmail(job.data);
    },
    {
      connection: redisConnection
    }
  );

  worker.on("completed", (job) => {
    console.log(`Job ${job.id} completed`);
  });

  worker.on("failed", (job, error) => {
    console.error(`Job ${job?.id ?? "unknown"} failed:`, error);
  });

  worker.on("error", (error) => {
    console.error("Worker connection error:", error);
  });

  const shutdown = async (signal: string) => {
    console.log(`${signal} received. Closing worker...`);
    await worker.close();
    process.exit(0);
  };

  process.once("SIGINT", () => void shutdown("SIGINT"));
  process.once("SIGTERM", () => void shutdown("SIGTERM"));

  console.log("Email worker is waiting for jobs...");
}

main();
