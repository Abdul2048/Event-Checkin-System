const mongoose = require('mongoose');

const RegistrationSchema = new mongoose.Schema({
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  qrCode: {
    type: String,
    required: true,
    unique: true
  },
  registrationDate: {
    type: Date,
    default: Date.now
  },
  checkedIn: {
    type: Boolean,
    default: false
  },
  checkinTime: {
    type: Date,
    default: null
  }
});


RegistrationSchema.index({ event: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('Registration', RegistrationSchema);