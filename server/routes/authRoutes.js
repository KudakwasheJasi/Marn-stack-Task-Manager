/**
    * @description      : 
    * @author           : kudakwashe Ellijah
    * @group            : 
    * @created          : 30/06/2025 - 22:05:55
    * 
    * MODIFICATION LOG
    * - Version         : 1.0.0
    * - Date            : 30/06/2025
    * - Author          : kudakwashe Ellijah
    * - Modification    : 
**/
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { validateEmail, validatePassword, validateName, sanitizeInput } from "../utils/validation.js";
import { protectRoute as authenticateToken } from "../middlewares/authMiddlewave.js";

const router = express.Router();

// Logout route
router.post('/logout', (req, res) => {
    // Clear the token cookie
    res.clearCookie('token');
    
    // Send success response
    res.json({
        status: true,
        message: 'Successfully logged out'
    });
});

// Test route - useful for debugging
router.get('/test', (_, res) => {
    res.json({ status: true, message: 'Auth routes are working!' });
});

// Register route

// Login route - enhanced error handling and response format
router.post("/login", async (req, res) => {
    try {
        console.log('Login attempt:', req.body); // Debug log
        const { email, password } = req.body;

        // Validate email format
        if (!email) {
            console.log('Email is empty');
            return res.status(400).json({
                status: false,
                message: "Email is required",
                data: null
            });
        }

        // Sanitize and normalize email
        const sanitizedEmail = sanitizeInput(email.toLowerCase(), true);
        console.log('Sanitized email:', sanitizedEmail); // Debug log

        // Validate password
        if (!password || password.length < 6) {
            console.log('Invalid password:', password.length);
            return res.status(400).json({
                status: false,
                message: "Password must be at least 6 characters long",
                data: null
            });
        }

        // Find user with password
        console.log('Searching for user with email:', sanitizedEmail);
        const user = await User.findOne({ email: sanitizedEmail }).select('+password');
        
        if (!user) {
            console.log('User not found for email:', sanitizedEmail);
            return res.status(401).json({
                status: false,
                message: "Invalid email or password",
                data: null
            });
        }

        // Compare password
        console.log('Attempting password comparison for user:', user._id);
        console.log('Stored password hash:', user.password);
        console.log('Password hash prefix:', user.password.substring(0, 4));
        console.log('Candidate password:', password);
        
        const startTime = Date.now();
        const passwordMatch = await user.comparePassword(password);
        const duration = Date.now() - startTime;
        console.log('Password comparison took:', duration, 'ms');
        console.log('Password match result:', passwordMatch);

        if (!passwordMatch) {
            console.log('Password comparison failed');
            console.log('Password hash prefix:', user.password.substring(0, 4));
            console.log('Password length:', password.length);
            console.log('Hash length:', user.password.length);
            
            // Try rehashing and comparing
            try {
                const saltRounds = 12;
                const newHash = await bcrypt.hash(password, saltRounds);
                console.log('New hash:', newHash);
                const matchNew = await bcrypt.compare(password, newHash);
                console.log('New hash match:', matchNew);
            } catch (hashError) {
                console.error('Hashing error:', hashError);
            }

            return res.status(401).json({
                status: false,
                message: "Invalid email or password",
                data: null
            });
        }

        // Generate token
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

// Register route - FIXED: do NOT hash password here!
router.post("/register", async (req, res) => {
    try {
        console.log('Registration attempt:', req.body);
        const { name, email, password } = req.body;

        const sanitizedName = sanitizeInput(name);
        const sanitizedEmail = sanitizeInput(email.toLowerCase(), true);

        if (!sanitizedName || !sanitizedEmail || !password ||
            !validateName(sanitizedName) ||
            !validateEmail(sanitizedEmail) ||
            !validatePassword(password)) {
            console.log('Validation failed:', { sanitizedName, sanitizedEmail, password });
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

        // Do NOT hash password here! Let the pre-save hook do it.
        const user = await User.create({
            name: sanitizedName,
            email: sanitizedEmail,
            password, // plain password
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
        let statusCode = 500;
        let message = "Server error during registration";
        
        if (error.name === 'ValidationError') {
            statusCode = 400;
            message = "Invalid input data";
        } else if (error.code === 11000) {
            statusCode = 400;
            message = "Email already registered";
        }
        
        res.status(statusCode).json({
            status: false,
            message
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

// Update user profile route
router.post("/profile/update", authenticateToken, async (req, res) => {
    try {
        const { userId } = req.user;
        const { name, title, role } = req.body;

        // Validate inputs
        if (!name || !title || !role) {
            return res.status(400).json({
                status: false,
                message: "All fields are required"
            });
        }

        // Update user profile
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                name,
                title,
                role,
                updatedAt: new Date()
            },
            { new: true }
        ).select("-password");

        if (!updatedUser) {
            return res.status(404).json({
                status: false,
                message: "User not found"
            });
        }

        res.json({
            status: true,
            message: "Profile updated successfully",
            user: updatedUser
        });
    } catch (error) {
        console.error("Update profile error:", error);
        res.status(500).json({
            status: false,
            message: "Failed to update profile"
        });
    }
});

export default router;