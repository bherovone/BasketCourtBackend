const Event = require('../models/eventModel');

const createEvent = async (req, res) => {
  try {
    const { user_id, type, event, trackingSession_id } = req.body;
    const newEvent = new Event({
      user_id, // Add user_id here
      type,
      event,
      trackingSession_id,
      timestamp: new Date(),
    });
    await newEvent.save();
    //console.log("Event record saved:", newEvent);
    res.status(201).json({
      success: true,
      message: 'Event recorded successfully',
      event: newEvent,
    });
  } catch (error) {
    console.error('Error saving event record:', error);
    res.status(500).json({ success: false, message: 'Error saving event record' });
  }
};

const getAllEvents = async (req, res) => {
  try {
    
    const events = await Event.find(); // Populate user data if needed
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching events', error });
  }
};

module.exports = {
  createEvent,
  getAllEvents,
};
