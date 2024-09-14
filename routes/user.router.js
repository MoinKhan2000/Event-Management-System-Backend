import express from 'express';
import { body, validationResult } from 'express-validator';
import UserController from '../controllers/user.controller.js';
import ApplicationErrorHandler from '../utils/errorHandler.js';

const userRouter = express.Router();
let userController = new UserController();

// Validation rules for signup
const signupValidationRules = [
  body('name')
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters long'),
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 5 })
    .withMessage('Password must be at least 5 characters long')
];

// Validation rules for signin
const signinValidationRules = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// Validation rules for changing password
const changePasswordValidationRules = [
  body('userId')
    .notEmpty()
    .withMessage('User ID is required'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters long')
];

// Middleware to handle validation results
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => error.msg);
    return next(new ApplicationErrorHandler(errorMessages.join(', '), 400)); // 400 Bad Request
  }
  next();
};

// Route: Sign-up with validation
userRouter.post('/signup', signupValidationRules, validate, (req, res, next) => {
  userController.signUp(req, res, next);
});

// Route: Sign-in with validation
userRouter.post('/signin', signinValidationRules, validate, (req, res, next) => {
  userController.signIn(req, res, next);
});

// Route: Log out from specific device
userRouter.post('/logout', (req, res, next) => {
  userController.logOut(req, res, next);
});

// Route: Log out from all devices
userRouter.post('/logout-all', (req, res, next) => {
  userController.logOutFromAllDevices(req, res, next);
});

// Route: Change user password with validation
userRouter.post('/change-password', changePasswordValidationRules, validate, (req, res, next) => {
  userController.changePassword(req, res, next);
});

// Route: Get user by ID
userRouter.get('/user/:userId', (req, res, next) => {
  userController.findUserById(req, res, next);
});

// Route: Get all users (admin-level feature, can be secured with middleware)
userRouter.get('/users', (req, res, next) => {
  userController.getAllUsers(req, res, next);
});

export default userRouter;
