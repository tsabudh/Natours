const catchAsync = function (fn) {
  // console.log('from catchasync fn');
  return (req, res, next) => fn(req, res, next).catch((err) => next(err));
};
module.exports = catchAsync;
