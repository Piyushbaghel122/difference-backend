import express from "express";
import Redis from "ioredis";


const app = express();
app.use(express.json());

const redis = new Redis({
    url: "redis://localhost:6379"
});

app.post("/user/:id/json", async ( req , res) => {
    await redis.set(`user:${req.params.id}:json`, JSON.stringify(req.body))
})

app.post("/user/")