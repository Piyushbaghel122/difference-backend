"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const app_1 = __importDefault(require("./src/app"));
const http_1 = __importDefault(require("http"));
const db_1 = require("./src/db/db");
const redis_1 = __importDefault(require("./src/db/redis"));
const PORT = 4000;
const server = http_1.default.createServer(app_1.default);
(0, db_1.connectDB)()
    .then(() => {
    server.listen(PORT, () => {
        console.log(`server port http://localhost:${PORT}`);
    });
    redis_1.default.ping().catch((err) => {
        console.error("Redis is unavailable; queue requests will return 503:", err.message);
    });
})
    .catch((err) => {
    console.error("error", err);
});
