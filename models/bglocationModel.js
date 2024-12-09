const mongoose = require("mongoose");
const { Schema } = mongoose;

const bglocationSchema = new Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId, // Assuming you're storing user IDs as ObjectId
      ref: "User", // Reference to the User model
      required: true,
    },
    trackingSession_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TrackingSession",
      required: true,
    },
    event_type: {
      type: Schema.Types.Mixed, // To accommodate various types of event data
      required: true,
    },
    created_at: {
      type: Date,
      default: Date.now,
    },
    location: {
      coords: {
        latitude: {
          type: Number,
          required: true,
        },
        longitude: {
          type: Number,
          required: true,
        },
        accuracy: {
          type: Number,
        },
        speed: {
          type: Number,
        },
        heading: {
          type: Number,
        },
        altitude: {
          type: Number,
        },
        ellipsoidal_altitude: {
          type: Number,
        },
      },
      extras: {
        type: Map,
        of: String, // Assuming the extras are key-value pairs with string values
      },
      activity: {
        type: {
          type: String,
          enum: [
            "still",
            "on_foot",
            "walking",
            "running",
            "in_vehicle",
            "on_bicycle",
            "unknown",
          ],
        },
        confidence: {
          type: Number,
          min: 0,
          max: 100,
        },
      },
      geofence: {
        identifier: {
          type: String,
        },
        action: {
          type: String,
          enum: ["ENTER", "EXIT"],
        },
      },
      battery: {
        level: {
          type: Number,
        },
        is_charging: {
          type: Boolean,
        },
      },
      timestamp: {
        type: Date,
        required: true,
      },
      age: {
        type: Number,
      },
      uuid: {
        type: String,
      },
      event: {
        type: String,
      },
      is_moving: {
        type: Boolean,
      },
      odometer: {
        type: Number,
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Bglocation", bglocationSchema);
