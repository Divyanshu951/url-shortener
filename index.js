import "dotenv/config";
import express from "express";
import userRouter from "./routes/user.routes.js";

const app = express();
const PORT = process.env.PORT ?? 8000;

app.use(express.json());

app.get("/", (req, res) => {
  return res.json({ suc: "yoo" });
});

// ROUTES
app.use("/user", userRouter);

app.listen(PORT, () => {
  console.log(`App running at port ${PORT}`);
});
