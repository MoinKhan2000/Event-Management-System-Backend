import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import UserModel from '../models/user.model.js';
import ApplicationErrorHandler from '../utils/errorHandler.js';
const SECRET_KEY = process.env.SECRET_KEY || 'SECRET_KEY';

export default class UserController {

  // User sign-in
  async signIn(req, res, next) {
    try {
      const { email, password } = req.body;

      // Find the user by email
      const user = await UserModel.findOne({ email });

      if (!user) throw new ApplicationErrorHandler('User not found', 404);

      // Compare the entered password with the stored password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) throw new ApplicationErrorHandler('Password does not match', 400);

      // Generate a JWT token for authentication
      const token = jwt.sign({ userId: user._id, email: user.email }, SECRET_KEY);

      // Exclude the password from the response
      user.password = undefined;

      // Send response
      res.status(200).json({ success: true, token, user });
    } catch (error) {
      next(error);
    }
  }

  // User sign-up
  async signUp(req, res, next) {
    try {
      const { name, email, password, role } = req.body;

      // Check if a user with the same email already exists
      const existingUser = await UserModel.findOne({ email });
      if (existingUser) {
        throw new ApplicationErrorHandler('User with this email already exists', 409);
      }

      // Hash the password before saving
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create a new user with optional role
      const newUserData = {
        name,
        email,
        password: hashedPassword,
        ...(role && { role }),
      };

      const newUser = new UserModel(newUserData);
      const createdUser = await newUser.save();

      // Exclude the password from the response
      createdUser.password = undefined;

      // Send response
      res.status(201).json({ success: true, user: createdUser });
    } catch (error) {
      if (error instanceof ApplicationErrorHandler) {
        next(error);
      } else {
        next(new ApplicationErrorHandler(error.message || "Internal Server Error", 500));
      }
    }
  }

  // User log-out from specific device
  async logOut(req, res, next) {
    try {
      const { userId, token } = req.body;

      // Find the user and remove the token from the tokens array
      const result = await UserModel.findByIdAndUpdate(userId, {
        $pull: { tokens: { token } }
      }, { new: true });

      if (!result) throw new ApplicationErrorHandler('User not found', 404);

      res.status(200).json({ success: true, message: 'Logged out successfully' });
    } catch (error) {
      next(error);
    }
  }

  // User log-out from all devices
  async logOutFromAllDevices(req, res, next) {
    try {
      const { userId } = req.body;

      // Find the user and clear all tokens
      const result = await UserModel.findByIdAndUpdate(userId, { $set: { tokens: [] } }, { new: true });

      if (!result) throw new ApplicationErrorHandler('User not found', 404);

      res.status(200).json({ success: true, message: 'Logged out from all devices' });
    } catch (error) {
      next(error);
    }
  }

  // Find a user by email
  async findByEmail(req, res, next) {
    try {
      const { email } = req.body;

      // Find the user by email
      const user = await UserModel.findOne({ email });

      if (!user) throw new ApplicationErrorHandler('User not found', 404);

      // Exclude sensitive information
      user.password = undefined;
      user.tokens = undefined;

      res.status(200).json({ success: true, user });
    } catch (error) {
      next(error);
    }
  }

  // Change password
  async changePassword(req, res, next) {
    try {
      const { userId, newPassword } = req.body;

      // Find the user by ID
      const user = await UserModel.findById(userId);
      if (!user) throw new ApplicationErrorHandler('User not found', 404);

      // Hash the new password and save
      user.password = await bcrypt.hash(newPassword, 12);
      await user.save();

      res.status(200).json({ success: true, message: 'Password updated successfully' });
    } catch (error) {
      next(error);
    }
  }

  // Update user details (except password)
  async updateDetails(req, res, next) {
    try {
      const { userId } = req.body;
      const { password, ...updatedDetails } = req.body; // Exclude password from being updated here

      // Find the user and update the details
      const user = await UserModel.findByIdAndUpdate(
        userId,
        { $set: updatedDetails },
        { new: true, runValidators: true }
      );

      if (!user) throw new ApplicationErrorHandler('User not found', 404);

      // Exclude password from response
      user.password = undefined;

      res.status(200).json({ success: true, user });
    } catch (error) {
      next(error);
    }
  }

  // Find user by ID
  async findUserById(req, res, next) {
    try {
      const { userId } = req.params;

      // Find user by ID
      const user = await UserModel.findById(userId);
      if (!user) throw new ApplicationErrorHandler('User not found', 404);

      // Exclude sensitive fields
      user.password = undefined;
      user.tokens = undefined;

      res.status(200).json({ success: true, user });
    } catch (error) {
      next(error);
    }
  }

  // Get all users
  async getAllUsers(req, res, next) {
    try {
      // Get all users excluding the password and tokens fields
      const users = await UserModel.find({}, '-password -tokens');

      res.status(200).json({ success: true, users });
    } catch (error) {
      next(error);
    }
  }
}
