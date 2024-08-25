const mongoose = require('mongoose');
const { Schema } = mongoose;

const trackingSessionSchema = new Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  court_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Court',
    required: true,
  },
  start_time: {
    type: Date,
    default: Date.now,
  },
  last_award_time: {
    type: Date,
  },
  end_time: {
    type: Date,
  },
  points: {
    type: Number,
    default: 0,
  },
  events: [
    {
      type: {
        type: String,
        enum: ['pause', 'resume'],
        required: true,
      },
      timestamp: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  app_state: { type: mongoose.Schema.Types.Mixed },
  is_active: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true });


module.exports = mongoose.model('TrackingSession', trackingSessionSchema);
