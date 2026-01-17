const express = require("express");
const { login, signup } = require("../controllers/authController");
const checkDb = require("../middleware/dbHealth");

const router = express.Router();

router.post("/login", login);
router.post("/signup", checkDb, signup);

module.exports = router;
