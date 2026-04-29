import { Post } from "../models/Post.js";
import imagekit from "../lib/imagekit.config.js";

export const getPosts = async (req, res) => {
  try {
    const posts = await Post.find().populate("user", "name email");

    return res.status(200).json({
      success: true,
      posts,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const createPost = async (req, res) => {
  const userId = req.userId;
  const { title, content } = req.body;

  if (!title || !content) {
    return res.status(400).json({
      success: false,
      message: "Title and content are required",
    });
  }

  try {
    const images = [];
    const videos = [];

    // --- Upload Images ---
    if (req.files?.images) {
      for (const file of req.files.images) {
        const result = await imagekit.upload({
          file: file.buffer,
          fileName: file.originalname,
          folder: `posts/${userId}/images`,
        });

        images.push({
          url: result.url,
          fileId: result.fileId,
        });
      }
    }

    // --- Upload Videos ---
    if (req.files?.videos) {
      for (const file of req.files.videos) {
        const result = await imagekit.upload({
          file: file.buffer,
          fileName: file.originalname,
          folder: `posts/${userId}/videos`,
        });

        videos.push({
          url: result.url,
          fileId: result.fileId,
        });
      }
    }

    const newPost = new Post({
      user: userId,
      title,
      content,
      images,
      videos,
    });

    await newPost.save();

    return res.status(201).json({
      success: true,
      post: newPost,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Create post failed",
    });
  }
};

export const getPostById = async (req, res) => {
  const postId = req.params.id;

  try {
    const post = await Post.findById(postId).populate("user", "name email");

    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });
    }

    return res.status(200).json({ success: true, data: post });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const updatePost = async (req, res) => {
  const userId = req.userId;
  const postId = req.params.id;

  const { title, content, existingImages, existingVideos } = req.body;

  try {
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    // 🔒 Ownership check
    if (post.user.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // =========================
    // 🔵 HANDLE IMAGES
    // =========================

    let parsedImages = [];
    const hasExistingImages = typeof existingImages !== "undefined";

    if (hasExistingImages) {
      try {
        parsedImages = JSON.parse(existingImages); // [{url, fileId}]
      } catch {
        return res.status(400).json({
          success: false,
          message: "Invalid existingImages format",
        });
      }
    }

    let updatedImages = [];

    if (hasExistingImages) {
      // keep existing
      updatedImages = [...parsedImages];

      // find removed
      const removedImages = post.images.filter(
        (img) => !parsedImages.some((e) => e.fileId === img.fileId),
      );

      // delete removed in parallel
      await Promise.all(
        removedImages.map((img) =>
          imagekit.deleteFile(img.fileId).catch(() => null),
        ),
      );
    } else {
      // ⚠️ do NOT auto delete everything
      updatedImages = [...post.images];
    }

    // upload new images
    if (req.files?.images) {
      const uploadedImages = await Promise.all(
        req.files.images.map((file) =>
          imagekit.upload({
            file: file.buffer,
            fileName: file.originalname,
            folder: `posts/${userId}/images`,
          }),
        ),
      );

      updatedImages.push(
        ...uploadedImages.map((r) => ({
          url: r.url,
          fileId: r.fileId,
        })),
      );
    }

    // =========================
    // 🔵 HANDLE VIDEOS
    // =========================

    let parsedVideos = [];
    const hasExistingVideos = typeof existingVideos !== "undefined";

    if (hasExistingVideos) {
      try {
        parsedVideos = JSON.parse(existingVideos);
      } catch {
        return res.status(400).json({
          success: false,
          message: "Invalid existingVideos format",
        });
      }
    }

    let updatedVideos = [];

    if (hasExistingVideos) {
      updatedVideos = [...parsedVideos];

      const removedVideos = post.videos.filter(
        (vid) => !parsedVideos.some((e) => e.fileId === vid.fileId),
      );

      await Promise.all(
        removedVideos.map((vid) =>
          imagekit.deleteFile(vid.fileId).catch(() => null),
        ),
      );
    } else {
      updatedVideos = [...post.videos];
    }

    if (req.files?.videos) {
      const uploadedVideos = await Promise.all(
        req.files.videos.map((file) =>
          imagekit.upload({
            file: file.buffer,
            fileName: file.originalname,
            folder: `posts/${userId}/videos`,
          }),
        ),
      );

      updatedVideos.push(
        ...uploadedVideos.map((r) => ({
          url: r.url,
          fileId: r.fileId,
        })),
      );
    }

    // =========================
    // ✏️ UPDATE TEXT FIELDS
    // =========================

    if (title !== undefined) post.title = title;
    if (content !== undefined) post.content = content;

    post.images = updatedImages;
    post.videos = updatedVideos;

    await post.save();

    return res.status(200).json({
      success: true,
      post,
    });
  } catch (error) {
    console.error("Update error:", error);

    return res.status(500).json({
      success: false,
      message: "Update failed",
      error: error.message,
    });
  }
};

export const deletePost = async (req, res) => {
  const userId = req.userId;
  const postId = req.params.id;

  try {
    // 1. Find post first
    const post = await Post.findOne({ _id: postId, user: userId });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found or unauthorized",
      });
    }

    // 2. Collect all fileIds
    const imageFileIds = (post.images || []).map((img) => img.fileId);
    const videoFileIds = (post.videos || []).map((vid) => vid.fileId);

    const allFileIds = [...imageFileIds, ...videoFileIds];

    // 3. Delete all files in parallel
    if (allFileIds.length > 0) {
      await Promise.all(
        allFileIds.map(
          (fileId) => imagekit.deleteFile(fileId).catch(() => null), // don't crash if one fails
        ),
      );
    }

    // 4. Delete post from DB
    await Post.deleteOne({ _id: postId });

    return res.status(200).json({
      success: true,
      message: "Post and media deleted successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Delete failed",
      error: error.message,
    });
  }
};
