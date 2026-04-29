import dotenv from "dotenv";
import {
  VERIFICATION_EMAIL_TEMPLATE,
  WELCOME_EMAIL_TEMPLATE,
  PASSWORD_RESET_REQUEST_TEMPLATE,
  PASSWORD_RESET_SUCCESS_TEMPLATE,
} from "./emailTemplate.js";

dotenv.config();

const {
  BREVO_API_KEY,
  BREVO_ENDPOINT,
  EMAIL_SENDER_NAME,
  EMAIL_SENDER_ADDRESS,
} = process.env;

if (!BREVO_API_KEY || !BREVO_ENDPOINT) {
  throw new Error("Missing Brevo configuration in .env");
}

export const sendVerificationEmail = async (email, verificationToken) => {
  if (!email || !verificationToken) {
    throw new Error("Email and verification token are required");
  }

  const htmlContent = VERIFICATION_EMAIL_TEMPLATE(verificationToken);

  try {
    const response = await fetch(BREVO_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": BREVO_API_KEY,
      },
      body: JSON.stringify({
        sender: {
          name: EMAIL_SENDER_NAME || "Gregg & Eunice",
          email: EMAIL_SENDER_ADDRESS || "jgdev101613@gmail.com",
        },
        to: [{ email }],
        subject: "Verify your email",
        htmlContent,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data?.message || JSON.stringify(data) || "Email sending failed",
      );
    }

    return {
      success: true,
      message: "Verification email sent",
      data,
    };
  } catch (error) {
    console.error("Brevo Email Error:", {
      message: error.message,
      email,
    });

    return {
      success: false,
      message: error.message,
    };
  }
};

export const sendWelcomeEmail = async (email, name) => {
  if (!email || !name) {
    throw new Error("Email and name are required");
  }

  const htmlContent = WELCOME_EMAIL_TEMPLATE(email, name);

  try {
    const response = await fetch(BREVO_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": BREVO_API_KEY,
      },
      body: JSON.stringify({
        sender: {
          name: EMAIL_SENDER_NAME || "Gregg & Eunice",
          email: EMAIL_SENDER_ADDRESS || "jgdev101613@gmail.com",
        },
        to: [{ email }],
        subject: "Welcome to Campus Check",
        htmlContent,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data?.message || JSON.stringify(data) || "Email sending failed",
      );
    }

    return {
      success: true,
      message: "Welcome Message sent",
      data,
    };
  } catch (error) {
    console.error("Brevo Email Error:", {
      message: error.message,
      email,
    });

    return {
      success: false,
      message: error.message,
    };
  }
};

export const sendPasswordResetEmail = async (email, resetUrl) => {
  if (!email || !resetUrl) {
    throw new Error("Email and reset URL are required");
  }

  const htmlContent = PASSWORD_RESET_REQUEST_TEMPLATE(resetUrl);

  try {
    const response = await fetch(BREVO_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": BREVO_API_KEY,
      },
      body: JSON.stringify({
        sender: {
          name: EMAIL_SENDER_NAME || "Gregg & Eunice",
          email: EMAIL_SENDER_ADDRESS || "jgdev101613@gmail.com",
        },
        to: [{ email }],
        subject: "Reset your password",
        htmlContent,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data?.message || JSON.stringify(data) || "Email sending failed",
      );
    }

    return {
      success: true,
      message: "Password reset email sent",
      data,
    };
  } catch (error) {
    console.error("Brevo Email Error:", {
      message: error.message,
      email,
    });

    return {
      success: false,
      message: error.message,
    };
  }
};

export const sendResetSuccessEmail = async (email) => {
  if (!email) {
    throw new Error("Email is required");
  }

  const htmlContent = PASSWORD_RESET_SUCCESS_TEMPLATE();

  try {
    const response = await fetch(BREVO_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": BREVO_API_KEY,
      },
      body: JSON.stringify({
        sender: {
          name: EMAIL_SENDER_NAME || "Gregg & Eunice",
          email: EMAIL_SENDER_ADDRESS || "jgdev101613@gmail.com",
        },
        to: [{ email }],
        subject: "Password reset successful",
        htmlContent,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data?.message || JSON.stringify(data) || "Email sending failed",
      );
    }

    return {
      success: true,
      message: "Password reset success email sent",
      data,
    };
  } catch (error) {
    console.error("Brevo Email Error:", {
      message: error.message,
      email,
    });

    return {
      success: false,
      message: error.message,
    };
  }
};
