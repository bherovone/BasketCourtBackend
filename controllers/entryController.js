const Entry = require("../models/entryModel"); // Assuming your Entry model is in the models folder


// Create a new entry
const createEntry = async (req, res) => {
  try {
    const { userId, courtId, entryTime, exitTime } = req.body;
    const newEntry = new Entry({ userId, courtId, entryTime, exitTime });
    const savedEntry = await newEntry.save();
    return res.status(201).json(savedEntry);
  } catch (error) {
    console.error("Error creating entry:", error);
    return res.status(500).json({ message: "Error creating entry" });
  }
};

// Get all entries
const getAllEntries = async (req, res) => {
  try {
    const entries = await Entry.find().populate('userId courtId');
    return res.status(200).json(entries);
  } catch (error) {
    console.error("Error fetching entries:", error);
    return res.status(500).json({ message: "Error fetching entries" });
  }
};

// Get a single entry by ID
const getEntryById = async (req, res) => {
  try {
    const { id } = req.params;
    const entry = await Entry.findById(id).populate('userId courtId');
    if (!entry) {
      return res.status(404).json({ message: "Entry not found" });
    }
    return res.status(200).json(entry);
  } catch (error) {
    console.error("Error fetching entry:", error);
    return res.status(500).json({ message: "Error fetching entry" });
  }
};

// Update an entry by ID
const updateEntry = async (req, res) => {
  try {
    const { id } = req.params;
    const { exitTime } = req.body;

    // Log the exitTime to verify its value
    console.log('Received exitTime:', exitTime);

    const updatedEntry = await Entry.findByIdAndUpdate(
      id,
      { exitTime },
      { new: true, runValidators: true }
    ).populate('userId courtId');
    
    if (!updatedEntry) {
      return res.status(404).json({ message: "Entry not found" });
    }
    
    return res.status(200).json(updatedEntry);
  } catch (error) {
    console.error("Error updating entry:", error);
    return res.status(500).json({ message: "Error updating entry" });
  }
};


// Delete an entry by ID
const deleteEntry = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedEntry = await Entry.findByIdAndDelete(id);
    if (!deletedEntry) {
      return res.status(404).json({ message: "Entry not found" });
    }
    return res.status(200).json({ message: "Entry deleted successfully" });
  } catch (error) {
    console.error("Error deleting entry:", error);
    return res.status(500).json({ message: "Error deleting entry" });
  }
};


const getCurrentUsers = async (req, res) => {
  try {
    const { courtId } = req.params;
    const entries = await Entry.find({
      courtId,
      exitTime: { $exists: false }
    }).populate('userId courtId');

    if (entries.length === 0) {
      return res.status(404).json({ message: "No entries found for this court" });
    }

    //console.log("Getting all users in court:", entries);

    return res.status(200).json(entries);
  } catch (error) {
    console.error("Error fetching entries:", error);
    return res.status(500).json({ message: "Error fetching entries" });
  }
};


module.exports = {
  createEntry,
  getAllEntries,
  getEntryById,
  updateEntry,
  deleteEntry,
  getCurrentUsers
};
