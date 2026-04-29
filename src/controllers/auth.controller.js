import {
  generateTokenAndSetCookie,
  generateVerificationCode,
} from "../utils/utils.js";
import { User } from "../models/User.js";
import bcryptjs from "bcryptjs";
import crypto from "crypto";
import {
  sendVerificationEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendResetSuccessEmail,
} from "../mailtrap/emails.js";
import imagekit from "../lib/imagekit.config.js";

export const signup = async (req, res) => {
  const { email, password, name } = req.body;

  try {
    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Password Validations
    const errors = [];

    if (password.length < 8) {
      errors.push("Password must be at least 8 characters");
    }

    if (!/[A-Z]/.test(password)) {
      errors.push("Password must contain an uppercase letter");
    }

    if (!/[a-z]/.test(password)) {
      errors.push("Password must contain a lowercase letter");
    }

    if (!/\d/.test(password)) {
      errors.push("Password must contain a number");
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push("Password must contain a special character");
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Password is too weak",
        errors,
      });
    }

    const userAlreadyExist = await User.findOne({ email });
    if (userAlreadyExist) {
      return res
        .status(400)
        .json({ message: "User already exists", success: false });
    }

    const hashedPassword = await bcryptjs.hash(password, 10);
    const verificationToken = await generateVerificationCode();

    const newUser = new User({
      email,
      password: hashedPassword,
      name,
      verificationToken,
      verificationTokenExpiresAt: Date.now() + 15 * 60 * 1000, // 15 minutes
    });

    await newUser.save();

    generateTokenAndSetCookie(res, newUser._id);

    await sendVerificationEmail(newUser.email, verificationToken);

    res.status(201).json({
      message: "User regsitered successfully",
      success: true,
      user: {
        ...newUser._doc,
        password: undefined,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
      success: false,
      error: error.message,
    });
  }
};

export const generateVerificationToken = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User not found with this email" });
    }
    if (user.isVerified) {
      return res
        .status(400)
        .json({ success: false, message: "Email is already verified" });
    }
    if (user.verificationTokenExpiresAt > Date.now()) {
      return res.status(400).json({
        success: false,
        message:
          "Current verification token is still valid. Please check your email.",
      });
    }

    const newVerificationToken = await generateVerificationCode();
    user.verificationToken = newVerificationToken;
    user.verificationTokenExpiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes
    await user.save();
    await sendVerificationEmail(user.email, newVerificationToken);
    res.status(200).json({
      success: true,
      message: "New verification token generated and email sent",
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
      success: false,
      error: error.message,
    });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email and password are required",
    });
  }
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Email not found" });
    }

    const isPasswordValid = await bcryptjs.compare(password, user.password);
    if (!isPasswordValid) {
      return res
        .status(400)
        .json({ success: false, message: "Incorrect password" });
    }

    generateTokenAndSetCookie(res, user._id);

    user.lastLogin = Date.now();
    await user.save();

    res.status(200).json({
      success: true,
      message: "Logged in successfully",
      user: {
        ...user._doc,
        password: undefined,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
      success: false,
      error: error.message,
    });
  }
};

export const logout = async (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ success: true, message: "Logged out successfully" });
};

export const verifyEmail = async (req, res) => {
  const { code, email } = req.body;
  try {
    const user = await User.findOne({
      email,
      verificationToken: code,
      verificationTokenExpiresAt: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification code",
      });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiresAt = undefined;

    await user.save();

    await sendWelcomeEmail(user.email, user.name);

    res.status(200).json({
      success: true,
      message: "Email verified successfully",
      user: { ...user._doc, password: undefined },
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
      success: false,
      error: error.message,
    });
  }
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "No user found with this email",
      });
    }

    const resetToken = crypto.randomBytes(20).toString("hex");
    const resetTokenExpiresAt = Date.now() + 60 * 15 * 1000; // 15 minutes

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpiresAt = resetTokenExpiresAt;

    await user.save();

    await sendPasswordResetEmail(
      user.email,
      `${process.env.CLIENT_URL}/reset-password/${resetToken}`,
    );

    res.status(200).json({
      success: true,
      message: "Password reset email sent",
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
      success: false,
      error: error.message,
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpiresAt: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired password reset token",
      });
    }

    // Update Password
    const hashedPassword = await bcryptjs.hash(password, 10);
    // await user.updateOne({ _id: user._id }, { password: hashedPassword });
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiresAt = undefined;

    await user.save();

    await sendResetSuccessEmail(user.email);

    res.status(200).json({
      success: true,
      message: "Password reset successful",
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
      success: false,
      error: error.message,
    });
  }
};

export const checkAuth = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }
    res.status(200).json({ success: true, user });
  } catch (error) {
    console.error("Check Auth Error:", error);
    res.status(500).json({
      message: "Internal Server Error",
      success: false,
      error: error.message,
    });
  }
};

export const updateProfilePicture = async (req, res) => {
  const userId = req.userId;

  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "No image provided",
    });
  }

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // 1. Delete old profile picture (if exists)
    if (user.profilePicture?.fileId) {
      await imagekit.deleteFile(user.profilePicture.fileId).catch(() => null);
    }

    // 2. Upload new image with compression
    const result = await imagekit.upload({
      file: req.file.buffer,
      fileName: `profile_${userId}`,
      folder: `users/${userId}/profile`,

      // 👇 This is where compression happens
      transformations: {
        pre: "q-70", // reduce quality to ~70%
      },
    });

    // 3. Save new profile picture
    user.profilePicture = {
      url: result.url,
      fileId: result.fileId,
    };

    await user.save();

    return res.status(200).json({
      success: true,
      profilePicture: user.profilePicture,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Profile picture update failed",
      error: error.message,
    });
  }
};

// export const getImageKitAuth = (req, res) => {
//   try {
//     const result = imagekit.getAuthenticationParameters();
//     return res.json(result);
//   } catch (error) {
//     return res.status(500).json({
//       message: "Auth generation failed",
//     });
//   }
// };
