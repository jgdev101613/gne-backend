import { ENV } from "../utils/env.config.js";

/* ─────────────────────────────
   BRAND + COLOR SYSTEM
───────────────────────────── */

const PRIMARY = ENV.EMAIL_PRIMARY_COLOR || "#a855f7";
const ACCENT = ENV.EMAIL_SECONDARY_COLOR || "#d81b60";

/* softer, more readable email background */
const BG = "#f6f7fb";
const CARD_BG = "#ffffff";
const TEXT = "#111827";
const MUTED = "#6b7280";

/* optional header image */
const CLIENT_ONLINE = ENV.CLIENT_ONLINE_URL;
const HEADER_BG =
  ENV.EMAIL_HEADER_BG || "https://ik.imagekit.io/gne/email-image";

/* ─────────────────────────────
   BASE TEMPLATE (LIGHT + PREMIUM EMAIL STYLE)
───────────────────────────── */

const BASE_TEMPLATE = (content) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>

  <style>
    @import url("https://fonts.googleapis.com/css2?family=Nunito:ital,wght@0,200..1000;1,200..1000&family=Playwrite+NO:wght@100..400&display=swap");
    body {
      margin:0;
      padding:0;
      background:${BG};
      font-family:"Nunito", sans-serif;
    }

    .title {
      font-family:"Playwrite NO", serif;
    }

    @media only screen and (max-width:600px) {
      .card { width:100% !important; border-radius:0 !important; }
    }
  </style>
</head>

<body>

<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;">
  <tr>
    <td align="center">

      <!-- CARD -->
      <table width="520" cellpadding="0" cellspacing="0"
        style="
          background:${CARD_BG};
          border-radius:18px;
          border:1px solid #e5e7eb;
          overflow:hidden;
        ">

        <!-- HEADER WITH IMAGE -->
        <tr>
          <td style="
            padding:34px;
            text-align:center;
            background-image:url('${HEADER_BG}');
            background-size:cover;
            background-position:center;
            position:relative;
          ">

            <!-- overlay for readability -->
            <div style="
              position:absolute;
              inset:0;
              background:rgba(255,255,255,0.75);
            "></div>

            <div style="position:relative;">

              <div style="
                font-size:20px;
                font-weight:800;
                color:#fff;
                letter-spacing:0.5px;
              ">
                Gregg & Eunice
              </div>

              <div style="
                font-size:12px;
                color:#fff;
                margin-top:4px;
              ">
                Our Story
              </div>

            </div>
          </td>
        </tr>

        <!-- BODY -->
        <tr>
          <td style="padding:34px;color:${TEXT};">
            ${content}
          </td>
        </tr>

        <!-- FOOTER -->
        <tr>
          <td style="
            padding:16px 26px;
            border-top:1px solid #f1f5f9;
            background:#fafafa;
          ">
            <table width="100%">
              <tr>
                <td style="font-size:11px;color:${MUTED};">
                  Automated message — do not reply
                </td>

                <td align="right" style="font-size:11px;color:${MUTED};">
                  Gregg & Eunice
                </td>
              </tr>
            </table>
          </td>
        </tr>

      </table>

    </td>
  </tr>
</table>

</body>
</html>
`;

/* ─────────────────────────────
   VERIFICATION EMAIL
───────────────────────────── */

export const VERIFICATION_EMAIL_TEMPLATE = (code) =>
  BASE_TEMPLATE(`
    <div style="text-align:center">

      <h2 style="margin:0 0 8px;color:${TEXT};font-size:22px;">
        Verify your email
      </h2>

      <p style="color:${MUTED};font-size:14px;line-height:1.6;">
        Enter the code below to continue.
      </p>

      <div style="
        display:inline-block;
        margin-top:20px;
        padding:16px 22px;
        border-radius:12px;
        background:#f9fafb;
        border:1px solid #e5e7eb;
        font-size:26px;
        letter-spacing:6px;
        font-weight:700;
        color:${TEXT};
        font-family:monospace;
      ">
        ${code}
      </div>

      <p style="margin-top:18px;color:${MUTED};font-size:12px;">
        Code expires in 15 minutes
      </p>

    </div>
  `);

/* ─────────────────────────────
   PASSWORD RESET SUCCESS (FIXED)
───────────────────────────── */

export const PASSWORD_RESET_SUCCESS_TEMPLATE = () =>
  BASE_TEMPLATE(`
    <div style="text-align:center">

      <div style="font-size:42px;margin-bottom:10px;">✨</div>

      <h2 style="margin:0 0 8px;color:${TEXT};">
        Password updated
      </h2>

      <p style="color:${MUTED};font-size:14px;">
        Your account is now secure with your new password.
      </p>

      <div style="
        margin-top:20px;
        padding:16px;
        border-radius:12px;
        background:#f9fafb;
        border:1px solid #e5e7eb;
        text-align:left;
        font-size:13px;
        color:${TEXT};
        line-height:1.6;
      ">
        ✔ Password encrypted<br/>
        ✔ Sessions refreshed<br/>
        ✔ Previous devices logged out
      </div>

      <a href="#" style="
        display:inline-block;
        margin-top:22px;
        padding:12px 26px;
        border-radius:10px;
        background:linear-gradient(135deg, ${PRIMARY}, ${ACCENT});
        color:#fff;
        text-decoration:none;
        font-weight:600;
        font-size:14px;
      ">
        Back to Login
      </a>

    </div>
  `);

export const PASSWORD_RESET_REQUEST_TEMPLATE = (url) =>
  BASE_TEMPLATE(`
    <div style="text-align:center">

      <h2 style="margin:0 0 8px;color:#111827;font-size:22px;">
        Reset your password
      </h2>

      <p style="color:#6b7280;font-size:14px;line-height:1.6;margin:0;">
        We received a request to reset your account password.
        If this wasn't you, you can safely ignore this email.
      </p>

      <!-- INFO CARD -->
      <div style="
        margin-top:20px;
        padding:16px;
        border-radius:12px;
        background:#f9fafb;
        border:1px solid #e5e7eb;
        text-align:left;
      ">

        <div style="
          font-size:11px;
          letter-spacing:1.2px;
          text-transform:uppercase;
          color:#a855f7;
          font-weight:700;
          margin-bottom:8px;
        ">
          Security Notice
        </div>

        <div style="
          font-size:13px;
          color:#374151;
          line-height:1.6;
        ">
          • Your password reset link is unique and secure<br/>
          • It will expire in 1 hour<br/>
          • Only works once
        </div>

      </div>

      <!-- CTA BUTTON -->
      <a href="${url}" style="
        display:inline-block;
        margin-top:24px;
        padding:14px 28px;
        border-radius:10px;
        background:linear-gradient(135deg, #a855f7, #ec4899);
        color:#ffffff;
        text-decoration:none;
        font-weight:600;
        font-size:14px;
      ">
        Reset Password
      </a>

      <!-- FOOTNOTE -->
      <p style="
        margin-top:18px;
        color:#6b7280;
        font-size:12px;
        line-height:1.5;
      ">
        If you didn’t request this, no action is required.
      </p>

    </div>
  `);

/* ─────────────────────────────
   WELCOME EMAIL
───────────────────────────── */

export const WELCOME_EMAIL_TEMPLATE = (email, name = "User") =>
  BASE_TEMPLATE(`
    <h2 style="color:${TEXT};margin:0 0 8px;">
      Welcome, ${name}
    </h2>

    <p style="color:${MUTED};font-size:14px;line-height:1.6;">
      You are now part of Gregg & Eunice as a Guest for now.
    </p>

    <div style="
      margin-top:18px;
      padding:14px;
      border-radius:12px;
      background:#f9fafb;
      border:1px solid #e5e7eb;
      color:${TEXT};
      font-size:13px;
      line-height:1.6;
    ">
      You need to verify your identity to Gregg to access the main content.
    </div>

    <div style="text-align:center;margin-top:24px;">
      <a href="https://www.facebook.com/jgdev101" style="
        display:inline-block;
        padding:12px 26px;
        border-radius:10px;
        background:linear-gradient(135deg, ${PRIMARY}, ${ACCENT});
        color:#fff;
        text-decoration:none;
        font-weight:600;
      ">
        Verify Identity
      </a>
    </div>
  `);

export const VERIFY_IDENTITY = (name) =>
  BASE_TEMPLATE(`
    <h2 style="color:${TEXT};margin:0 0 8px;">
      Welcome, Babe (${name})
    </h2>

    <p style="color:${MUTED};font-size:14px;line-height:1.6;">
      Your identity has been verified by JGDEV
    </p>

    <div style="
      margin-top:18px;
      padding:14px;
      border-radius:12px;
      background:#f9fafb;
      border:1px solid #e5e7eb;
      color:${TEXT};
      font-size:13px;
      line-height:1.6;
    ">
      You can now participate on monthly messages and many more!
    </div>

    <div style="text-align:center;margin-top:24px;">
      <a href="${CLIENT_ONLINE}" style="
        display:inline-block;
        padding:12px 26px;
        border-radius:10px;
        background:linear-gradient(135deg, ${PRIMARY}, ${ACCENT});
        color:#fff;
        text-decoration:none;
        font-weight:600;
      ">
        Visit Site
      </a>
    </div>
  `);
