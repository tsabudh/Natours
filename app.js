const express = require("express");
const path = require("path");
const cors = require("cors");
const compression = require("compression");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const cookieParser = require("cookie-parser");
const hpp = require("hpp");
// const serverless = require("serverless-http");

// const mongoSanitize = require('express-mongo-sanitize');
// const xss = require('xss-clean');
// const { dirname } = require('path');

const AppError = require("./utils/appError");
const globalErrorHandler = require("./controllers/errorController");
const tourRouter = require("./routes/tourRoutes");
const userRouter = require("./routes/userRoutes");
const reviewRouter = require("./routes/reviewRoutes");
const viewRouter = require("./routes/viewRoutes");
const bookingsRouter = require("./routes/bookingsRoutes");

// start express app
const app = express();

//* 1) GLOBAL MIDDLEWARE
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));
app.use(cors());
app.use(compression());

// Serving Static Files
app.use(express.static(`public`));

//Set Security HTTP Headers
app.use(helmet());

// Development Login
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Limit Requests for API
const limiter = rateLimit({
  max: 100,
  windowMilliseconds: 60 * 60 * 1000,
  message: "Too many requests from this IP, please try again in an hour!",
});
app.use("/api/v1", limiter);

// Body Parser, reading data from body into req.body
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());

//  MONGO SANITIZE AND XSS IS NOT WORKING....
// Data sanitization against NoSQL query injection
// app.use(mongoSanitize);
// Data sanitization against XSS
// app.use(xss);

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      "duration",
      "ratingsQuantity",
      "ratingsAverage",
      "difficulty",
      "price",
      "maxGroupSize",
    ],
  })
);

app.use("/", (req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// Headers for CORS
app.use("*", (req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    "script-src-elem 'self' https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js https://js.stripe.com/v3/ *; style-src 'self' *"
  );
  res.setHeader("Cross-Origin-Embedder-Policy", "*");
  res.setHeader("Cross-Origin-Opener-Policy", "*");
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");

  next();
});

//* NETLIFY
// const router = express.Router();
// router.get('/hello', (req, res) => res.send('Hello World!'));

// app.use('/api/', router);
// // eslint-disable-next-line import/prefer-default-export
// export const handler = serverless(app);


//* 2) DEFINE ROUTES
// app.use("/", viewRouter);
// app.use("/api/v1/tours/", tourRouter);
// app.use("/api/v1/users/", userRouter);
// app.use("/api/v1/reviews/", reviewRouter);
// app.use("/api/v1/bookings/", bookingsRouter);

app.use("/.netlify/functions/api/", viewRouter);
app.use("/.netlify/functions/api/api/v1/tours/", tourRouter);
app.use("/.netlify/functions/api/api/v1/users/", userRouter);
app.use("/.netlify/functions/api/api/v1/reviews/", reviewRouter);
app.use("/.netlify/functions/api/api/v1/bookings/", bookingsRouter);

// Error Handling for Undefined Routes
app.all("*", (req, res, next) => {
  next(
    new AppError(
      `can't find ${req.originalUrl} in this server. by app.all next(new AppError)`
    )
  );
});



//* 3) DEFINE GLOBAL ERROR HANDLER
app.use(globalErrorHandler);

//* 4) START SERVER ON SERVER.JS
module.exports= app;


