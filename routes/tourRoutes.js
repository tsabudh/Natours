const express = require('express');

const router = express.Router();
const tourController = require('../controllers/tourController');
// FILES

// - MIDDLEWARE--------------------------------------------------------------------
// router.param('id', tourController.checkID);

// ROUTES

router.route('/tour-stats').get(tourController.getTourStats);

router.route('/get-monthly-plan/:year').get(tourController.getMonthlyPlan);

router
  .route('/top-5-cheap-tours')
  .get(tourController.aliasTopTours, tourController.getAllTours);

router
  .route('/')
  .get(tourController.getAllTours)
  .post(tourController.createTour);

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);

module.exports = router;
