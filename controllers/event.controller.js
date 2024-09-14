import ApplicationErrorHandler from '../utils/errorHandler.js';
import nodemailer from 'nodemailer';
import InAppNotification from '../models/inAppNotification.model.js';
import EventModel from '../models/event.model.js';
import RSVPModel from "../models/rsvp.model.js"
import AttendeeModel from '../models/attendee.model.js';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

class EventController {
  // Create a new event
  async createEvent(eventData) {
    try {
      const event = new EventModel(eventData);
      await event.save();
      return event;
    } catch (error) {
      throw new ApplicationErrorHandler('Error creating event', 500);
    }
  }

  // List all events
  async listEvents() {
    try {
      const events = await EventModel.find().populate('attendees');
      return events;
    } catch (error) {
      throw new ApplicationErrorHandler('Error listing events', 500);
    }
  }

  // Get a single event by ID
  async getEventById(id) {
    try {
      const event = await EventModel.findById(id).populate('attendees');
      if (!event) throw new ApplicationErrorHandler('Event not found', 404);
      return event;
    } catch (error) {
      throw new ApplicationErrorHandler('Error getting event by ID', 500);
    }
  }

  // Update an event by ID
  async updateEvent(id, updatedData) {
    try {
      const event = await EventModel.findByIdAndUpdate(id, updatedData, { new: true, runValidators: true });
      if (!event) throw new ApplicationErrorHandler('Event not found', 404);
      return event;
    } catch (error) {
      throw new ApplicationErrorHandler('Error updating event', 500);
    }
  }

  // Delete an event by ID
  async deleteEvent(id) {
    try {
      const result = await EventModel.findByIdAndDelete(id);
      if (!result) throw new ApplicationErrorHandler('Event not found', 404);
      return result;
    } catch (error) {
      throw new ApplicationErrorHandler('Error deleting event', 500);
    }
  }

  // RSVP to an event
  async rsvpToEvent(eventId, userId) {
    try {
      const rsvp = new RsvpModel({ event: eventId, user: userId });
      await rsvp.save();
      return rsvp;
    } catch (error) {
      throw new ApplicationErrorHandler('Error RSVPing to event', 500);
    }
  }

  // Get attendees for an event
  async getEventAttendees(eventId) {
    try {
      const rsvps = await RsvpModel.find({ event: eventId }).populate('user');
      const attendees = rsvps.map(rsvp => rsvp.user);
      return attendees;
    } catch (error) {
      throw new ApplicationErrorHandler('Error getting event attendees', 500);
    }
  }

  // Send a reminder for an event
  async sendReminder(eventId, reminderMessage) {
    try {
      const event = await EventModel.findById(eventId);
      if (!event) throw new ApplicationErrorHandler('Event not found', 404);

      // Retrieve all RSVPs and send reminder email to attendees
      const rsvps = await RsvpModel.find({ event: eventId }).populate('user');
      const emailPromises = rsvps.map(rsvp => {
        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: rsvp.user.email,
          subject: `Reminder for ${event.title}`,
          text: reminderMessage
        };
        return transporter.sendMail(mailOptions);
      });

      await Promise.all(emailPromises);
      return { message: 'Reminders sent successfully' };
    } catch (error) {
      throw new ApplicationErrorHandler('Error sending reminder', 500);
    }
  }

  // Send an in-app notification (Good to have)
  async sendInAppNotification(eventId, notificationMessage) {
    try {
      const event = await EventModel.findById(eventId);
      if (!event) throw new ApplicationErrorHandler('Event not found', 404);

      // Create and save notification
      const notification = new InAppNotification({
        event: eventId,
        message: notificationMessage,
        createdAt: new Date()
      });
      await notification.save();

      // Optionally, notify users through the app (e.g., WebSocket, push notifications)
      return { message: 'In-app notification sent successfully' };
    } catch (error) {
      throw new ApplicationErrorHandler('Error sending in-app notification', 500);
    }
  }

  // Track user activity (Good to have)
  async getUserActivity(userId) {
    try {
      // Example: Get user's activities related to events
      const activities = await RsvpModel.find({ user: userId }).populate('event');
      return activities;
    } catch (error) {
      throw new ApplicationErrorHandler('Error getting user activity', 500);
    }
  }
}

export default EventController;
