import jwt from "jsonwebtoken";
import { User } from "../models/User.js";

export const protectRoute = (req, res, next) => {
  const token = req.cookies.token;
  if (!token)
    return res
      .status(401)
      .json({ success: false, message: "Unauthorized - No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded || !decoded.userId) {
      return res.status(401).json({ success: false, message: "Invalid token" });
    }

    req.user = decoded;
    req.userId = decoded.userId;
    next();
  } catch (error) {
    console.error("Token verification error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const selfOrAdmin = async (req, res, next) => {
  try {
    const userId = req.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    console.log("User role:", user.role);
    console.log("User ID:", userId);
    console.log("Target ID:", req.params.id);
    if (userId === req.params.id || user.role === "admin") {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: "Access denied",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
