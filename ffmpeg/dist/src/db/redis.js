"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mediaQueue = exports.MEDIA_QUEUE_NAME = exports.workerRedisOptions = exports.redisOptions = void 0;
const ioredis_1 = require("ioredis");
const bullmq_1 = require("bullmq");
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
    keepAlive: 10000,
    connectTimeout: 10000,
    retryStrategy: (attempt) => Math.min(attempt * 500, 5000),
};
exports.redisOptions = {
    ...baseRedisOptions,
    maxRetriesPerRequest: 1,
};
exports.workerRedisOptions = {
    ...baseRedisOptions,
    maxRetriesPerRequest: null,
};
const redisConnection = new ioredis_1.Redis(exports.redisOptions);
redisConnection.on("connect", () => {
    console.log("Redis connected");
});
redisConnection.on("close", () => {
    console.log("Redis disconnected");
});
redisConnection.on("reconnecting", (delay) => {
    console.log(`Redis reconnecting in ${delay}ms`);
});
redisConnection.on("error", (error) => {
    console.error("Redis connection error:", error);
});
exports.MEDIA_QUEUE_NAME = "media-queue";
exports.mediaQueue = new bullmq_1.Queue(exports.MEDIA_QUEUE_NAME, {
    connection: exports.redisOptions
});
exports.default = redisConnection;
