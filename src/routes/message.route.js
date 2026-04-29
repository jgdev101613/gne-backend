import express from "express";
import { upload } from "../lib/multer.config.js";
import { protectRoute, selfOrAdmin } from "../middleware/protectRoute.js";
import {
  getMessages,
  createMessage,
  updateMessage,
  deletePost,
  getMessageById,
} from "../controllers/message.controller.js";

const messageRoutes = express.Router();

messageRoutes.get("/", protectRoute, getMessages);
messageRoutes.get("/:id", protectRoute, getMessageById);

messageRoutes.post(
  "/",
  protectRoute,
  selfOrAdmin,
  upload.fields([
    { name: "images", maxCount: 5 },
    { name: "videos", maxCount: 5 },
  ]),
  createMessage,
);

messageRoutes.put(
  "/:id",
  protectRoute,
  selfOrAdmin,
  upload.fields([
    { name: "images", maxCount: 5 },
    { name: "videos", maxCount: 5 },
  ]),
  updateMessage,
);

messageRoutes.delete("/:id", protectRoute, selfOrAdmin, deletePost);

export default messageRoutes;
