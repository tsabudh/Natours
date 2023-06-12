const AppError = require('../utils/appError');

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path} : ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const value = err.errmsg.match(/(["'])(?:(?=(\\?))\2.)*?\1/[0]);
  const message = `Duplicate field value:${value}! Please use another value.`;
  return new AppError(message, 400);
};

const sendErrorDev = (err, req, res) => {
  //A API
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  }

  //B RENDERED WEBSITE
  console.log('ERROR 💥💥💥💥', err);
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong!',
    msg: err.message,
  });
};

const sendErrorProd = (err, req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    // A API Website
    //OPERATIONAL trusted error, send message to client
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: `Error: 💥💥💥💥 ${err.message}`,
      });
    }
    //PROGRAMMING and other unknown error, don't send message to client
    //send generic message
    return res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!',
    });
  }
  // B RENDERED WEBSITE
  console.log('ERROR 💥💥💥💥', err);

  if (err.isOperational) {
    return res.status(err.statusCode).render('error', {
      title: 'Something went wrong!',
      msg: err.message,
    });
  }
  //PROGRAMMING and other unknown error, don't send message to client
  return res.status(500).json({
    status: 'error',
    message: 'Something went very wrong!',
    msg: 'Please try again later',
  });
};

const handleValidationErrorDB = (err) => {
  // console.log(typeof err);
  // console.log(err.AppError);
  // if (Object.values(err.errors)) {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Validation Error: Invalid input data. ${errors.join('. ')}`;
  // console.log(message);
  return new AppError(message, 400);
};

const handleJWTError = () =>
  new AppError('Invalid token. Please login again.', 401);

const handleJWTExpiredError = () =>
  new AppError('Your token has expired. Please login again', 401);

// EXPORTED FUNCTION

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV.trim() === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV.trim() === 'production') {
    //trim() needed because process.env.NODE_ENV is returning "production ". a trailing space.

    let error = { ...err };
    error.message = err.message;

    if (error.name === 'castError') error = handleCastErrorDB(error);
    // error.isOperational = true;

    if (error.code === 11000) error = handleDuplicateFieldsDB(error);

    // console.log(Object.values(error.errors));
    // console.log((Object.values(error.errors)));
    // console.log(
    //   '%%00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000'
    // );

    if (error.name === 'ValidationError') error = handleValidationErrorDB(error);

    if (error.errors) {
      Object.values(error.errors)
        .map((el1) => el1.constructor.name)
        .forEach((el2) => {
          if (error.errors && el2 === 'ValidatorError') {
            // console.log(typeof error, typeof error.errors, el2, typeof el2);

            error = handleValidationErrorDB(error);
          }
        });
    }
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

    sendErrorProd(error, req, res);
  }

  next();
};
