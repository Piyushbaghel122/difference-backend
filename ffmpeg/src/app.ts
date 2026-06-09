import express from "express";
import redisRoutes from "./routes/redis.routes";

const app = express();

app.use(express.json());
app.use("/uploads", express.static("uploads"));
app.use("/processed", express.static("processed"));

app.use("/api/posts", redisRoutes);

export default app;
