import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    images: [
      {
        url: String,
        fileId: String,
      },
    ],
    videos: [
      {
        url: String,
        fileId: String,
      },
    ],
  },
  { timestamps: true },
);

export const Post = mongoose.model("Post", postSchema);
