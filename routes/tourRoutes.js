const express = require('express');
const tourController = require('./../controllers/tourController');

const router = express.Router(); // create the route

// router.param('id', tourController.checkID); // param middleware, applies when one parameter matches

// create alias -> use a handler to prefill query
router
  .route('/top-5-cheap')
  .get(tourController.aliasTopTours, tourController.getAllTours); // chaining handlers

// aggregation
router.route('/tour-stats').get(tourController.getTourStats);
router.route('/monthly-plan/:year').get(tourController.getMonthlyPlan);

router
  .route('/') // relative to the root route in app.js
  .get(tourController.getAllTours)
  .post(tourController.createTour);

router
  .route('/:id') // relative to the root route in app.js; use req.param.id to get id
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);

module.exports = router;
