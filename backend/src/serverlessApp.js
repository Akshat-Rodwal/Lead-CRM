const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/auth", require("./routes/authRoutes"));
app.use("/leads", require("./routes/leadRoutes"));

app.use((err, _req, res, _next) => {
  res.status(500).json({ message: "Internal server error" });
});

module.exports = app;
