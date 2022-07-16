const mongoose = require("mongoose");

const domainSchema = new mongoose.Schema({
  domain: { type: String, required: true, unique: true },
  selector: { type: String, required: true },
});

const Domain = mongoose.model("Domain", domainSchema);

module.exports = Domain;
