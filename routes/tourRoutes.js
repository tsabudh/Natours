const express = require('express');

const router = express.Router();
const tourController = require('../controllers/tourController');
// FILES

// - MIDDLEWARE--------------------------------------------------------------------
// router.param('id', tourController.checkID);

// ROUTES

router
  .route('/')
  .get(tourController.getAllTours)
  .post(tourController.createTour)
  .put(tourController.putTours)
  .patch(tourController.patchTours)
  .delete(tourController.deleteTours);

router
  .route('/:id')
  .get(tourController.getTour)
  .post(tourController.postTour)
  .put(tourController.putTour)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);

module.exports = router;
