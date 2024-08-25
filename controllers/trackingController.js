const TrackingSession = require("../models/trackingSessionModel");
const User = require("../models/userModel");
const AwardLog = require("../models/awardLogModel");
const Court = require("../models/courtModel");
const Bglocation = require("../models/bglocationModel");

const { findNearbyCourt } = require("../helpers/courtHelper");
const moment = require("moment");

const startTracking = async (req, res) => {
  try {
    const { user_id, latitude, longitude } = req.body;

    if (!user_id || !latitude || !longitude) {
      return res
        .status(400)
        .json({ message: "User ID, latitude, and longitude are required" });
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

    const user = await User.findById(user_id);

    return res.status(200).json({
      message: "Tracking started successfully",
      trackingSession,
      court,
      activeusers,
      creditPoints: user.creditPoints,
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
      return res
        .status(400)
        .json({ message: "Tracking session ID is required" });
    }

    // Find the tracking session and update it to stopped
    const trackingSession = await TrackingSession.findById(trackingSessionId);

    if (!trackingSession) {
      return res.status(404).json({ message: "Tracking session not found" });
    }

    if (trackingSession.end_time) {
      return res
        .status(400)
        .json({ message: "Tracking session already ended" });
    }

    trackingSession.is_active = false;
    trackingSession.end_time = new Date(); // Record the end time
    await trackingSession.save();

    res.status(200).json({ message: "Tracking stopped successfully" });
  } catch (error) {
    console.error("Error in /stop:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Pause Tracking
const pauseTracking = async (req, res) => {
  try {
    const { trackingSessionId } = req.body;

    if (!trackingSessionId) {
      return res
        .status(400)
        .json({ message: "Tracking session ID is required" });
    }

    // Find the tracking session and update it to paused
    const trackingSession = await TrackingSession.findById(trackingSessionId);

    if (!trackingSession) {
      return res.status(404).json({ message: "Tracking session not found" });
    }

    if (trackingSession.end_time) {
      return res
        .status(400)
        .json({ message: "Tracking session already ended" });
    }

    trackingSession.is_active = false;
    trackingSession.end_time = new Date();
    trackingSession.events.push({
      type: "pause",
      timestamp: new Date(),
    });
    await trackingSession.save();

    res.status(200).json({ message: "Tracking paused successfully" });
  } catch (error) {
    console.error("Error in /pause:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Resume Tracking
const resumeTracking = async (req, res) => {
  try {
    const { trackingSessionId } = req.body;

    if (!trackingSessionId) {
      return res
        .status(400)
        .json({ message: "Tracking session ID is required" });
    }

    // Find the tracking session and update it to active
    const trackingSession = await TrackingSession.findById(trackingSessionId);

    if (!trackingSession) {
      return res.status(404).json({ message: "Tracking session not found" });
    }

    trackingSession.is_active = true;
    trackingSession.end_time = null;
    trackingSession.events.push({
      type: "resume",
      timestamp: new Date(),
    });
    await trackingSession.save();

    res.status(200).json({ message: "Tracking resumed successfully" });
  } catch (error) {
    console.error("Error in /resume:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Award Points
const awardTracking = async (req, res) => {
  try {
    const { trackingSessionId } = req.body;

    if (!trackingSessionId) {
      console.log("id no found");

      return res
        .status(400)
        .json({ message: "Tracking session ID is required" });
    }

    // Find the tracking session
    const trackingSession = await TrackingSession.findById(trackingSessionId);

    if (!trackingSession) {
      return res.status(404).json({ message: "Tracking session not found" });
    }

    if (trackingSession.end_time) {
      console.log("id ended");
      return res
        .status(400)
        .json({ message: "Tracking session already ended" });
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
    const pointsAwarded =
      Math.floor(timeSpentInMinutes / 2) * pointsPerTwoMinutes;

    // Find the user and update their points
    const user = await User.findById(trackingSession.user_id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
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

    res
      .status(200)
      .json({ message: "Points awarded successfully", pointsAwarded });
  } catch (error) {
    console.error("Error in /award:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const saveTrackingAppState = async (req, res) => {
  try {
    const { user_id, trackingSessionId, appState } = req.body;

    if (!user_id || !appState) {
      return res.status(400).json({
        message: "User ID, tracking session ID, and app state are required",
      });
    }

    // Find the tracking session either by ID or by active session for the user
    let trackingSession;

    if (trackingSessionId) {
      trackingSession = await TrackingSession.findById(trackingSessionId);
    } else {
      trackingSession = await TrackingSession.findOne({
        user_id,
        is_active: true,
      });
    }

    if (!trackingSession) {
      return res.status(404).json({ message: "Tracking session not found" });
    }

    trackingSession.app_state = appState;
    await trackingSession.save();

    res
      .status(200)
      .json({ message: "App state saved successfully", trackingSession });
  } catch (error) {
    console.error("Error in saveAppState:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getTrackingAppState = async (req, res) => {
  try {
    const { user_id, trackingSessionId } = req.query;

    if (!user_id) {
      return res.status(400).json({ message: "User ID is required" });
    }

    let trackingSession;

    if (trackingSessionId) {
      trackingSession = await TrackingSession.findById(trackingSessionId);
    } else {
      trackingSession = await TrackingSession.findOne({
        user_id,
        is_active: true,
      });
    }

    if (!trackingSession || !trackingSession.app_state) {
      return res.status(404).json({ message: "App state not found" });
    }

    res.status(200).json({
      message: "App state retrieved successfully",
      appState: trackingSession.app_state,
    });
  } catch (error) {
    console.error("Error in getAppState:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Function to perform the long-running task
const performLongRunningTask = async (
  user_id,
  location,
  court,
  trackingSessionId
) => {
  const { latitude, longitude } = location.coords; // Ensure location.coords structure is correct
  const courtLatitude = court.location.coordinates[1];
  const courtLongitude = court.location.coordinates[0];

  const COURT_RADIUS = 200; // Court radius in meters

  const distance = getDistanceFromCourt(
    latitude,
    longitude,
    courtLatitude,
    courtLongitude
  );

  console.log('Distance', distance);

  if (distance > COURT_RADIUS) {
    console.log("User is out of court");
    performOutAction(trackingSessionId);
  } else {
    console.log("User is inside court");
    performInAction(trackingSessionId);
  }
};

const performOutAction = async (trackingSessionId) => {
  try {
    const trackingSession = await TrackingSession.findById(trackingSessionId);

    if (!trackingSession.end_time || trackingSession.end_time == null) {
      trackingSession.is_active = false;
      trackingSession.end_time = new Date();
      trackingSession.events.push({
        type: "pause",
        timestamp: new Date(),
      });
      await trackingSession.save();

      console.log('Out time set');
    }

    // Check if the user has been out of court for more than 10 minutes
    if (Date.now() - trackingSession.end_time.getTime() > 3 * 60 * 1000) {
      console.log('Out for sure');
    }
  } catch (error) {
    console.error("Error performing out-action:", error.message);
    throw new Error("Error performing out-action");
  }
};



const performInAction = async (trackingSessionId) => {
  try {
    const trackingSession = await TrackingSession.findById(trackingSessionId);

    if (!trackingSession) {
      throw new Error("Tracking session not found");
    }

    if (trackingSession.end_time) {
      // Resume tracking session
      trackingSession.is_active = true;
      trackingSession.end_time = null;
      trackingSession.events.push({
        type: "resume",
        timestamp: new Date(),
      });
      await trackingSession.save(); // Save after resuming
    }

    if (trackingSession.is_active) {
      const currentTime = Date.now();

      // Initialize last_award_time if it is not set
      if (!trackingSession.last_award_time) {
        trackingSession.last_award_time = currentTime;
        await trackingSession.save(); // Save initialization
      }

      const timeSinceLastAward = (currentTime - trackingSession.last_award_time) / 1000; // time in seconds

      // Award points if 120 seconds (or 2 minutes) have passed since the last award
      if (timeSinceLastAward >= 120) {
        trackingSession.points += 1; // Increment points
        trackingSession.last_award_time = currentTime; // Update last award time

        // Find the user and update their points
        const user = await User.findById(trackingSession.user_id);

        if (!user) {
          throw new Error("User not found");
        }

        user.creditPoints = (user.creditPoints || 0) + 1;
        await user.save();

        // Log the award event
        const awardLog = new AwardLog({
          user_id: user._id,
          trackingSession_id: trackingSession._id,
          points_awarded: 1,
        });

        await awardLog.save();

        console.log('Awarded Point');

        // Save the updated tracking session data
        await trackingSession.save(); // Ensure session is saved with updated award time
      } else {
        console.log('Not enough time has passed since last award');
      }
    }
  } catch (error) {
    console.error("Error performing in-action:", error.message);
    throw new Error("Error performing in-action");
  }
};


// Function to handle task with court lookup
const performTask = async (req, res) => {
  try {
    const { user_id, location, trackingSessionId } = req.body;

    const newLocation = new Bglocation({
      user_id,
      location,
    });
    await newLocation.save();

    // Find the tracking session and associated court ID
    const trackingSession = await TrackingSession.findById(trackingSessionId);

//    console.log("Tracking Session:", trackingSession);

    if (!trackingSession) {
      console.log("Tracking session not found for ID:", trackingSessionId);
      return res
        .status(404)
        .send({ success: false, message: "Tracking session not found" });
    }

    const court = await Court.findById(trackingSession.court_id);

    if (!court) {
      console.log("Court not found for ID:", trackingSession.court_id);
      return res
        .status(404)
        .send({ success: false, message: "Court not found" });
    }

    // Perform the long-running task with court details
    await performLongRunningTask(user_id, location, court, trackingSessionId);

    const user = await User.findById(trackingSession.user_id);

    // Retrieve active users in the same court
    const activeusers = await getActiveUsersInCourts(court._id);

    // Fetch the updated tracking session after the long-running task
    const updatedTrackingSession = await TrackingSession.findById(trackingSessionId);

    // Return the updated tracking session data
    res.status(200).send({
      success: true,
      message: "Location processed successfully",
      trackingSession: updatedTrackingSession, // Return the updated tracking session
      activeusers,
      creditPoints: user.creditPoints,
    });
    

  } catch (error) {
    console.error("Error processing location:", error);
    res.status(500).send({ success: false, message: "Server error" });
  }
};

const getDistanceFromCourt = (
  latitude,
  longitude,
  courtLatitude,
  courtLongitude
) => {
  const R = 6371e3; // Radius of the Earth in meters
  const φ1 = (latitude * Math.PI) / 180;
  const φ2 = (courtLatitude * Math.PI) / 180;
  const Δφ = ((courtLatitude - latitude) * Math.PI) / 180;
  const Δλ = ((courtLongitude - longitude) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // In meters
};

async function getActiveUsersInCourts(court_id) {
  try {
    // Get the current date and time
    const sixHoursAgo = moment().subtract(6, "hours").toDate();

    // Find all active tracking sessions for the given court within the last 6 hours
    const activeSessions = await TrackingSession.find({
      court_id,
      is_active: true,
      $or: [
        { end_time: { $exists: false } }, // end_time does not exist
        { end_time: { $eq: null } }, // end_time is explicitly null
      ],
      start_time: { $gte: sixHoursAgo }, // Session started within the last 6 hours
    }).populate("user_id");

    // Extract user IDs and remove duplicates
    const uniqueUserIds = [
      ...new Set(activeSessions.map((session) => session.user_id._id)),
    ];

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
  getTrackingAppState,
  performTask,
};
