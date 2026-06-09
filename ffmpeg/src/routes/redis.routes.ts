import { Router } from "express";
import multer from "multer";
import { uploadVideoPost } from "../controller/redis.controller";

const router = Router();
const upload = multer({ dest: "uploads/" });

router.post("/upload-video", upload.single("video"), uploadVideoPost);

export default router;
