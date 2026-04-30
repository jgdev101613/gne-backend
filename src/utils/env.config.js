import dotenv from "dotenv";

dotenv.config({ quiet: true });

export const ENV = {
  // Environment variables for the GNE Web System
  MONGO_URI: process.env.MONGO_URI,
  PORT: process.env.PORT,
  NODE_ENV: process.env.NODE_ENV,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,
  CLIENT_URL: process.env.CLIENT_URL,
  CLIENT_ONLINE_URL: process.env.CLIENT_ONLINE_URL,
  BACKEND_API: process.env.BACKEND_API,

  // Email configuration for Brevo
  BREVO_ENDPOINT: process.env.BREVO_ENDPOINT,
  BREVO_API_KEY: process.env.BREVO_API_KEY,
  EMAIL_SENDER_ADDRESS: process.env.EMAIL_SENDER_ADDRESS,
  EMAIL_HEADER_BG: process.env.EMAIL_HEADER_BG,

  // Email template colors
  EMAIL_PRIMARY_COLOR: process.env.EMAIL_PRIMARY_COLOR,
  EMAIL_SECONDARY_COLOR: process.env.EMAIL_SECONDARY_COLOR,
  EMAIL_BG_COLOR: process.env.EMAIL_BG_COLOR,

  // ImageKit configuration
  IMAGEKIT_PUBLIC_KEY: process.env.IMAGEKIT_PUBLIC_KEY,
  IMAGEKIT_PRIVATE_KEY: process.env.IMAGEKIT_PRIVATE_KEY,
  IMAGEKIT_URL_ENDPOINT: process.env.IMAGEKIT_URL_ENDPOINT,
};
