const multer = require('multer');
const sharp = require('sharp');
const Tour = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');
const AppError = require('../utils/appError');

// const tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
// );

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (req.file.filetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new AppError('Please upload only images!', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  filter: multerFilter,
});

exports.uploadTourImages = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 },
]);

exports.resizeTourImages = async (req, res, next) => {
  if (!req.files.imageCover || !req.files.images) next();

  const imageCoverFilename = `tour-${req.params.id}-${Date.now()}.jpeg`;
  // 1) Cover Image
  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/tours/${imageCoverFilename}`);

  req.body.imageCover = imageCoverFilename;

  // 2) Images

  await Promise.all(
    req.files.images.map(async (file, i) => {
      const filename = `tour-${req.params.id}-${Date.now}-${i + 1}.jpeg`;

      await sharp(req.files.images[i].buffer)
        .resize(2000, 1333)
        .toFormat('jepg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${imageCoverFilename}`);

      req.body.images.push(filename);
    })
  );

  next();
};

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = 5;
  req.query.sort = 'price,-ratingsAverage';
  req.query.fields = 'name,price,summary,difficulty,ratingsAverage';
  next();
};

exports.getAllTours = factory.getAll(Tour);
exports.createTour = factory.createOne(Tour);
//SINGLE TOUR REQUESTS HANDLERS
exports.getTour = factory.getOne(Tour, { path: 'reviews' });
exports.updateTour = factory.updateOne(Tour);
exports.deleteTour = factory.deleteOne(Tour);

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;

  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTourStart: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    {
      $addFields: { month: '$_id' },
    },
    {
      $project: { _id: 0 },
    },
    {
      $sort: { numTourStart: -1 },
    },
  ]);

  res.status(201).json({
    status: 'success',
    data: {
      plan,
    },
  });

  next();
});

exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 0.5 } },
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        // _id: '$ratingsAverage',
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: { ratingsAverage: 1 },
    },
    // {
    //   $match: { _id: { $ne: 'EASY' } },
    // },
  ]);

  res.status(201).json({
    status: 'success',
    data: {
      stats,
    },
  });

  next();
});

// exports.deleteTour = catchAsync(async (req, res, next) => {
//   // const tour = await Tour.findOneAndDelete({ _id: req.params.id });
//   const tour = await Tour.findByIdAndDelete(req.params.id);

//   if (!tour) {
//     return next(new AppError('Could not find tour with that ID', 404));
//   }

//   res.status(204).json({
//     status: 'success',
//     // body: {
//     //   tour,
//     // },
//     // IT IS COMMON PRACTICE TO NOT SEND DELETED OBJECT BACK TO THE CLIENT IN REST API
//     message: 'The tour was deleted',
//   });

//   next();
// });

exports.getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');
  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

  if (!lat || !lng) {
    next(
      new AppError(
        'Please provide latitude and longitude in the format lat.lng.',
        400
      )
    );
  }

  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });
  console.log(tours);
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      data: tours,
    },
  });
});

exports.getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

  if (!lat || !lng) {
    next(
      new AppError(
        'Please provide latitude and longitude in the format lat.lng.',
        400
      )
    );
  }

  const distances = await Tour.aggregate([
    {
      $geoNear: {
        key: 'startLocation',
        near: {
          type: 'Point',
          coordinates: [lng * 1, lat * 1],
        },
        distanceField: 'distance',
        distanceMultiplier: multiplier,
      },
    },
    {
      $project: {
        distance: 1,
        name: 1,
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      data: distances,
    },
  });
});

// exports.saveAll = catchAsync(async (req, res, next) => {
//   const tours = await Tour.find();
//   // console.log(tours);
//   // tours.update();
//   // console.log(tour);
//   //////////////////////////////
//   // await Tour.validate(tours[0]);
//   // tours[0].save();

//   tours.forEach(async (tour) => {
//     await Tour.validate(tour);
//     tour.save();
//   });

//   res.status(200).json({
//     status: 'success',
//     tour: tours[0],
//   });
// });
