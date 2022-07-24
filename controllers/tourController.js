const Tour = require('../models/tourModel');

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
    //  1A) FILTERING
    const queryObj = { ...req.query };
    const excludedFields = ['sort', 'page', 'limit', 'fields'];
    excludedFields.forEach((el) => delete queryObj[el]);

    console.log(req.query);

    //  1B) ADVANCED FILTERING
    const queryStr = JSON.stringify(queryObj).replace(
      /\b(gt|gte|lt|lte)\b/g,
      (matchedItems) => `$${matchedItems}`
    );
    let query = Tour.find(JSON.parse(queryStr));

    //  2) SORTING   queryObject.sort('property1 property2');
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' '); //eg: 'price ratingsAverage
      query = query.sort(sortBy);
    } else {
      // query = query.sort('-createdAt');
      query = query.sort('price ratingsAverage');
    }

    // 3) LIMITING FIELDS
    if (req.query.fields) {
      const fields = req.query.fields.split(',').join(' ');
      console.log(fields);
      query = query.select(fields);
    } else {
      query = query.select('-__v');
    }

    // 4) PAGINGINATION DEFAULT_LIMIT
    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 3;
    const skip = (page - 1) * limit;
    query = query.skip(skip).limit(limit);

    // query = query.skip(2).limit(3);
    if (req.query.page) {
      const numTours = await Tour.countDocuments();
      if (skip >= numTours) throw new Error('This page does not exist.');
    }

    //AWAITING
    const tours = await query;

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
