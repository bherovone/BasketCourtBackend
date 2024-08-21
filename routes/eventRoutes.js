const express = require('express');
const { auth, checkAdmin } = require("../middleware/auth");
const eventRouter = express.Router();
const eventController = require('../controllers/eventController'); 


eventRouter.post('/',auth, eventController.createEvent);

module.exports = eventRouter;