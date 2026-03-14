import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import investigationsRouter from "./routes/Investigations.js";


dotenv.config({ quiet: true });

const app = express();

app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected");
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
  });

app.get("/api/ping", (_req, res) => {
  res.json({
    status: "TRACE backend alive",
    database: mongoose.connection.readyState === 1 ? "connected" : "not connected",
  });
});

app.use("/api/investigations", investigationsRouter);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 TRACE API running on port ${PORT}`);
});