import mongoose from 'mongoose';

// Define the RSVP Schema
const rsvpSchema = new mongoose.Schema({
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event', // Reference to the Event model
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the User model
    required: true
  },
  status: {
    type: String,
    enum: ['accepted', 'declined', 'pending'], // Possible RSVP statuses
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create the RSVP model
const RSVPModel = mongoose.model('RSVP', rsvpSchema);

export default RSVPModel;
