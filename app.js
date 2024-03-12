const express = require('express');
const morgan = require('morgan');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

// 1) Global MIDDLEWARES
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json());
app.use(express.static(`${__dirname}/public`));

// app.use((req, res, next) => {
//   // apply to all requests, note the typical callback parameters list
//   console.log('Hello from the middleware 👋');
//   next();
// });

app.use((req, res, next) => {
  // apply to all requests
  req.requestTime = new Date().toISOString();
  next();
});

// 3) ROUTES
app.use('/api/v1/tours', tourRouter); // specify the root route for each router
app.use('/api/v1/users', userRouter);

module.exports = app;
