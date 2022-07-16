const mongoose = require("mongoose");
const config = require("../config");

mongoose
  .connect("mongodb://localhost:27017/z-mailer", {
    useNewUrlParser: true,
  })
  .then(() => {
    console.log("DB Connection Successful!!");
  })
  .catch((err) => {
    console.log(err);
  });

mongoose.connection.on("connected", () => {
  console.log("Mongoose connected to db");
});

mongoose.connection.on("error", (err) => {
  console.log(err.message);
});

mongoose.connection.on("disconnected", () => {
  console.log("Mongoose connection is disconnected");
});

process.on("SIGINT", async () => {
  await mongoose.connection.close();
  process.exit(0);
});
