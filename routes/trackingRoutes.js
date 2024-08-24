const express = require("express");
const { auth, checkAdmin } = require("../middleware/auth");
const trackingController = require("../controllers/trackingController");
const trackingRouter = express.Router();

trackingRouter.post("/start", auth, trackingController.startTracking);
trackingRouter.post("/pause", auth, trackingController.pauseTracking);
trackingRouter.post("/resume", auth, trackingController.resumeTracking);
trackingRouter.post("/stop", auth, trackingController.stopTracking);
trackingRouter.post("/award", auth, trackingController.awardTracking);
trackingRouter.post("/saveAppState", auth, trackingController.saveTrackingAppState);
trackingRouter.get("/getAppState", auth, trackingController.getTrackingAppState);


module.exports = trackingRouter;
