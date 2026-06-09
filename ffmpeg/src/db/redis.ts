import { Redis } from "ioredis";
import { Queue } from "bullmq";

const redisUrl = process.env.REDIS_URL
    ? new URL(process.env.REDIS_URL)
    : undefined;

const baseRedisOptions = {
    host: redisUrl?.hostname ?? process.env.REDIS_HOST,
    port: Number(redisUrl?.port ?? process.env.REDIS_PORT),
    password: redisUrl
        ? decodeURIComponent(redisUrl.password)
        : process.env.REDIS_PASSWORD,
    username: redisUrl
        ? decodeURIComponent(redisUrl.username)
        : process.env.REDIS_USERNAME,
    tls: redisUrl?.protocol === "rediss:" ? {} : undefined,
    keepAlive: 10_000,
    connectTimeout: 10_000,
    retryStrategy: (attempt: number) => Math.min(attempt * 500, 5_000),
};

export const redisOptions = {
    ...baseRedisOptions,
    maxRetriesPerRequest: 1,
};

export const workerRedisOptions = {
    ...baseRedisOptions,
    maxRetriesPerRequest: null,
};

const redisConnection = new Redis(redisOptions);

redisConnection.on("connect", () => {
    console.log("Redis connected");
});

redisConnection.on("close", () => {
    console.log("Redis disconnected");
});

redisConnection.on("reconnecting", (delay: number) => {
    console.log(`Redis reconnecting in ${delay}ms`);
});

redisConnection.on("error", (error: Error) => {
    console.error("Redis connection error:", error);
});

export const MEDIA_QUEUE_NAME = "media-queue";

export const mediaQueue = new Queue(MEDIA_QUEUE_NAME, {
    connection: redisOptions
});


export default redisConnection;
