const Court = require("../models/courtModel");

const addCourt = async (req, res) => {
  try {
    const { name, location } = req.body;

    const newCourt = new Court({ name, location });
    const savedCourt = await newCourt.save();

    return res.status(201).send(savedCourt);
  } catch (error) {
    console.error("Unable to add court:", error);
    return res.status(500).send("Unable to add court");
  }
};

const getAllCourts = async (req, res) => {
  try {
    const courts = await Court.find();
    return res.status(200).send(courts);
  } catch (error) {
    console.error("Unable to get courts:", error);
    return res.status(500).send("Unable to get courts");
  }
};

const getCourtById = async (req, res) => {
  try {
    const court = await Court.findById(req.params.id);
    if (!court) {
      return res.status(404).send("Court not found");
    }
    return res.status(200).send(court);
  } catch (error) {
    console.error("Unable to get court:", error);
    return res.status(500).send("Unable to get court");
  }
};

const updateCourt = async (req, res) => {
  try {
    const { name, location } = req.body;

    const updatedCourt = await Court.findByIdAndUpdate(
      req.params.id,
      { name, location },
      { new: true }
    );

    if (!updatedCourt) {
      return res.status(404).send("Court not found");
    }

    return res.status(200).send(updatedCourt);
  } catch (error) {
    console.error("Unable to update court:", error);
    return res.status(500).send("Unable to update court");
  }
};

const deleteCourt = async (req, res) => {
  try {
    const deletedCourt = await Court.findByIdAndDelete(req.params.id);
    if (!deletedCourt) {
      return res.status(404).send("Court not found");
    }
    return res.status(200).send("Court deleted successfully");
  } catch (error) {
    console.error("Unable to delete court:", error);
    return res.status(500).send("Unable to delete court");
  }
};

module.exports = {
  addCourt,
  getAllCourts,
  getCourtById,
  updateCourt,
  deleteCourt,
};
