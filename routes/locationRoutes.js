const express = require('express');
const { auth, checkAdmin } = require("../middleware/auth");
const locationRouter = express.Router();
const locationController = require('../controllers/locationController'); 


locationRouter.post('/',auth, locationController.createlocation);

module.exports = locationRouter;