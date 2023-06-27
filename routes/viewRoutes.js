const express = require('express');
const viewsController = require('../controllers/viewsController');
const authController = require('../controllers/authController');
const bookingsController = require('../controllers/bookingsController');

const router = express.Router();

// router.use(authController.isLoggedIn);

// ROUTES
router.get(
  '/',
  bookingsController.createBookingCheckout,
  authController.isLoggedIn,
  viewsController.getOverview
);
router.get('/tour/:slug', authController.isLoggedIn, viewsController.getTour);
router.get('/login', authController.isLoggedIn, viewsController.getLoginForm);
router.get('/my-bookings', authController.protect, viewsController.getMyTours);

router.route('/me').get(authController.protect, viewsController.renderTabs);

router
  .route('/me/:tab')
  .get(authController.protect, viewsController.renderTabs);
  

router.post(
  '/submit-user-data',
  authController.protect,
  viewsController.updateUserData
);
module.exports = router;
