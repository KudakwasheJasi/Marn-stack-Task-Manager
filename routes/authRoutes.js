import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { validateEmail, validatePassword, validateName, sanitizeInput } from "../utils/validation.js";
import { protectRoute as authenticateToken } from "../middlewares/authMiddlewave.js";

const router = express.Router();

// Test route - useful for debugging
router.get('/test', (_, res) => {
    res.json({ status: true, message: 'Auth routes are working!' });
});

// Login route - simplified and improved error handling
router.post("/login", async (req, res) => {
    try {
        console.log('Login attempt:', req.body); // Debug log
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                status: false,
                message: "Email and password are required"
            });
        }

        const sanitizedEmail = sanitizeInput(email.toLowerCase(), true);

        const user = await User.findOne({ email: sanitizedEmail });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({
                status: false,
                message: "Invalid email or password"
            });
        }

        const token = jwt.sign(
            { 
                userId: user._id,
                email: user.email,
                isAdmin: user.isAdmin
            },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        // Update last login
        await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });

        res.status(200).json({
            status: true,
            message: "Login successful",
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                isAdmin: user.isAdmin
            },
            token
        });

    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({
            status: false,
            message: "Server error during login"
        });
    }
});

// Register route - keeping core functionality but improving error handling
router.post("/register", async (req, res) => {
    try {
        console.log('Registration attempt:', req.body); // Debug log
        const { name, email, password } = req.body;

        const sanitizedName = sanitizeInput(name);
        const sanitizedEmail = sanitizeInput(email.toLowerCase(), true);

        // Combined validation check
        if (!sanitizedName || !sanitizedEmail || !password || 
            !validateName(sanitizedName) || 
            !validateEmail(sanitizedEmail) || 
            !validatePassword(password)) {
            return res.status(400).json({
                status: false,
                message: "Please check all fields and try again"
            });
        }

        const existingUser = await User.findOne({ email: sanitizedEmail });
        if (existingUser) {
            return res.status(400).json({
                status: false,
                message: "Email already registered"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        const user = await User.create({
            name: sanitizedName,
            email: sanitizedEmail,
            password: hashedPassword,
            createdAt: new Date(),
            isAdmin: false
        });

        const token = jwt.sign(
            { userId: user._id, email: user.email, isAdmin: user.isAdmin },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.status(201).json({
            status: true,
            message: "Registration successful",
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                isAdmin: user.isAdmin
            },
            token
        });

    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({
            status: false,
            message: "Server error during registration"
        });
    }
});

// Get current user (protected route)
router.get("/me", authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId)
            .select("-password")
            .lean();

        if (!user) {
            return res.status(404).json({
                status: false,
                message: "User not found"
            });
        }

        res.json({
            status: true,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                isAdmin: user.isAdmin,
                createdAt: user.createdAt,
                lastLogin: user.lastLogin
            }
        });

    } catch (error) {
        console.error("Get user error:", error);
        res.status(500).json({
            status: false,
            message: "Failed to fetch user details"
        });
    }
});

// Logout route
router.post("/logout", authenticateToken, (req, res) => {
    try {
      
        res.json({
            status: true,
            message: "Logged out successfully"
        });
    } catch (error) {
        console.error("Logout error:", error);
        res.status(500).json({
            status: false,
            message: "Logout failed"
        });
    }
});

export default router;