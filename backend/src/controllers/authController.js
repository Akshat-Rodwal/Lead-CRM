const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPassword = process.env.ADMIN_PASSWORD;

        if (!email || !password) {
            return res
                .status(400)
                .json({ message: "Email and password are required" });
        }

        let userFromDb = null;
        try {
            userFromDb = await User.findOne({ email });
        } catch (_e) {}

        let isValid = false;
        if (userFromDb) {
            isValid = await bcrypt.compare(password, userFromDb.password);
        } else {
            if (!adminEmail || !adminPassword) {
                return res
                    .status(500)
                    .json({ message: "Admin credentials are not configured" });
            }
            isValid = email === adminEmail && password === adminPassword;
        }
        if (!isValid) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const secret = process.env.JWT_SECRET;
        if (!secret) {
            return res
                .status(500)
                .json({ message: "JWT_SECRET is not configured" });
        }

        const token = jwt.sign({ email }, secret, { expiresIn: "7d" });

        res.json({
            message: "Login successful",
            user: { email },
            token,
        });
    } catch (error) {
        console.error("Login error:", error.message);
        res.status(500).json({ message: "Server error during login" });
    }
};

const signup = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res
                .status(400)
                .json({ message: "Email and password are required" });
        }
        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(409).json({ message: "User already exists" });
        }
        const hash = await bcrypt.hash(password, 10);
        const user = await User.create({ email, password: hash });
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            return res
                .status(500)
                .json({ message: "JWT_SECRET is not configured" });
        }
        const token = jwt.sign({ email: user.email }, secret, {
            expiresIn: "7d",
        });
        res.status(201).json({
            message: "Signup successful",
            user: { email: user.email },
            token,
        });
    } catch (error) {
        console.error("Signup error:", error.message);
        res.status(500).json({ message: "Server error during signup" });
    }
};

module.exports = { login, signup };
