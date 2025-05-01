const Registration = require('../models/Registration');
const Event = require('../models/Event');
const User = require('../models/User');


const checkInUser = async (req, res) => {
  try {
    const { qrData } = req.body;
    
    if (!qrData) {
      return res.status(400).json({ message: 'QR data is required' });
    }
    
    
    let parsedData;
    try {
      parsedData = JSON.parse(qrData);
    } catch (e) {
      return res.status(400).json({ message: 'Invalid QR code format' });
    }
    
    const { userId, eventId, registrationId } = parsedData;
    
    if (!userId || !eventId || !registrationId) {
      return res.status(400).json({ message: 'Invalid QR code data' });
    }
    
    
    const registration = await Registration.findOne({
      user: userId,
      event: eventId,
      qrCode: registrationId
    }).populate('user', 'name email studentId')
      .populate('event', 'title date time');
    
    if (!registration) {
      return res.status(404).json({ message: 'Registration not found' });
    }
    
   
    if (registration.checkedIn) {
      return res.status(400).json({ 
        message: 'Already checked in',
        checkinTime: registration.checkinTime,
        user: registration.user,
        event: registration.event
      });
    }
    
    
    registration.checkedIn = true;
    registration.checkinTime = new Date();
    await registration.save();
    
    res.json({
      message: 'Check-in successful',
      user: registration.user,
      event: registration.event,
      checkinTime: registration.checkinTime
    });
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};


const getEventCheckins = async (req, res) => {
  try {
    const eventId = req.params.id;
    
    // Verify event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Get registrations count
    const totalRegistrations = await Registration.countDocuments({ event: eventId });
    
    // Get checked-in count
    const checkedInCount = await Registration.countDocuments({ 
      event: eventId,
      checkedIn: true
    });
    
    // Get list of attendees
    const attendees = await Registration.find({ event: eventId })
      .populate('user', 'name email studentId')
      .select('checkedIn checkinTime');
    
    res.json({
      event: {
        _id: event._id,
        title: event.title,
        date: event.date,
        time: event.time
      },
      stats: {
        totalRegistrations,
        checkedInCount,
        attendanceRate: totalRegistrations > 0 ? 
          (checkedInCount / totalRegistrations * 100).toFixed(2) + '%' : '0%'
      },
      attendees
    });
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};


const exportAttendees = async (req, res) => {
  try {
    const eventId = req.params.id;
    const format = req.query.format || 'json'; // Default to JSON
    
    // Verify event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Get all registrations for the event
    const registrations = await Registration.find({ event: eventId })
      .populate('user', 'name email studentId')
      .sort({ checkinTime: -1 });
    
    // Transform data
    const attendeeData = registrations.map(reg => ({
      name: reg.user.name,
      email: reg.user.email,
      studentId: reg.user.studentId,
      registered: reg.registrationDate.toISOString(),
      checkedIn: reg.checkedIn,
      checkinTime: reg.checkinTime ? reg.checkinTime.toISOString() : null
    }));
    
    if (format.toLowerCase() === 'csv') {
      // Generate CSV
      const csvHeader = 'Name,Email,Student ID,Registered,Checked In,Check-in Time\n';
      const csvRows = attendeeData.map(attendee => 
        `${attendee.name},${attendee.email},${attendee.studentId},${attendee.registered},${attendee.checkedIn},${attendee.checkinTime || ''}`
      ).join('\n');
      
      const csvContent = csvHeader + csvRows;
      
      // Set headers for file download
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="attendees-${event.title}-${Date.now()}.csv"`);
      
      return res.send(csvContent);
    }
    
    // Default: Return JSON
    res.json({
      event: {
        _id: event._id,
        title: event.title,
        date: event.date,
        time: event.time
      },
      exportDate: new Date().toISOString(),
      totalCount: attendeeData.length,
      attendees: attendeeData
    });
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { checkInUser, getEventCheckins, exportAttendees };