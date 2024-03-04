const express = require('express');
const tourController = require('./../controllers/tourController');

const router = express.Router(); // create the route

router.param('id', tourController.checkID); // param middleware, applies when one parameter matches

router
  .route('/')  // relative to the root route in app.js
  .get(tourController.getAllTours)
  .post(tourController.checkBody, tourController.createTour); // chain middleware handler

router
  .route('/:id')  // relative to the root route in app.js
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);

module.exports = router;
