const multer = require('multer');
const sharp = require('sharp');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Tour = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');
const AppError = require('../utils/appError');

exports.getCheckoutSession = (req, res, next) => {
  // 1 Get currently booked tour
  const tour = Tour.findById(req.params.tourID);

  // 2 Create checkout session
  stripe.checkout.session.create({
    line_items: [
      {
        // Provide the exact Price ID (for example, pr_1234) of the product you want to sell
        price: '{{PRICE_ID}}',
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `${YOUR_DOMAIN}/success.html`,
    cancel_url: `${YOUR_DOMAIN}/cancel.html`,
  });

  // 3 Create session as response
};
