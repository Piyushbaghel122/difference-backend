"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = connectDB;
const mongoose_1 = __importDefault(require("mongoose"));
async function connectDB() {
    try {
        const mongourl = process.env.MONGO_URL ?? "mongodb://localhost:27017/video-processing";
        await mongoose_1.default.connect(mongourl);
        console.log("db connected");
    }
    catch (error) {
        console.log(error);
        throw error;
    }
}
