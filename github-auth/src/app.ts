import express from "express";

const app = express();

app.get("/", (req, res) => {
  res.send("hello-world");
});

app.use(express.json());

export default app;
