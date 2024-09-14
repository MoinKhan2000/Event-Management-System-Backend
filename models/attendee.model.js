const attendeeSchema = new mongoose.Schema({
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rsvpStatus: { type: String, enum: ['Yes', 'No', 'Maybe'], required: true }
}, { timestamps: true });

// module.exports = mongoose.model('Attendee', attendeeSchema);

