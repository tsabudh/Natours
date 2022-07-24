const mongoose = require('mongoose');

//CONSTRUCTING A MONGOOSE SCHEMA
const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A tour must have a name.'],
    unique: [true, 'A name must be unique'],
    trim: true,
  },
  summary: {
    type: String,
    required: [true, 'A tour must have a summary.'],
  },
  duration: {
    type: Number,
    required: [true, 'A tour must have a duration.'],
  },
  maxGroupSize: {
    type: Number,
    required: [true, 'A tour must have a Group Size'],
  },
  difficulty: {
    type: String,
    required: [true, 'A tour must have a price'],
  },

  ratingsAverage: {
    type: Number,
    default: 4.5,
  },
  ratingQuantity: {
    type: Number,
    default: 0,
  },
  price: {
    type: Number,
    required: [true, 'A tour must have a price'],
  },
  priceDiscount: {
    type: Number,
    summary: {
      type: String,
      trim: true,
    },
  },
  description: {
    type: String,
    trim: true,
    required: [true, 'A tour must have description'],
  },
  imageCover: {
    type: String,
    required: [true, 'A tour must have cover image'],
  },
  images: {
    type: [String],
  },
  createdAt: {
    type: Date,
    default: Date.now(),
    select: false,
  },
  startDates: [Date],
});

// CREATING A MODEL FROM THE "tourSchema" SCHEMA
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
