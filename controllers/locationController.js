const Location = require("../models/locationModel");

// Function to create a location record
const createlocation = async (req, res) => {
  try {
    const data = req.body; // Assuming data comes from the request body
    const newLocation = new Location(data);
    await newLocation.save();
    //console.log("Location record saved:", newLocation);
    return res
      .status(201)
      .json({
        success: true,
        message: "Location recorded successfully",
        location: newLocation,
      });
  } catch (error) {
    console.error("Error saving location record:", error);
    return res
      .status(500)
      .json({ success: false, message: "Error saving location record" });
  }
};

module.exports = {
  createlocation,
};
