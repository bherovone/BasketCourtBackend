const express = require('express');
const router = express.Router();
const entryController = require('../controllers/entryController'); // Assuming your controller is in the controllers folder

// Create a new entry
router.post('/', entryController.createEntry);

// Get all entries
router.get('/', entryController.getAllEntries);

// Get a single entry by ID
router.get('/:id', entryController.getEntryById);

// Update an entry by ID
router.put('/:id', entryController.updateEntry);

// Delete an entry by ID
router.delete('/:id', entryController.deleteEntry);

module.exports = router;
