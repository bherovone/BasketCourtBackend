const Court = require("../models/courtModel");
const { findNearbyCourt } = require('../helpers/courtHelper');

const addCourt = async (req, res) => {
  try {
    const { name, address, latitude, longitude } = req.body;

    // Validate the coordinates
    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      return res.status(400).json({ message: "Latitude and longitude must be numbers" });
    }

    // Create the new court document
    const newCourt = new Court({
      name,
      location: {
        address,
        coordinates: [longitude, latitude] // [longitude, latitude]
      }
    });

    const savedCourt = await newCourt.save();
    return res.status(201).send(savedCourt);
  } catch (error) {
    console.error("Unable to add court:", error);
    return res.status(500).send("Unable to add court");
  }
};

const getAllCourts = async (req, res) => {
  try {
    const courts = await Court.find();
    return res.status(200).send(courts);
  } catch (error) {
    console.error("Unable to get courts:", error);
    return res.status(500).send("Unable to get courts");
  }
};

const getCourtById = async (req, res) => {
  try {
    const court = await Court.findById(req.params.id);
    if (!court) {
      return res.status(404).send("Court not found");
    }
    return res.status(200).send(court);
  } catch (error) {
    console.error("Unable to get court:", error);
    return res.status(500).send("Unable to get court");
  }
};

const updateCourt = async (req, res) => {
  try {
    const { name, address, latitude, longitude } = req.body;

    // Prepare update object
    const updateData = {
      name,
      location: {
        address,
        coordinates: [longitude, latitude] // [longitude, latitude]
      }
    };

    const updatedCourt = await Court.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!updatedCourt) {
      return res.status(404).send("Court not found");
    }

    return res.status(200).send(updatedCourt);
  } catch (error) {
    console.error("Unable to update court:", error);
    return res.status(500).send("Unable to update court");
  }
};

const deleteCourt = async (req, res) => {
  try {
    const deletedCourt = await Court.findByIdAndDelete(req.params.id);
    if (!deletedCourt) {
      return res.status(404).send("Court not found");
    }
    return res.status(200).send("Court deleted successfully");
  } catch (error) {
    console.error("Unable to delete court:", error);
    return res.status(500).send("Unable to delete court");
  }
};

// const checkCourtExist = async (req, res) => {
//   const { latitude, longitude } = req.query;

//   if (!latitude || !longitude) {
//     return res.status(400).json({ message: "Latitude and longitude are required" });
//   }

//   try {
//     // Convert latitude and longitude to numbers
//     const lat = parseFloat(latitude);
//     const lon = parseFloat(longitude);

//     // Find the court within a certain distance (e.g., 200 meters)
//     const distanceInMeters = 200; // Adjust the distance as needed
//     const court = await Court.findOne({
//       location: {
//         coordinates: {
//           $near: {
//             $geometry: {
//               type: "Point",
//               coordinates: [lon, lat] // [longitude, latitude]
//             },
//             $maxDistance: distanceInMeters
//           }
//         }
//       }
//     });

//     if (court) {
//       return res.status(200).json(court);
//     } else {
//       return res.status(404).json({ message: "Court not found" });
//     }
//   } catch (error) {
//     console.error("Error checking court existence:", error);
//     return res.status(500).json({ message: "Internal server error" });
//   }
// };

const checkCourtExist = async (req, res) => {
  try {

    const { latitude, longitude } = req.query;
    
     // Use the helper function to find the nearby court
    const court = await findNearbyCourt(latitude, longitude);

    if (court) {
      console.log('Court found:', court);
      return res.status(200).json(court);
    } else {
      console.log('Court not found');
      return res.status(404).json({ message: "Court not found" });
    }
  } catch (error) {
    console.error("Error checking court existence:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};


module.exports = {
  addCourt,
  getAllCourts,
  getCourtById,
  updateCourt,
  deleteCourt,
  checkCourtExist,
};
