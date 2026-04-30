import express from "express";
import {
  login,
  logout,
  signup,
  verifyEmail,
  forgotPassword,
  resetPassword,
  checkAuth,
  generateVerificationToken,
  updateProfilePicture,
  verifyIdentity,
} from "../controllers/auth.controller.js";
import { protectRoute, selfOrAdmin } from "../middleware/protectRoute.js";
import { upload } from "../lib/multer.config.js";

const authRoutes = express.Router();

authRoutes.get("/check-auth", protectRoute, checkAuth);
authRoutes.post("/signup", signup);
authRoutes.post("/login", login);
authRoutes.post("/logout", logout);
authRoutes.post("/verify-email", verifyEmail);
authRoutes.put("/verify-identity", protectRoute, selfOrAdmin, verifyIdentity);
authRoutes.post("/generate-verification-token", generateVerificationToken);
authRoutes.post("/forgot-password", forgotPassword);
authRoutes.post("/reset-password/:token", resetPassword);
authRoutes.put(
  "/update-profile-picture",
  protectRoute,
  upload.single("profilePicture"),
  updateProfilePicture,
);

export default authRoutes;
