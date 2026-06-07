import { Redis } from "ioredis";

const redisPort = Number(process.env.REDIS_PORT);

if (!Number.isInteger(redisPort) || redisPort < 0 || redisPort > 65535) {
    throw new Error("REDIS_PORT must be a valid port number");
}

const redisConnection = new Redis({
    host: process.env.REDIS_HOST,
    port: redisPort,
    password: process.env.REDIS_PASSWORD,
    username: process.env.REDIS_USERNAME,
});

redisConnection.on("connect", () => {
    console.log("Redis connected");
});

redisConnection.on("close", () => {
    console.log("Redis disconnected");
});

redisConnection.on("error", (error: Error) => {
    console.error("Redis connection error:", error);
});

export default redisConnection;
