import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(
  cors({
    orgin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());

//import routers
import { userRouter } from "./routes/user.routes.js";
//routes declaration
app.use("/api/v1/users", userRouter);


app.get("/health-check", (req, res) => {
  res.send({msg: "Health-Check done. Server is running fine."});
})

export default app;
