import "dotenv/config";
import app from "./src/app";
import http from "http";
import { connectDB } from "./src/db/db";
import redisConnection from "./src/db/redis";

const PORT = 4000;

const server = http.createServer(app);

connectDB()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`server port http://localhost:${PORT}`);
    });

    redisConnection.ping().catch((err) => {
      console.error(
        "Redis is unavailable; queue requests will return 503:",
        err.message
      );
    });
  })
  .catch((err) => {
    console.error("error", err);
  });
