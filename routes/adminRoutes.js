const express = require('express');
const { protect } = require('../middleware/auth');
const { isAdmin } = require('../middleware/roles');
const { checkInUser, getEventCheckins, exportAttendees } = require('../controllers/checkinController');

const router = express.Router();


router.post('/checkin', [protect, isAdmin], checkInUser);
router.get('/events/:id/checkins', [protect, isAdmin], getEventCheckins);
router.get('/events/:id/export', [protect, isAdmin], exportAttendees);

module.exports = router;