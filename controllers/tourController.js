const Tour = require('../models/tourModel');

// const tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
// );

exports.getAllTours = async (req, res) => {
  try {
    console.log(req.query);
    const tours = await Tour.find();

    // const tours = await Tour.find({
    //   difficulty: 'easy',
    //   duration: 5,
    // });
    console.log(tours);
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
      message: 'COULD NOT GET TOURS',
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
  }
};

exports.putTours = function (req, res) {
  res.status(200).json({
    status: 'success',
  });
};

exports.patchTours = function (req, res) {
  res.status(200).json({
    status: 'success',
  });
};

exports.deleteTours = function (req, res) {
  res.status(200).json({
    status: 'success',
  });
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
exports.putTour = function (req, res) {
  res.status(200).json({
    status: 'success',
    message: 'still not constructed',
  });
};
exports.postTour = function (req, res) {
  res.status(200).json({
    status: 'success',
    message: 'still not constructed',
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
