const serverless = require("serverless-http");
const express = require("express");
const app = require("../app");

app.use("/.netlify/functions/", express.Router());
exports.handler = serverless(app);
