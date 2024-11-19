import express from "express";

import mongoose from "mongoose";

import cors from "cors";

import auth from "./routes/auth.js";
import post from "./routes/post.js";

await mongoose.connect(process.env.MONGODB_URI);

const app = express();
app.use(cors());

app.use(express.json());

app.use("/api/auth", auth);
app.use("/api", post);

app.listen(process.env.PORT, () =>
  console.log(`Server started on port ${process.env.PORT}`)
);
