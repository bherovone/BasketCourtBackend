const TrackingSession = require('../models/trackingSessionModel.js');
const User = require('../models/userModel');
const AwardLog = require('../models/awardLogModel');
const { findNearbyCourt } = require('../helpers/courtHelper');
const moment = require('moment');

const startTracking = async (req, res) => {
  try {
    const { user_id, latitude, longitude } = req.body;

    if (!user_id || !latitude || !longitude) {
      return res.status(400).json({ message: "User ID, latitude, and longitude are required" });
    }

    // Check if the court exists
    const court = await findNearbyCourt(latitude, longitude);

    if (!court) {
      return res.status(404).json({ message: "Court not found" });
    }

    // Retrieve active users in the same court
    const activeusers = await getActiveUsersInCourts(court._id);

    // If a court is found, create a new tracking session
    const trackingSession = new TrackingSession({
      user_id,
      court_id: court._id,
    });

    await trackingSession.save();

    return res.status(200).json({ 
      message: "Tracking started successfully", 
      trackingSession, 
      court, 
      activeusers 
    });
  } catch (error) {
    console.error("Error in startTracking:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};


// Stop Tracking
const stopTracking = async (req, res) => {
  try {
    const { trackingSessionId } = req.body;

    if (!trackingSessionId) {
      return res.status(400).json({ message: 'Tracking session ID is required' });
    }

    // Find the tracking session and update it to stopped
    const trackingSession = await TrackingSession.findById(trackingSessionId);

    if (!trackingSession) {
      return res.status(404).json({ message: 'Tracking session not found' });
    }

    if (trackingSession.end_time) {
      return res.status(400).json({ message: 'Tracking session already ended' });
    }

    trackingSession.is_active = false;
    trackingSession.end_time = new Date(); // Record the end time
    await trackingSession.save();

    res.status(200).json({ message: 'Tracking stopped successfully' });
  } catch (error) {
    console.error('Error in /stop:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Pause Tracking
const pauseTracking = async (req, res) => {
  try {
    const { trackingSessionId } = req.body;

    if (!trackingSessionId) {
      return res.status(400).json({ message: 'Tracking session ID is required' });
    }

    // Find the tracking session and update it to paused
    const trackingSession = await TrackingSession.findById(trackingSessionId);

    if (!trackingSession) {
      return res.status(404).json({ message: 'Tracking session not found' });
    }

    if (trackingSession.end_time) {
      return res.status(400).json({ message: 'Tracking session already ended' });
    }

    trackingSession.is_active = false;
    trackingSession.end_time = new Date();
    trackingSession.events.push({
      type: 'pause',
      timestamp: new Date(),
    });
    await trackingSession.save();

    res.status(200).json({ message: 'Tracking paused successfully' });
  } catch (error) {
    console.error('Error in /pause:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Resume Tracking
const resumeTracking = async (req, res) => {
  try {
    const { trackingSessionId } = req.body;

    if (!trackingSessionId) {
      return res.status(400).json({ message: 'Tracking session ID is required' });
    }

    // Find the tracking session and update it to active
    const trackingSession = await TrackingSession.findById(trackingSessionId);

    if (!trackingSession) {
      return res.status(404).json({ message: 'Tracking session not found' });
    }

    trackingSession.is_active = true;
    trackingSession.end_time = null;
    trackingSession.events.push({
      type: 'resume',
      timestamp: new Date(),
    });
    await trackingSession.save();

    res.status(200).json({ message: 'Tracking resumed successfully' });
  } catch (error) {
    console.error('Error in /resume:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Award Points
const awardTracking = async (req, res) => {
  try {
    const { trackingSessionId } = req.body;

    if (!trackingSessionId) {
      console.log("id no found");

      return res.status(400).json({ message: 'Tracking session ID is required' });
    }

    // Find the tracking session
    const trackingSession = await TrackingSession.findById(trackingSessionId);

    if (!trackingSession) {
      return res.status(404).json({ message: 'Tracking session not found' });
    }

    if (trackingSession.end_time) {
      console.log("id ended");
      return res.status(400).json({ message: 'Tracking session already ended' });
    }

    // Calculate the time spent
    const startTime = trackingSession.start_time;
    const endTime = new Date();
    const timeSpentInMilliseconds = endTime - startTime;
    // const timeSpentInHours = timeSpentInMilliseconds / (1000 * 60 * 60);
    

    // // Define points per hour
    // const pointsPerHour = 10; // Example: 10 points per hour
    // const pointsAwarded = Math.floor(timeSpentInHours) * pointsPerHour;

    const timeSpentInMinutes = timeSpentInMilliseconds / (1000 * 60);

    // Define points per 2 minutes
    const pointsPerTwoMinutes = 10; // Example: 10 points per 2 minutes
    const pointsAwarded = Math.floor(timeSpentInMinutes / 2) * pointsPerTwoMinutes;

    // Find the user and update their points
    const user = await User.findById(trackingSession.user_id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.creditPoints = (user.creditPoints || 0) + pointsAwarded;
    await user.save();

    // Log the award event
    const awardLog = new AwardLog({
      user_id: user._id,
      trackingSession_id: trackingSession._id,
      points_awarded: pointsAwarded,
    });

    await awardLog.save();

    res.status(200).json({ message: 'Points awarded successfully', pointsAwarded });
  } catch (error) {
    console.error('Error in /award:', error);
    res.status(500).json({ message: 'Internal server error' });
  }

};

const saveTrackingAppState = async (req, res) => {
  
  try {
    const { user_id, trackingSessionId, appState } = req.body;

  

    if (!user_id || !appState) {
      return res.status(400).json({ message: 'User ID, tracking session ID, and app state are required' });
    }

    // Find the tracking session either by ID or by active session for the user
    let trackingSession;

    if (trackingSessionId) {
      trackingSession = await TrackingSession.findById(trackingSessionId);
    } else {
      trackingSession = await TrackingSession.findOne({ user_id, is_active: true });
    }

    if (!trackingSession) {
      return res.status(404).json({ message: 'Tracking session not found' });
    }

    trackingSession.app_state = appState;
    await trackingSession.save();

    res.status(200).json({ message: 'App state saved successfully', trackingSession });
  } catch (error) {
    console.error('Error in saveAppState:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getTrackingAppState = async (req, res) => {
  
  try {

    const { user_id , trackingSessionId} = req.query;

    if (!user_id) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    let trackingSession;

    if (trackingSessionId) {
    
      trackingSession = await TrackingSession.findById(trackingSessionId);
    
    } else {

      trackingSession = await TrackingSession.findOne({ user_id, is_active: true });
    
    }

    if (!trackingSession || !trackingSession.app_state) {
      return res.status(404).json({ message: 'App state not found' });
    }

    res.status(200).json({ message: 'App state retrieved successfully', appState: trackingSession.app_state });
  
  } catch (error) {
    
    console.error('Error in getAppState:', error);
    res.status(500).json({ message: 'Internal server error' });
  
  }

};



async function getActiveUsersInCourts(court_id) {
  try {
    // Get the current date and time
    const sixHoursAgo = moment().subtract(6, 'hours').toDate();

    // Find all active tracking sessions for the given court within the last 6 hours
    const activeSessions = await TrackingSession.find({
      court_id,
      is_active: true,
      $or: [
        { end_time: { $exists: false } }, // end_time does not exist
        { end_time: { $eq: null } }       // end_time is explicitly null
      ],
      start_time: { $gte: sixHoursAgo }  // Session started within the last 6 hours
    }).populate('user_id');    

    // Extract user IDs and remove duplicates
    const uniqueUserIds = [...new Set(activeSessions.map(session => session.user_id._id))];

    // Fetch user details
    const users = await User.find({ _id: { $in: uniqueUserIds } });

    return users;
  } catch (error) {
    console.error("Error in getActiveUsersInCourts:", error);
    throw new Error("Unable to fetch active users.");
  }
}

module.exports = {
  startTracking,
  pauseTracking,
  stopTracking,
  resumeTracking,
  awardTracking,
  saveTrackingAppState,
  getTrackingAppState
};
