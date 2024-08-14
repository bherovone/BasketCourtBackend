const express = require("express");
const { auth, checkAdmin } = require("../middleware/auth");
const courtController = require("../controllers/courtController");
const courtRouter = express.Router();

courtRouter.get("/check", auth, courtController.checkCourtExist);
courtRouter.post("/addcourt", auth, courtController.addCourt);
courtRouter.get("/getallcourts", auth, courtController.getAllCourts);
courtRouter.get("/getcourt/:id", auth, courtController.getCourtById);
courtRouter.put("/updatecourt/:id", auth, checkAdmin, courtController.updateCourt);
courtRouter.delete("/deletecourt/:id", auth, checkAdmin, courtController.deleteCourt);

module.exports = courtRouter;
