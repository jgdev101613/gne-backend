import express from "express";
import { upload } from "../lib/multer.config.js";
import { protectRoute, selfOrAdmin } from "../middleware/protectRoute.js";
import {
  getPosts,
  createPost,
  getPostById,
  updatePost,
  deletePost,
} from "../controllers/post.controller.js";

const postRoutes = express.Router();

postRoutes.get("/", protectRoute, getPosts);
postRoutes.post(
  "/",
  protectRoute,
  selfOrAdmin,
  upload.fields([
    { name: "images", maxCount: 5 },
    { name: "videos", maxCount: 5 },
  ]),
  createPost,
);

postRoutes.get("/:id", protectRoute, getPostById);

postRoutes.put(
  "/:id",
  protectRoute,
  selfOrAdmin,
  upload.fields([
    { name: "images", maxCount: 20 },
    { name: "videos", maxCount: 5 },
  ]),
  updatePost,
);

postRoutes.delete("/:id", protectRoute, selfOrAdmin, deletePost);

export default postRoutes;
