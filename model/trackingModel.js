const mongoose = require("mongoose");

const trackingSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  imagePath: { type: String, required: true },
});

const Tracking = mongoose.model("Tracking", trackingSchema);

module.exports = Tracking;
