import express from 'express';
import EventController from '../controllers/event.controller.js'
import { body, validationResult } from 'express-validator';
import ApplicationErrorHandler from '../utils/errorHandler.js';
import uploadMiddleware from '../middlewares/uploadimage.middleware.js';
import jwtAuth from '../middlewares/jwtAuth.middleware.js';

const eventRouter = express.Router();
const eventController = new EventController();

// Validation rules for creating and updating events
const createEventValidationRules = [
  body('title').isLength({ min: 3, max: 100 }).withMessage('Title must be between 3 and 100 characters long'),
  body('description').isLength({ min: 5, max: 500 }).withMessage('Description must be between 5 and 500 characters long'),
  body('date').isISO8601().withMessage('Invalid date format'),
  body('location').isLength({ min: 3, max: 200 }).withMessage('Location must be between 3 and 200 characters long')
];

const updateEventValidationRules = [
  body('title').optional().isLength({ min: 3, max: 100 }).withMessage('Title must be between 3 and 100 characters long'),
  body('description').optional().isLength({ min: 5, max: 500 }).withMessage('Description must be between 5 and 500 characters long'),
  body('date').optional().isISO8601().withMessage('Invalid date format'),
  body('location').optional().isLength({ min: 3, max: 200 }).withMessage('Location must be between 3 and 200 characters long')
];

// Middleware to handle validation results
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => error.msg);
    return next(new ApplicationErrorHandler(errorMessages.join(', '), 400));
  }
  next();
};

// Route to create an event
eventRouter.post('/events', jwtAuth, createEventValidationRules, validate, uploadMiddleware, async (req, res, next) => {
  try {
    const eventData = req.body;
    if (req.file) {
      eventData.imageUrl = req.imageUrl;
    }
    const event = await eventController.createEvent(eventData);
    res.status(201).json({ success: true, event });
  } catch (error) {
    next(error);
  }
});

// Route to get a list of events
eventRouter.get('/events', async (req, res, next) => {
  try {
    const events = await eventController.listEvents();
    res.status(200).json({ success: true, events });
  } catch (error) {
    next(error);
  }
});

// Route to get a single event by ID
eventRouter.get('/events/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const event = await eventController.getEventById(id);
    res.status(200).json({ success: true, event });
  } catch (error) {
    next(error);
  }
});

// Route to update an event by ID
eventRouter.put('/events/:id', jwtAuth, updateEventValidationRules, validate, uploadMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;
    if (req.file) {
      updatedData.imageUrl = req.imageUrl; // Assuming uploadMiddleware is used to attach imageUrl
    }
    const event = await eventController.updateEvent(id, updatedData);
    res.status(200).json({ success: true, event });
  } catch (error) {
    next(error);
  }
});

// Route to delete an event by ID
eventRouter.delete('/events/:id', jwtAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    await eventController.deleteEvent(id);
    res.status(204).json({ success: true, message: 'Event deleted' });
  } catch (error) {
    next(error);
  }
});

// Route to RSVP to an event
eventRouter.post('/events/:id/rsvp', jwtAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    const rsvp = await eventController.rsvpToEvent(id, userId);
    res.status(200).json({ success: true, rsvp });
  } catch (error) {
    next(error);
  }
});

// Route to manage attendees of an event
eventRouter.get('/events/:id/attendees', jwtAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const attendees = await eventController.getEventAttendees(id);
    res.status(200).json({ success: true, attendees });
  } catch (error) {
    next(error);
  }
});

// Route to send a reminder for an event
eventRouter.post('/events/:id/reminder', jwtAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reminderMessage } = req.body;
    await eventController.sendReminder(id, reminderMessage);
    res.status(200).json({ success: true, message: 'Reminder sent' });
  } catch (error) {
    next(error);
  }
});

// Route to send in-app notification (Good to have)
eventRouter.post('/events/:id/notify', jwtAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { notificationMessage } = req.body;
    await eventController.sendInAppNotification(id, notificationMessage);
    res.status(200).json({ success: true, message: 'Notification sent' });
  } catch (error) {
    next(error);
  }
});

// Route to track user activity (Good to have)
eventRouter.get('/users/:id/activity', jwtAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const activity = await eventController.getUserActivity(id);
    res.status(200).json({ success: true, activity });
  } catch (error) {
    next(error);
  }
});

export default eventRouter;
