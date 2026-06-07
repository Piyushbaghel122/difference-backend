import Redis from "ioredis";

const subscriber = new Redis(process.env.REDIS_URL || "redis://localhost:6379");

subscriber.subscribe("notifications", (err) => {
  if (err) {
    console.error("failed to subscribe to channel notifications", err);
  } else {
    console.log("subscribed to channel notifications");
  }
});

