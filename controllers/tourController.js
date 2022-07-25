const Tour = require('../models/tourModel');
const APIfeatures = require('../utils/apiFeatures');
// const tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
// );

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = 5;
  req.query.sort = 'price,-ratingsAverage';
  req.query.fields = 'name,price,summary,difficulty,ratingsAverage';
  next();
};

exports.getAllTours = async (req, res) => {
  try {
    //EXECUTE QUERY
    // console.log();
    const features = new APIfeatures(Tour.find(), req.query)
      .filter()
      .sort()
      .limit()
      .paginate();

    const tours = await features.query;

    //SEND RESPONSE
    res.status(200).json({
      status: 'success',
      results: tours.length,
      data: {
        tours,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'Fail',
      message: `${err} COULD NOT GET TOURS`,
    });
  }
};

exports.createTour = async function (req, res) {
  try {
    const newTour = await Tour.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        tour: newTour,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'Fail',
      message: err,
    });
    console.log(err);
  }
};

exports.getMonthlyPlan = async (req, res) => {
  try {
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
  } catch (err) {
    res.status(400).json({
      status: 'Fail',
      message: err,
    });
  }
};

exports.getTourStats = async (req, res) => {
  try {
    const stats = await Tour.aggregate([
      {
        $match: { ratingsAverage: { $gte: 4.5 } },
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
  } catch (err) {
    res.status(400).json({
      status: 'Fail',
      message: err,
    });
  }
};
//SINGLE TOUR REQUESTS HANDLERS

exports.getTour = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);

    //Tour.findOne({_id:req.params.id}); // same as Tour.findById
    res.status(200).json({
      status: 'success',
      data: {
        tour: tour,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'Fail',
      message: `INVALID DATA SENT ${err}`,
    });
  }
  res.status(200).json({
    status: 'success',
    requestedTime: req.requestTime,
  });
};

//UPDATE TOUR
exports.updateTour = async function (req, res) {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'Fail',
      message: `INVALID DATA SENT ${err}`,
    });
  }
};
exports.deleteTour = async function (req, res) {
  try {
    // const tour = await Tour.findOneAndDelete({ _id: req.params.id });
    await Tour.findByIdAndDelete(req.params.id);
    res.status(204).json({
      status: 'success',
      // body: {
      //   tour,
      // },
      // IT IS COMMON PRACTICE TO NOT SEND DELETED OBJECT BACK TO THE CLIENT IN REST API
      message: 'The tour was deleted',
    });
  } catch (err) {
    res.status(400).json({
      status: 'Fail',
      message: `INVALID DATA SENT ${err}`,
    });
  }
};
