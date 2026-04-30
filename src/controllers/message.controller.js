import { Message } from "../models/Message.js";
import imagekit from "../lib/imagekit.config.js";

export const getMessages = async (req, res) => {
  try {
    const messages = await Message.find().populate("user", "name email");

    return res.status(200).json({
      success: true,
      data: messages,
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
    let audio = null;

    // --- IMAGES ---
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

      uploadedImages.forEach((img) => {
        images.push({
          url: img.url,
          fileId: img.fileId,
        });
      });
    }

    // --- VIDEOS ---
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

      uploadedVideos.forEach((vid) => {
        videos.push({
          url: vid.url,
          fileId: vid.fileId,
        });
      });
    }

    // --- AUDIO (single file) ---
    if (req.files?.audio?.[0]) {
      const file = req.files.audio[0];

      const result = await imagekit.upload({
        file: file.buffer,
        fileName: file.originalname,
        folder: `messages/${userId}/audio`,
      });

      audio = {
        url: result.url,
        fileId: result.fileId,
      };
    }

    // --- SAVE MESSAGE ---
    const newMessage = new Message({
      user: userId,
      month,
      content,
      title,
      year,
      images,
      videos,
      audio,
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

export const getMessagesByMonth = async (req, res) => {
  const { year, month } = req.params;

  try {
    const messages = await Message.find({
      year,
      month,
    })
      .populate("user", "name email")
      .sort({ createdAt: -1 }); // latest first (important)

    return res.status(200).json({
      success: true,
      data: messages,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch messages by month",
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
    // IMAGES
    // =========================

    let updatedImages = message.images;

    if (existingImages !== undefined) {
      let parsedImages = JSON.parse(existingImages);

      const removedImages = message.images.filter(
        (img) => !parsedImages.some((e) => e.fileId === img.fileId),
      );

      await Promise.all(
        removedImages.map((img) =>
          imagekit.deleteFile(img.fileId).catch(() => null),
        ),
      );

      updatedImages = parsedImages;
    }

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
    // VIDEOS
    // =========================

    let updatedVideos = message.videos;

    if (existingVideos !== undefined) {
      let parsedVideos = JSON.parse(existingVideos);

      const removedVideos = message.videos.filter(
        (vid) => !parsedVideos.some((e) => e.fileId === vid.fileId),
      );

      await Promise.all(
        removedVideos.map((vid) =>
          imagekit.deleteFile(vid.fileId).catch(() => null),
        ),
      );

      updatedVideos = parsedVideos;
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
    // 🔵 AUDIO (MISSING FIX)
    // =========================

    if (req.files?.audio?.[0]) {
      // delete old audio if exists
      if (message.audio?.fileId) {
        await imagekit.deleteFile(message.audio.fileId).catch(() => null);
      }

      const file = req.files.audio[0];

      const result = await imagekit.upload({
        file: file.buffer,
        fileName: file.originalname,
        folder: `messages/${userId}/audio`,
      });

      message.audio = {
        url: result.url,
        fileId: result.fileId,
      };
    }

    // =========================
    // TEXT FIELDS
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
    return res.status(500).json({
      success: false,
      message: "Update failed",
      error: error.message,
    });
  }
};

export const deleteMessage = async (req, res) => {
  const userId = req.userId;
  const messageId = req.params.id;

  try {
    const message = await Message.findOne({
      _id: messageId,
    });

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found or unauthorized",
      });
    }

    // Collect all fileIds
    const fileIds = [
      ...(message.images || []).map((i) => i.fileId),
      ...(message.videos || []).map((v) => v.fileId),
      ...(message.audio?.fileId ? [message.audio.fileId] : []),
    ];

    // Delete from ImageKit
    if (fileIds.length > 0) {
      await Promise.all(
        fileIds.map((id) => imagekit.deleteFile(id).catch(() => null)),
      );
    }

    // Delete message from DB
    await message.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Message deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Delete failed",
      error: error.message,
    });
  }
};
