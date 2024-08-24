const Bglocation = require("../models/bglocationModel");

// Function to create a location record
const createBglocation = async (req, res) => {
  try {
    const data = req.body; // Assuming data comes from the request body
    const newLocation = new Bglocation(data);
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
  createBglocation,
};
