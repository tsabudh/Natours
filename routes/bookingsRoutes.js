const express = require('express');
const authController = require('../controllers/authController');
const bookingsController = require('../controllers/bookingsController');


const router = express.Router();

router.get('/checkout-session/:tourID',authController.protect, bookingsController.getCheckoutSession

)

module.exports = router;