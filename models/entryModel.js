const mongoose = require("mongoose");
const { Schema } = mongoose;

const entrySchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    courtId: { type: Schema.Types.ObjectId, ref: 'Court', required: true },
    entryTime: { type: Date, required: true },
    exitTime: { type: Date },
  },
  { timestamps: true }
);

// Virtual field for duration
entrySchema.virtual('duration').get(function () {
  if (this.exitTime) {
    return Math.round((this.exitTime - this.entryTime) / 1000); // Duration in seconds
  }
  return null;
});

module.exports = mongoose.model("Entry", entrySchema);
