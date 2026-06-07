"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const ioredis_1 = __importDefault(require("ioredis"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";
app.use(express_1.default.json());
const redis = new ioredis_1.default(REDIS_URL, {
    maxRetriesPerRequest: 1,
    retryStrategy(times) {
        return Math.min(times * 200, 2000);
    },
});
redis.on("connect", () => {
    console.log("Redis connected");
});
redis.on("error", (error) => {
    console.error(`Redis connection error: ${error.message}. Make sure Redis is running at ${REDIS_URL}`);
});
function otpKey(phone) {
    return `otp:${phone}`;
}
function isRedisReady() {
    return redis.status === "ready";
}
function sendRedisUnavailable(res) {
    return res.status(503).json({
        message: "Redis is unavailable. Start Redis and try again.",
    });
}
app.post("/otp", async (req, res) => {
    if (!isRedisReady()) {
        return sendRedisUnavailable(res);
    }
    const { phone } = req.body ?? {};
    if (!phone) {
        return res.status(400).json({ message: "phone is required" });
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await redis.set(otpKey(phone), otp, "EX", 30);
    res.json({ message: "OTP sent", otp });
});
app.post("/verify", async (req, res) => {
    if (!isRedisReady()) {
        return sendRedisUnavailable(res);
    }
    const { phone, otp } = req.body ?? {};
    if (!phone || !otp) {
        return res.status(400).json({ message: "phone and otp are required" });
    }
    const savedOtp = await redis.get(otpKey(phone));
    if (savedOtp !== otp) {
        return res.json({ message: "invalid otp" });
    }
    await redis.del(otpKey(phone));
    res.json({ message: "OTP verified" });
});
app.get("/otp/:phone/ttl", async (req, res) => {
    if (!isRedisReady()) {
        return sendRedisUnavailable(res);
    }
    const ttl = await redis.ttl(otpKey(req.params.phone));
    res.json({ ttl });
});
app.use((error, _req, res, _next) => {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
});
app.listen(PORT, () => {
    console.log(`OTP service running on port ${PORT}`);
});
