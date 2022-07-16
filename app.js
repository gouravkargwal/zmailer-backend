const express = require("express");
const cors = require("cors");
const createError = require("http-errors");
const morgan = require("morgan");
require("dotenv").config();
require("./helpers/init_mongodb");

const mailRouter = require("./routes/mailRoutes");
const authRouter = require("./routes/authRoutes.js");

const app = express();
app.use(morgan("dev"));
app.use(cors());
app.use(express.static("./client/public"));

app.use(express.json());
app.use(express.text({ type: "text/html" }));
app.use(express.urlencoded({ extended: false }));

app.use("/api/v1/mail", mailRouter);
app.use("/api/v1/mail", authRouter);

app.use((req, res, next) => {
  // const error = new Error("Not Found");
  // error.status = 404;
  // next(error);
  next(createError.NotFound("This route doesnot exist"));
});

app.use((err, req, res, next) => {
  console.log(err);
  res.status(err.status || 500);
  res.json({
    status: err.status || 500,
    error: err.message,
  });
});

module.exports = app;
