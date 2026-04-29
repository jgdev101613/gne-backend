import { Message } from "../models/Message.js";
import imagekit from "../lib/imagekit.config.js";

export const getMessages = async (req, res) => {
  try {
    const messages = await Message.find().populate("user", "name email");

    return res.status(200).json({
      success: true,
      messages,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const createMessage = async (req, res) => {
  const userId = req.userId;
  const { month, content, title, year } = req.body;

  if (!month || !content || !title || !year) {
    return res.status(400).json({
      success: false,
      message: "Month, content, title, and year are required",
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
          folder: `messages/${userId}/images`,
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
          folder: `messages/${userId}/videos`,
        });

        videos.push({
          url: result.url,
          fileId: result.fileId,
        });
      }
    }

    const newMessage = new Message({
      user: userId,
      month,
      content,
      title,
      year,
      images,
      videos,
    });

    await newMessage.save();

    return res.status(201).json({
      success: true,
      message: "Message created successfully",
      data: newMessage,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Create message failed",
      error: error.message,
    });
  }
};

export const getMessageById = async (req, res) => {
  const messageId = req.params.id;

  try {
    const message = await Message.findById(messageId).populate(
      "user",
      "name email",
    );

    if (!message) {
      return res
        .status(404)
        .json({ success: false, message: "Message not found" });
    }

    return res.status(200).json({ success: true, data: message });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const updateMessage = async (req, res) => {
  const userId = req.userId;
  const messageId = req.params.id;

  const { content, title, existingImages, existingVideos } = req.body;

  try {
    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    // 🔒 Ownership check
    if (message.user.toString() !== userId) {
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
      const removedImages = message.images.filter(
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
      updatedImages = [...message.images];
    }

    // upload new images
    if (req.files?.images) {
      const uploadedImages = await Promise.all(
        req.files.images.map((file) =>
          imagekit.upload({
            file: file.buffer,
            fileName: file.originalname,
            folder: `messages/${userId}/images`,
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

      const removedVideos = message.videos.filter(
        (vid) => !parsedVideos.some((e) => e.fileId === vid.fileId),
      );

      await Promise.all(
        removedVideos.map((vid) =>
          imagekit.deleteFile(vid.fileId).catch(() => null),
        ),
      );
    } else {
      updatedVideos = [...message.videos];
    }

    if (req.files?.videos) {
      const uploadedVideos = await Promise.all(
        req.files.videos.map((file) =>
          imagekit.upload({
            file: file.buffer,
            fileName: file.originalname,
            folder: `messages/${userId}/videos`,
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

    if (title !== undefined) message.title = title;
    if (content !== undefined) message.content = content;

    message.images = updatedImages;
    message.videos = updatedVideos;

    await message.save();

    return res.status(200).json({
      success: true,
      message: "Message updated successfully",
      data: message,
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
  const messageId = req.params.id;

  try {
    // 1. Find message first
    const message = await Message.findOne({ _id: messageId, user: userId });

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found or unauthorized",
      });
    }

    // 2. Collect all fileIds
    const imageFileIds = (message.images || []).map((img) => img.fileId);
    const videoFileIds = (message.videos || []).map((vid) => vid.fileId);

    const allFileIds = [...imageFileIds, ...videoFileIds];

    // 3. Delete all files in parallel
    if (allFileIds.length > 0) {
      await Promise.all(
        allFileIds.map(
          (fileId) => imagekit.deleteFile(fileId).catch(() => null), // don't crash if one fails
        ),
      );
    }

    // 4. Delete message from DB
    await Message.deleteOne({ _id: messageId });

    return res.status(200).json({
      success: true,
      message: "Message and media deleted successfully",
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
