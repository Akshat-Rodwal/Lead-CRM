const mongoose = require("mongoose");

const leadSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true // 🔹 search performance
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true, // 🔹 important for CRM
      index: true
    },
    phone: {
      type: String,
      required: true,
      trim: true
    },
    source: {
      type: String,
      enum: ["Website", "Referral", "Ads", "Social", "Other"],
      default: "Website",
      index: true
    },
    status: {
      type: String,
      enum: ["New", "Contacted", "Converted", "Lost"],
      default: "New",
      index: true
    }
  },
  {
    timestamps: true
  }
);

/* 🔹 Compound index for dashboard queries */
leadSchema.index({ status: 1, createdAt: -1 });

/* 🔹 Text index for search (name + email) */
leadSchema.index({
  name: "text",
  email: "text"
});

const Lead = mongoose.model("Lead", leadSchema);

module.exports = Lead;
