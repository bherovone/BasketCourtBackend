const express = require('express');
const { auth, checkAdmin } = require("../middleware/auth");
const deviceRouter = express.Router();
const deviceController = require('../controllers/deviceController'); 


deviceRouter.post('/', deviceController.createDevice);

module.exports = deviceRouter;