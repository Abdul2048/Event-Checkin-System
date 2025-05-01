const express = require('express');
const { check } = require('express-validator');
const { protect } = require('../middleware/auth');
const { isAdmin } = require('../middleware/roles');
const { 
  createEvent, 
  getEvents, 
  getEventById, 
  registerForEvent 
} = require('../controllers/eventController');

const router = express.Router();


router.get('/', getEvents);


router.get('/:id', getEventById);


router.post(
  '/',
  [
    protect,
    isAdmin,
    [
      check('title', 'Title is required').not().isEmpty(),
      check('description', 'Description is required').not().isEmpty(),
      check('location', 'Location is required').not().isEmpty(),
      check('date', 'Valid date is required').isISO8601(),
      check('time', 'Time is required').not().isEmpty()
    ]
  ],
  createEvent
);


router.post('/:id/register', protect, registerForEvent);

module.exports = router;