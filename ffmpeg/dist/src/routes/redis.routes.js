"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const redis_controller_1 = require("../controller/redis.controller");
const router = (0, express_1.Router)();
const upload = (0, multer_1.default)({ dest: "uploads/" });
router.post("/upload-video", upload.single("video"), redis_controller_1.uploadVideoPost);
exports.default = router;
