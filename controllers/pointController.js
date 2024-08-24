// controllers/pointController.js
const Point = require('../models/pointModel'); // Adjust path as necessary

// Create a new points entry
const createPoint = async (req, res) => {
  try {
    const { userId, courtId, entryId } = req.body;    

    // Create and save the new point
    const newPoint = new Point({ userId, courtId, entryId });
    const savedPoint = await newPoint.save();

    return res.status(201).json({ success: true, message: 'Points recorded successfully', point: savedPoint });
  } catch (error) {
    console.error('Error recording points:', error);
    return res.status(500).json({ success: false, message: 'Error recording points' });
  }
};

module.exports = {
  
  createPoint,
};