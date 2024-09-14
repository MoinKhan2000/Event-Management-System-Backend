import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  location: String,
  imageUrl: String,
  startTime: { type: Date, required: true },
  endTime: Date,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

const EventModel = new mongoose.model('Event', eventSchema);
export default EventModel;
