// controllers/pointController.js
const DeviceLocation = require('../models/deviceLocationModel'); // Adjust path as necessary

// Create a new points entry
const createDevice = async (req, res) => {
  
  const { latitude, longitude, timestamp, deviceId } = req.body;

  try {
    const newLocation = new DeviceLocation({ latitude, longitude, timestamp, deviceId });
    await newLocation.save();
    res.status(201).send({ message: 'Location saved successfully' });
  } catch (error) {
    res.status(500).send({ message: 'Error saving location', error });
  }

};

module.exports = {
  
  createDevice,
};