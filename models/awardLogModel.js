const mongoose = require('mongoose');

const awardLogSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  trackingSession_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TrackingSession',
    required: true,
  },
  points_awarded: {
    type: Number,
    required: true,
  },
  awarded_at: {
    type: Date,
    default: Date.now,
  },
});

const AwardLog = mongoose.model('AwardLog', awardLogSchema);

module.exports = AwardLog;
