const mongoose = require('mongoose');
const slugify = require('slugify');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      maxlength: [40, 'A tour name must have less or equal then 40 characters'],
      minlength: [10, 'A tour name must have more or equal then 10 characters']
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration']
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size']
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either: easy, medium, difficult'
      }
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0']
    },
    ratingsQuantity: {
      type: Number,
      default: 0
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price']
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function(val) {
          return val < this.price;
        },
        message: 'Discount price ({VALUE}) should be below regular price' // {VALUE}
      }
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a description']
    },
    description: {
      type: String,
      trim: true
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image']
    },
    images: [String], // a list of strings
    createdAt: {
      type: Date,
      default: Date.now(), // note the date
      select: false // this field should not be included by default when querying the database.
    },
    startDates: [Date], // a list of dates
    secretTour: {
      type: Boolean,
      default: false
    }
  },
  {
    toJSON: { virtuals: true }, // to activate virtual property
    toObject: { virtuals: true }
  }
);

// virtual property: derived on the fly when documents being queried + not persisted
tourSchema.virtual('durationWeeks').get(function() {
  return this.duration / 7;
});

// DOCUMENT MIDDLEWARE: only runs before .save() and .create(), not including insertMany()
tourSchema.pre('save', function(next) {
  // before saving the document, we can still manipulate the current document
  this.slug = slugify(this.name, { lower: true });
  next();
});

// tourSchema.pre('save', function(next) {
//   console.log('Will save document...');
//   next();
// });

// tourSchema.post('save', function(doc, next) {
//   console.log(doc);
//   next();
// });

// QUERY MIDDLEWARE
// applies to all API starts with 'find', before all execution of query
tourSchema.pre(/^find/, function(next) {
  // 'this' points to the query object
  this.find({ secretTour: { $ne: true } }); // modify the query object to exclude secretTour
  // this.select('name duration'); will not work! because it needs to be called after the actual execution of query
  this.start = Date.now();
  next();
});
// after all execution of query
tourSchema.post(/^find/, function(docs, next) {
  //  'docs' is the documents we get from query, 'this' still points to the query object
  console.log(`Query took ${Date.now() - this.start} milliseconds!`);
  next();
});

// AGGREGATION MIDDLEWARE
tourSchema.pre('aggregate', function(next) {
  // 'this.pipeline()' returns the pipeline array, we can use unshift/shift to add stages
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } }); // 'this' points to the current aggregation object
  next();
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
