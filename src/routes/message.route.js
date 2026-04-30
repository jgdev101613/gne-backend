import express from "express";
import { upload } from "../lib/multer.config.js";
import { protectRoute, selfOrAdmin } from "../middleware/protectRoute.js";
import {
  getMessages,
  createMessage,
  updateMessage,
  deleteMessage,
  getMessageById,
  getMessagesByMonth,
} from "../controllers/message.controller.js";

const messageRoutes = express.Router();

messageRoutes.get("/", protectRoute, getMessages);
messageRoutes.get("/:id", protectRoute, getMessageById);
messageRoutes.get("/:year/:month", protectRoute, getMessagesByMonth);

messageRoutes.post(
  "/",
  protectRoute,
  selfOrAdmin,
  upload.fields([
    { name: "images", maxCount: 5 },
    { name: "videos", maxCount: 5 },
    { name: "audio", maxCount: 1 },
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
    { name: "audio", maxCount: 1 },
  ]),
  updateMessage,
);

messageRoutes.delete("/:id", protectRoute, selfOrAdmin, deleteMessage);

export default messageRoutes;
