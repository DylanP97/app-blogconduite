const mongoose = require("mongoose");

const commentSchema = mongoose.Schema(
  {
    commenterId: { type: String, required: true },
    commenterFirstName: { type: String, required: true },
    text: { type: String, required: true },
    imageUrl: { type: String },
    video: { type: String },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("comment", commentSchema);
