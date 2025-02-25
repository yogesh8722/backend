import express from "express";
import connectDB from "./db/db.js";
import config from "./config/config.js";

const app = express();

// MongoDB Connect
connectDB();

app.get("/", (req, res) => {
  res.send("API is running...");
});

app.listen(config.PORT, () => {
  console.log(`Server running on port ${config.PORT}`);
});
