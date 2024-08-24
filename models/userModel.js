const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Please add a fullname"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Please add an email"],
      unique: true,
      trim: true,
    },
    mobile: {
      type: Number,
      default: null,
    },
    password: {
      type: String,
      required: [true, "Please add a password"],
      minlength: 6,
      maxlength: 64,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    profilePicture: { type: String },
    creditPoints: {
      type: Number,
      default: 0,
    },
    otpCode: {
      type: String,
    },
    dateOfBirth: { type: Date },
    status: { type: String, enum: ['active', 'pending'], default: 'pending' },
    settings: {
      theme: { type: String, default: "light" },
      language: { type: String, default: "en" },
      notifications: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
