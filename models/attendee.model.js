import mongoose from 'mongoose';

// Define the Attendee Schema
const attendeeSchema = new mongoose.Schema({
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['attended', 'absent'],
    default: 'attended'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const AttendeeModel = mongoose.model('Attendee', attendeeSchema);

export default AttendeeModel;
