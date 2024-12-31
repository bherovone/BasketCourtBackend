// models/deviceLocationModel.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const DeviceLocationSchema = new Schema(
  {
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  timestamp: { type: Number, required: true },
  deviceId: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('DeviceLocation', DeviceLocationSchema);
