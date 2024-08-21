const mongoose = require('mongoose');
const { Schema } = mongoose;

const eventSchema = new Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId, // Assuming you're storing user IDs as ObjectId
      ref: 'User', // Reference to the User model
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    event: {
      type: Schema.Types.Mixed, // To accommodate various types of event data
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Event', eventSchema);
