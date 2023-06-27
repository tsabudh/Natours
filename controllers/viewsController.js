const pug = require('pug');

const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const Booking = require('../models/bookingModel');

const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { getAllBookings } = require('./bookingsController');

exports.getOverview = catchAsync(async (req, res, next) => {
  const tours = await Tour.find();
  res.status(200).render('overview', {
    title: 'All Tours',
    tours,
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: ' review rating user',
  });

  if (!tour) {
    return next(new AppError('There is no tour with that name'));
  }

  //   console.log(req.params.slug);
  //   console.log(tour);

  res.status(200).render('tour', {
    title: `${tour.name} Tour`,
    tour,
  });
});

// const includeFunc = (fileName, options = {}) =>
//   pug.renderFile(`F:/Studies/Node/natours/views/${fileName}.pug`, options);
// pug.renderFile(pathToPug, options); //render the pug file

exports.renderTabs = async (req, res, next) => {
  const renderOptions = {};
  const { tab } = req.params;

  renderOptions.user = res.locals.user;
  renderOptions.title = tab || 'bookings';
  const bookings = await Booking.find({ user: { _id: res.locals.user._id } });
  // const results = await getAllBookings();
// await Booking.deleteMany();
  renderOptions.bookings = [...bookings];
  console.log(tab);

  // if (tab) res.status(200).render(tab, { bookings });
  if (tab) res.status(200).render(tab, { ...renderOptions });
  else res.render('account1', {...renderOptions});
};

exports.getLoginForm = (req, res) => {
  res.status(200).render('login', {
    title: 'Log into your account',
  });
};

exports.getAccount = (req, res) => {
  res.status(200).render('account1', {
    title: 'Your account',
    tab: '_settings',
  });
};

exports.updateUserData = catchAsync(async (req, res, next) => {
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      email: req.body.email,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).render('Account', {
    title: 'Your account',
    user: updatedUser,
  });
});

exports.getMyTours = catchAsync(async (req, res, next) => {
  const bookings = await Booking.find({ user: req.user._id });

  const tourIds = bookings.map((booking) => booking.tour);

  const tours = await Tour.find({ _id: { $in: tourIds } });
  res.status(200).render('overview', {
    title: 'Booked Tours',
    tours,
  });
});
