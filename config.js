const dotenv = require("dotenv");
const path = require("path");

console.log(process.env.NODE_ENV);

dotenv.config({
  path: path.resolve(__dirname, `${process.env.NODE_ENV}.env`),
});

module.exports = {
  NODE_ENV: process.env.NODE_ENV || "development",
  HOST: process.env.HOST || "localhost",
  PORT: process.env.PORT || 5000,
  DATABASE: process.env.DATABASE_SERVER || process.env.DATABASE_LOCAL,
};
