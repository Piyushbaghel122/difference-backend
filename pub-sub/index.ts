import express from "express";

const app = express();
const port = Number(process.env.PORT || 5000);

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Pub-sub API is running"
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
