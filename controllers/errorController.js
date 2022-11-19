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
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: ` ${err.message}`,
    stack: err.stackstack,
  });
};

const sendErrorProd = (err, res) => {
  // console.log('message 3 from  senderrorprod globalerrorhandler');

  //OPERATIONAL trusted error, send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: `Error:  ${err.message}`,
      stack: err.stackstack,
    });
    //PROGRAMMING and other unknown error, dont send message to client
  } else {
    // 1) Log error
    // console.error('ERROR 💥', err);

    //send generic message
    res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!',
    });
  }
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

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV.trim() === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV.trim() === 'production') {
    //trim() needed because process.env.NODE_ENV is returning "production ". a trailing space.

    let error = { ...err };
    if (error.name === 'castError') error = handleCastErrorDB(error);
    // error.isOperational = true;

    if (error.code === 11000) error = handleDuplicateFieldsDB(error);

    // console.log(Object.values(error.errors));
    // console.log((Object.values(error.errors)));
    console.log(
      '%%00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000'
    );

    if (error.name === 'ValidatonError') error = handleValidationErrorDB(error);

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
    console.log(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

    sendErrorProd(error, res);
  }

  next();
};
