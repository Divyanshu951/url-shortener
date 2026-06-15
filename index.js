import express from "express";

const app = express();
const PORT = process.env.PORT ?? 8000;

app.get("/", (req, re) => {
  return res.json({ suc: "yoo" });
});

app.listen(PORT, () => {
  console.log(`App running at port ${PORT}`);
});
