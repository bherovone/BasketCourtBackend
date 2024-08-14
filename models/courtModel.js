const mongoose = require("mongoose");
const { Schema } = mongoose;

const courtSchema = new Schema(
  {
    name: { type: String, required: true },
    location: {
      address: { type: String, required: true },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      }
    }
  },
  { timestamps: true }
);

// Create a 2dsphere index on the coordinates field
courtSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Court", courtSchema);
