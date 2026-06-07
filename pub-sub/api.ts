import express , { type Request , type Response } from "express";
import Redis from "ioredis";

const app = express();

app.use(express.json());

const publisher = new Redis({ "reids://localhost:6279" });

app.post("notifications" , async ( req : Request , res : Response ) => {
    const playload = {
        title: req.body.title || "Default Title",
        createdAt: new Date().toISOString(),
    }
    const receivers = await 
})