const mongoose = require("mongoose");

const campaignSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    emailinglist: { type: String, required: true },
    noopened: {
      type: Number,
      default: 0,
    },
    noclicked: {
      type: Number,
      default: 0,
    },
    mailsent: {
      type: Number,
      default: 0,
    },
    requested: { type: Number },
    bounces: { type: Number },
    campid: { type: String },
  },
  { timestamps: true }
);

const Campaign = mongoose.model("Campaign", campaignSchema);

module.exports = Campaign;
