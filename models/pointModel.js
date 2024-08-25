// models/pointModel.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const pointSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    courtId: { type: Schema.Types.ObjectId, ref: 'Court', required: true },
    entryId: { type: Schema.Types.ObjectId, ref: 'Entry', required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Point', pointSchema);
