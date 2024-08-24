// utils/courtHelper.js

const Court = require("../models/courtModel"); // Import the Court model

const findNearbyCourt = async (latitude, longitude, distanceInMeters = 200) => {
  const lat = parseFloat(latitude);
  const lon = parseFloat(longitude);

  if (isNaN(lat) || isNaN(lon)) {
    throw new Error("Invalid latitude or longitude");
  }

  console.log(`Checking for court near Latitude: ${lat}, Longitude: ${lon}`);

  const court = await Court.findOne({
    "location.coordinates": {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: [lon, lat] // [longitude, latitude]
        },
        $maxDistance: distanceInMeters
      }
    }
  });

  return court;
};

module.exports = { findNearbyCourt };
