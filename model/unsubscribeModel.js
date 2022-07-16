const mongoose = require("mongoose");

const unsubscribeSchema = new mongoose.Schema({
  campid: { type: String, required: true },
  userid: { type: String, required: true },
  unsubscribedAt: { type: Date, default: Date.now(), select: false },
});

const Unsubscribe = mongoose.model("Unsubscribe", unsubscribeSchema);

module.exports = Unsubscribe;
