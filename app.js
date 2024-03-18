const express = require('express');
const morgan = require('morgan');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

// 1) Global MIDDLEWARES
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json());
app.use(express.static(`${__dirname}/public`));

app.use((req, res, next) => {
  // apply to all requests
  req.requestTime = new Date().toISOString();
  next();
});

// 2) ROUTES
app.use('/api/v1/tours', tourRouter); // specify the root route for each router
app.use('/api/v1/users', userRouter);

// 3) Fallback ROUTES: if the middleware reaches here -> no routes matches the req.originalUrl
// app.all -> catch all actions
app.all('*', (req, res, next) => {
  // whenever we pass anything to next(), express will view it as an error -> skip all other middleware -> go straight to the centralized error handling middleware
  next(new AppError(`no resource for ${req.originalUrl}`));
});

// centralized error handling: identified by the 4 arguments
app.use(globalErrorHandler);

module.exports = app;
