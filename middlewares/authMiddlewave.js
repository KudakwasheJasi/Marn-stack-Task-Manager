import jwt from "jsonwebtoken";
import User from "../models/User.js";

const protectRoute = async (req, res, next) => {
    try {
        // Check for token in cookies or Authorization header
        let token = req.cookies?.token || req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ 
                status: false, 
                message: "Not authorized. No token provided." 
            });
        }

        // Verify token
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

        // Get user from database
        const user = await User.findById(decodedToken.userId).select("isAdmin email");
        
        if (!user) {
            return res.status(401).json({ 
                status: false, 
                message: "User not found." 
            });
        }

        // Add user info to request
        req.user = {
            email: user.email,
            isAdmin: user.isAdmin,
            userId: decodedToken.userId,
        };

        next();
    } catch (error) {
        console.error("Auth middleware error:", error);
        return res.status(401).json({ 
            status: false, 
            message: "Not authorized. Invalid token." 
        });
    }
};

const isAdminRoute = (req, res, next) => {
    if (req.user && req.user.isAdmin) {
        next();
    } else {
        return res.status(401).json({
            status: false,
            message: "Not authorized as admin."
        });
    }
};

export { protectRoute, isAdminRoute };