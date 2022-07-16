const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema({
  firstname: {
    type: String,
  },
  lastname: {
    type: String,
  },
  email: {
    type: String,
    unique: false,
    required: true,
  },
  unsubscribe: {
    type: Boolean,
    default: false,
  },
  emailinglistid: {
    type: String,
    required: true,
  },
});

const Contact = mongoose.model("Contact", contactSchema);

module.exports = Contact;
