const mongoose = require("mongoose");

const checkDb = (_req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ message: "Database not connected" });
    }
    next();
  } catch (err) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = checkDb;
