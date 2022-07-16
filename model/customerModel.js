const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const saltRound = 10;

const CustomerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
      max: 32,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true },
    cpassword: { type: String },
    role: {
      type: String,
      default: "subscriber",
    },
    resetPasswordLink: {
      data: String,
      default: "",
    },
  },
  { timestamps: true }
);

CustomerSchema.pre("save", async function (next) {
  try {
    const salt = await bcrypt.genSalt(saltRound);
    const hashedPassword = await bcrypt.hash(this.password, salt);
    this.password = hashedPassword;
    this.cpassword = "";
    next();
  } catch (error) {
    next(error);
  }
});

CustomerSchema.methods.isValidPassword = async function (password) {
  try {
    return await bcrypt.compare(password, this.password);
  } catch (error) {
    throw error;
  }
};
const Customer = mongoose.model("Customer", CustomerSchema);

module.exports = Customer;
