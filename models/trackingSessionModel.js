const mongoose = require('mongoose');

const trackingSessionSchema = new mongoose.Schema({
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
  end_time: {
    type: Date,
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

const TrackingSession = mongoose.model('TrackingSession', trackingSessionSchema);

module.exports = TrackingSession;
