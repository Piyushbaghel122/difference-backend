"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const redis_routes_1 = __importDefault(require("./routes/redis.routes"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use("/uploads", express_1.default.static("uploads"));
app.use("/processed", express_1.default.static("processed"));
app.use("/api/posts", redis_routes_1.default);
exports.default = app;
