import express from 'express';
import EventController from '../controllers/event.controller.js';
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
  body('location').isLength({ min: 3, max: 200 }).withMessage('Location must be between 3 and 200 characters long')
];

const updateEventValidationRules = [
  body('title').optional().isLength({ min: 3, max: 100 }).withMessage('Title must be between 3 and 100 characters long'),
  body('description').optional().isLength({ min: 5, max: 500 }).withMessage('Description must be between 5 and 500 characters long'),
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
eventRouter.post('/', jwtAuth, uploadMiddleware, createEventValidationRules, validate, async (req, res, next) => {
  try {
    const eventData = req.body;
    console.log("eventData-> ", eventData);
    if (req.file) {
      eventData.imageUrl = req.imageUrl;
    }
    const userId = req.userId
    eventData.createdBy = userId;
    const event = await eventController.createEvent(eventData);
    res.status(201).json({ success: true, event });
  } catch (error) {
    next(error);
  }
});

// Route to get a list of events
eventRouter.get('/', async (req, res, next) => {
  try {
    const events = await eventController.listEvents();
    res.status(200).json({ success: true, events });
  } catch (error) {
    next(error);
  }
});

// Route to get a single event by ID
eventRouter.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const event = await eventController.getEventById(id);
    res.status(200).json({ success: true, event });
  } catch (error) {
    next(error);
  }
});

// Route to update an event by ID
eventRouter.put('/:id', jwtAuth, uploadMiddleware, updateEventValidationRules, validate, async (req, res, next) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;
    if (req.file) {
      updatedData.imageUrl = req.imageUrl;
    }
    const event = await eventController.updateEvent(id, updatedData);
    res.status(200).json({ success: true, event });
  } catch (error) {
    next(error);
  }
});

// Route to delete an event by ID
eventRouter.delete('/:id', jwtAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await eventController.deleteEvent(id);
    console.log(result);

    res.status(200).json({ success: true, message: 'Event deleted', event: result });
  } catch (error) {
    next(error);
  }
});

// Route to RSVP to an event
eventRouter.post('/:id/rsvp', jwtAuth, async (req, res, next) => {
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
eventRouter.get('/:id/attendees', jwtAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const attendees = await eventController.getEventAttendees(id);
    res.status(200).json({ success: true, attendees });
  } catch (error) {
    next(error);
  }
});

// Route to send a reminder for an event
eventRouter.post('/:id/reminder', jwtAuth, async (req, res, next) => {
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
eventRouter.post('/:id/notify', jwtAuth, async (req, res, next) => {
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
