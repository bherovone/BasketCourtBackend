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
trackingRouter.post("/performtask", auth, trackingController.performTask);
trackingRouter.get("/getLatest", auth, trackingController.getLatestInfo);
trackingRouter.get("/sessions", auth, trackingController.getUserSessions);
trackingRouter.get('/getallsessions',auth, checkAdmin, trackingController.getAllSessions);


module.exports = trackingRouter;
