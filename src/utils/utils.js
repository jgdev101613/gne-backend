import jwt from "jsonwebtoken";
import { User } from "../models/User.js";

const isProduction = process.env.NODE_ENV === "production";

export const generateVerificationCode = async () => {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  try {
    const checkCode = await User.findOne({ verificationToken: code });
    if (checkCode) {
      return generateVerificationCode(); // Generate a new code if the current one is already in use
    }
    return code;
  } catch (error) {
    throw error;
  }
};

export const generateTokenAndSetCookie = (res, userId) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  res.cookie("token", token, {
    httpOnly: true,
    sameSite: isProduction ? "none" : "lax",
    secure: isProduction,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return token;
};
