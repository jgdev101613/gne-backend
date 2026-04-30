import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { ENV } from "./utils/env.config.js";

// Database connection
import { connect } from "./db/connection.js";

// Routes
import authRoutes from "./routes/auth.route.js";
import postRoutes from "./routes/post.route.js";
import messageRoutes from "./routes/message.route.js";

const app = express();
const PORT = ENV.PORT;
const origin = [ENV.CLIENT_URL, ENV.CLIENT_ONLINE_URL, "http://localhost:5173"];

app.use(cors({ origin: origin, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/post", postRoutes);
app.use("/api/message", messageRoutes);

app.listen(PORT, () => {
  connect();
  console.log(`GNE Api System Status: Online | Running on port ${PORT}`);
});
