const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");

const router = express.Router();

// Signup
router.post("/signup", async (req, res) => {
    try {

        const {
            name,
            email,
            password
        } = req.body;

        // Validation
        if (
            !name ||
            !email ||
            !password
        ) {
            return res.status(400).json({
                msg:
                    "name, email and password are required"
            });
        }

        // Normalize email
        const normalizedEmail =
            email.toLowerCase().trim();

        // Check existing user
        const existing =
            await User.findOne({
                email: normalizedEmail
            });

        if (existing) {
            return res.status(409).json({
                msg: "Email is already in use"
            });
        }

        // Password length validation
        if (password.length < 6) {
            return res.status(400).json({
                msg:
                    "Password must be at least 6 characters"
            });
        }

        // Hash password
        const hashed =
            await bcrypt.hash(password, 10);

        // FORCE MEMBER ROLE
        const user = await User.create({
            name: name.trim(),
            email: normalizedEmail,
            password: hashed,
            role: "member"
        });

        // Create token
        const token = jwt.sign(
            {
                id: user._id.toString(),
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "24h"
            }
        );

        res.status(201).json({
            token,
            user: {
                id: user._id,
                name: user.name,
                role: user.role,
                email: user.email
            }
        });

    } catch (error) {

        res.status(500).json({
            msg: "Signup failed",
            error: error.message
        });

    }
});

// Login
router.post("/login", async (req, res) => {
    try {

        const {
            email,
            password
        } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({
                msg:
                    "email and password are required"
            });
        }

        // Normalize email
        const normalizedEmail =
            email.toLowerCase().trim();

        // Find user
        const user =
            await User.findOne({
                email: normalizedEmail
            });

        if (!user) {
            return res.status(400).json({
                msg: "User not found"
            });
        }

        // Compare password
        const match =
            await bcrypt.compare(
                password,
                user.password
            );

        if (!match) {
            return res.status(400).json({
                msg: "Wrong password"
            });
        }

        // Create token
        const token = jwt.sign(
            {
                id: user._id.toString(),
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "24h"
            }
        );

        res.json({
            token,
            user: {
                id: user._id,
                name: user.name,
                role: user.role,
                email: user.email
            }
        });

    } catch (error) {

        res.status(500).json({
            msg: "Login failed",
            error: error.message
        });

    }
});

module.exports = router;