"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/models/post.model.ts
const mongoose_1 = __importDefault(require("mongoose"));
const postSchema = new mongoose_1.default.Schema({
    caption: String,
    originalVideo: String,
    compressedVideo: String,
    thumbnail: String,
    hlsUrl: String,
    status: {
        type: String,
        enum: ["processing", "completed", "failed"],
        default: "processing",
    },
}, { timestamps: true });
exports.default = mongoose_1.default.model("Post", postSchema);
