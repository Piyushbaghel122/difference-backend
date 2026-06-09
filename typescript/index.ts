import app from "./src/app";

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`server port: http://localhost:${PORT}`);
});
