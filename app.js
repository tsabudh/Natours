const express = require('express');
const path = require('path');

const app = express();
const helmet = require('helmet');

const morgan = require('morgan');

const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');

// const mongoSanitize = require('express-mongo-sanitize');

// const xss = require('xss-clean');

const hpp = require('hpp');
// const { dirname } = require('path');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const viewRouter = require('./routes/viewRoutes');

// 1) GLOBAL MIDDLEWARES
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// Serving Static Files
// app.use(express.static(`${__dirname}/public`));
app.use(express.static(path.join(__dirname, 'public')));
//Set Security HTTP Headers
app.use(helmet());

// Development Login
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Limit Requests for api
const limiter = rateLimit({
  max: 100,
  windowMilliseconds: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!',
});

app.use('/api/v1', limiter);

// Body Parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

//  MONGOSANITIZE AND XSS IS NOT WORKING....
// Data sanitization against NoSQL query injection
// app.use(mongoSanitize);

// Data sanitization against XSS
// app.use(xss);

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'difficulty',
      'price',
      'maxGroupSize',
    ],
  })
);

app.use('/', (req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.headers);

  next();
});

// This is to edit the meta content-security-policy because it did not took the following script source even when explicitly defined
app.use('/', (req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "script-src 'self' https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"
  );
  next();
});

// ROUTES
app.use('/', viewRouter);
app.use('/api/v1/tours/', tourRouter);
app.use('/api/v1/users/', userRouter);
app.use('/api/v1/reviews/', reviewRouter);

//error handling
app.all('*', (req, res, next) => {
  next(
    new AppError(
      `can't find ${req.originalUrl} in this server. by app.all next(new AppError)`
    )
  );
});

//global error handling middleware
app.use(globalErrorHandler);

// 4) START SERVER

module.exports = app;
