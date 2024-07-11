const mongoose = require("mongoose");
const { Schema } = mongoose;

const courtSchema = new Schema(
  {
    name: { type: String, required: true },
    location: {
      address: { type: String, required: true },
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true }
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Court", courtSchema);
