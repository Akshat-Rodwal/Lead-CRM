const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const checkDb = require("../middleware/dbHealth");
const {
    getLeads,
    getLeadById,
    getLeadStats,
} = require("../controllers/leadController");

const router = express.Router();

router.get("/", protect, checkDb, getLeads);
router.get("/stats", protect, checkDb, getLeadStats);
router.get("/:id", protect, checkDb, getLeadById);

module.exports = router;
