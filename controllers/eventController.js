const Event = require('../models/Event');
const Registration = require('../models/Registration');
const { validationResult } = require('express-validator');
const qrGenerator = require('../utils/qrGenerator');
const emailService = require('../utils/emailService');
const { v4: uuidv4 } = require('uuid');


const createEvent = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { title, description, location, date, time } = req.body;

  try {
    const event = new Event({
      title,
      description,
      location,
      date,
      time,
      createdBy: req.user._id
    });

    const createdEvent = await event.save();
    res.status(201).json(createdEvent);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};


const getEvents = async (req, res) => {
  try {
    const events = await Event.find({}).sort({ date: 1 });
    res.json(events);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};


const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (event) {
      res.json(event);
    } else {
      res.status(404).json({ message: 'Event not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};


const registerForEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    
    const existingRegistration = await Registration.findOne({
      event: event._id,
      user: req.user._id
    });

    if (existingRegistration) {
      return res.status(400).json({ 
        message: 'Already registered for this event',
        qrCode: existingRegistration.qrCode
      });
    }

    
    const uniqueId = uuidv4();
    
    
    const qrData = JSON.stringify({
      userId: req.user._id,
      eventId: event._id,
      registrationId: uniqueId
    });
    
    
    const qrCodeImage = await qrGenerator.generateQR(qrData);
    
   
    const registration = new Registration({
      event: event._id,
      user: req.user._id,
      qrCode: uniqueId
    });

    const savedRegistration = await registration.save();
    
    
    await emailService.sendRegistrationEmail(
      req.user.email,
      req.user.name,
      event.title,
      event.date,
      event.time,
      event.location,
      qrCodeImage
    );
    
    res.status(201).json({
      message: 'Successfully registered for event',
      registration: savedRegistration,
      qrCodeImage
    });
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { createEvent, getEvents, getEventById, registerForEvent };