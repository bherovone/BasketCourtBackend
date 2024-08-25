const express = require('express');
const { auth, checkAdmin } = require("../middleware/auth");
const entryRouter = express.Router();
const entryController = require('../controllers/entryController'); // Assuming your controller is in the controllers folder

// Create a new entry
entryRouter.post('/',auth, entryController.createEntry);

// Get all entries
entryRouter.get('/',auth, entryController.getAllEntries);

// Get a single entry by ID
entryRouter.get('/:id',auth, entryController.getEntryById);

// Update an entry by ID
entryRouter.put('/:id/updateEntry',auth, entryController.updateEntry);

// Delete an entry by ID
entryRouter.delete('/:id',auth, entryController.deleteEntry);

entryRouter.get('/:courtId/users',auth, entryController.getCurrentUsers);

module.exports = entryRouter;
