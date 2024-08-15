const express = require('express');
const { auth, checkAdmin } = require("../middleware/auth");
const pointRouter = express.Router();
const pointController = require('../controllers/pointController'); 


pointRouter.post('/',auth, pointController.createPoint);

module.exports = pointRouter;
