import jwt from "jsonwebtoken";
import { User } from "../models/User.js"; 

// ✅ User Authentication Middleware
export const isAuth = async (req, res, next) => {
    try {
        // ✅ Extract token from Authorization header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(403).json({
                message: "Access denied. No token provided."
            });
        }

        const token = authHeader.split(" ")[1]; // ✅ Extract token correctly

        // ✅ Verify JWT Token
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decodedToken.id).select("-password"); // ✅ Exclude password

        if (!req.user) {
            return res.status(401).json({ message: "User not found. Unauthorized access." });
        }

        next(); // ✅ Move to the next middleware or route handler

    } catch (error) {
        console.error("Auth Middleware Error:", error);
        return res.status(401).json({ message: "Invalid or expired token. Please log in again." });
    }
};

// ✅ Admin Authorization Middleware
export const isAdmin = (req, res, next) => {
    try {
        if (!req.user || req.user.role !== "admin") {
            return res.status(403).json({
                message: "Access denied. Admins only."
            });
        }
        next();
    } catch (error) {
        console.error("Admin Middleware Error:", error);
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};
