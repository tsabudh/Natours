const serverless = require("serverless-http");
const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const app = require("../app");

//PROCESS ENVIRONMENT
process.on("uncaughtException", (err) => {
  console.log(err.status, err.message);
  console.log("UNCAUGHT EXCEPTION!💥💥 Shutting down...!");
  console.log(err);

  process.exit(1);
});

dotenv.config({ path: "./config.env" });

const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log("connected to ATLAS DATABASE");
  });

app.use("/.netlify/functions/", express.Router());
exports.handler = serverless(app);
