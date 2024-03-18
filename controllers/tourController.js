const Tour = require('./../models/tourModel');
const APIFeatures = require('./../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5'; // string!
  req.query.sort = '-ratingsAverage,price';
  // never forget next()!!!
  next();
};

// Filtering is done in 'getAll', e.g. tours?name=abc&duration=1
// req.query: {name: 'abc', duration: '1'}  note that the value in req.query is string!!!
// api can be as simple as:  const tours = await Tour.find(req.query);
// but req.query may contain some fields like 'page = 5', which is not part of the schema, so we need to exclude those

// include gte lte gt lt, e.g. tours?duration[gte]=5&price[lt]=1000
// req.query: {duration: {gte: 5}, price: {lt: 1000}}
// but .find(query) needs: {duration: {$gte: 5}, price: {$lt: 1000}}

// sorting e.g. tours?sort=-price,ratingsAverage  (+ascending -descending separated by comma)
// we need to make the values of 'sort' separated by ' '

// data projecting e.g. fields=name,duration -> only return the specified/remaining(-) properties using query.select("name duration difficulty")
// 'fields=-__v' means that everything but __v
// id is by default always included

// pagination e.g. tours?page=2&limit=10

exports.getAllTours = catchAsync(async (req, res, next) => {
  // // start to build the query
  // const queryObj = { ...req.query }; // shallow copy

  // // exclude special queries
  // const excludedFileds = ['page', 'sort', 'limit', 'fields'];
  // excludedFileds.forEach(ele => delete queryObj[ele]);

  // // gte lte gt lt
  // let queryStr = JSON.stringify(queryObj);
  // queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);

  // let query = Tour.find(JSON.parse(queryStr)); // .find() only return query, which can chain functions like sort()

  // sorting based on multiple properties
  // if (req.query.sort) {
  //   const sortBy = req.query.sort.split(',').join(' ');
  //   query = query.sort(sortBy);
  // } else {
  //   query = query.sort('-createdAt');
  // }

  // projecting(field limiting)
  // if (req.query.fields) {
  //   const fields = req.query.fields.split(',').join(' ');
  //   query = query.select(fields);
  // } else {
  //   query = query.select('-__v'); // use '-' to exclude the __v property
  // }

  // pagination
  // const page = req.query.page * 1 || 1;
  // const limit = req.query.limit * 1 || 100;
  // // page=2&limit=10  page1: 1-10  page2: 11-20
  // // query = query.skip(10).limit(10);
  // query = query.skip((page - 1) * limit).limit(limit);
  // // handle wrong param
  // if (req.query.page) {
  //   const numTours = await Tour.countDocuments(); // get the total
  //   if ((page - 1) * limit > numTours)
  //     throw new Error('This page does not exist');
  // }

  const features = new APIFeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const tours = await features.query; // await extract the result of query

  // send response
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours
    }
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.id);
  if (!tour) {
    return next(new AppError(`no tour for this id: ${req.params.id}`, 404));
  }
  res.status(200).json({
    status: 'success',
    data: {
      tour
    }
  });
});

exports.createTour = catchAsync(async (req, res, next) => {
  const newTour = await Tour.create(req.body); // if req.body doesn't match the schema, an error will be thrown
  res.status(201).json({
    status: 'success',
    data: {
      tour: newTour
    }
  });
});

exports.updateTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true, // return the new document
    runValidators: true // validate against shcema
  });
  if (!tour) {
    return next(new AppError(`no tour for this id: ${req.params.id}`, 404));
  }
  res.status(200).json({
    status: 'success',
    data: {
      tour
    }
  });
});

exports.deleteTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndDelete(req.params.id);
  if (!tour) {
    return next(new AppError(`no tour for this id: ${req.params.id}`, 404));
  }
  res.status(204).json({
    status: 'success',
    data: null // no data sent back(RestFul Api)
  });
});

// aggregation: stages + operators
exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    { $match: { ratingsAverage: { $gte: 4.5 } } }, // $match: { <field1>: { <operator1>: <value1> }, ... }
    {
      // In the $group stage output, the _id field is set to the group key for that document.
      // The output documents can also contain additional fields that are set using accumulator expressions.
      $group: {
        _id: { $toUpper: '$difficulty' },
        numTours: { $sum: 1 }, // The "$count:{}" aggregation accumulator can be used in place of { $sum : 1 } in the $group stage.
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' }
      }
    },
    {
      $sort: { avgPrice: 1 }
    }
  ]);
  res.status(200).json({
    status: 'success',
    data: {
      stats
    }
  });
});

// group all the tours by each month of a specified year -> ubwind startDates
// get the total number of tours for each month + all the tour names for each month
// sort by number of tours in descending order
//  {
//     "id": 0,
//     "name": "The Forest Hiker",
//     "duration": 5,
//     "maxGroupSize": 25,
//     "difficulty": "easy",
//     "ratingsAverage": 4.7,
//     "ratingsQuantity": 37,
//     "price": 397,
//     "summary": "Breathtaking hike through the Canadian Banff National Park",
//     "description": "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.\nLorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
//     "imageCover": "tour-1-cover.jpg",
//     "images": ["tour-1-1.jpg", "tour-1-2.jpg", "tour-1-3.jpg"],
//     "startDates": ["2021-04-25,10:00", "2021-07-20,10:00", "2021-10-05,10:00"] -> unwind !
//   },
exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;
  const plan = await Tour.aggregate([
    { $unwind: '$startDates' }, // produce a separate document for each element in the array.
    {
      $match: {
        // constraint the year to the param year
        startDates: {
          $gte: new Date(`${year}-01-01`), // using date object to cmopare
          $lte: new Date(`${year}-12-31`)
        }
      }
    },
    {
      $group: {
        _id: { $month: '$startDates' }, // extrat the month of a date -> group by month
        numTourStarts: { $sum: 1 }, // count
        tours: { $push: '$name' } //
      }
    },
    {
      $addFields: { month: '$_id' } // replace _id with month
    },
    {
      $project: {
        // exclude _id
        _id: 0
      }
    },
    {
      $sort: { numTourStarts: -1 } // descending
    }
  ]);
  res.status(200).json({
    status: 'success',
    data: {
      plan
    }
  });
});
