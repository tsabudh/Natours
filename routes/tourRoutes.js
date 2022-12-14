const express = require('express');

const router = express.Router();
const authController = require('../controllers/authController');
const tourController = require('../controllers/tourController');
const reviewRouter = require('./reviewRoutes');

// FILES

// - MIDDLEWARE--------------------------------------------------------------------
// router.param('id', tourController.checkID);

// ROUTES

router.use('/:tourId/reviews', reviewRouter);

// router.route('/saveall').post(tourController.saveAll);

router.route('/tour-stats').get(tourController.getTourStats);

router
  .route('/get-monthly-plan/:year')
  .get(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide', 'guide'),
    tourController.getMonthlyPlan
  );

router
  .route('/top-5-cheap-tours')
  .get(tourController.aliasTopTours, tourController.getAllTours);

router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(tourController.getToursWithin);
//  /tours-distance?distance=233&center=-40,34&unit=miles
// /tours-distance/233/cnter/-40,34/unit/miles

router.route('/distances/:latlng/unit/:unit').get(tourController.getDistances);

router
  .route('/')
  .get(tourController.getAllTours)
  .post(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.createTour
  );

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.uploadTourImages,
    tourController.resizeTourImages
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour
  );

module.exports = router;
