const express = require('express');
const { auth, checkAdmin } = require("../middleware/auth");
const bglocationRouter = express.Router();
const bglocationController = require('../controllers/bglocationController'); 


bglocationRouter.post('/',auth, bglocationController.createBglocation);

module.exports = bglocationRouter;