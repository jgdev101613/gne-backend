import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";

// Database connection
import { connect } from "./db/connection.js";

// Routes
import authRoutes from "./routes/auth.route.js";
import postRoutes from "./routes/post.route.js";
import messageRoutes from "./routes/message.route.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const origin = [process.env.CLIENT_URL, "https://gne-ourstory.netlify.app"];

app.use(cors({ origin: origin, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/post", postRoutes);
app.use("/api/message", messageRoutes);

app.listen(PORT, () => {
  connect();
  console.log(`Server is running on PORT: ${PORT}`);
});
