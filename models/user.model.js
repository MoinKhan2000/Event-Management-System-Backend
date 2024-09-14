import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

// Define the schema
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please enter your name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please enter your email'],
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: [true, 'Please enter a password'],
    minlength: [4, 'Password must be at least 6 characters long']
  },
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user'
  }
}, { timestamps: true });

// Pre-save middleware to hash the password before saving
userSchema.pre('save', async function (next) {
  // Check if the password field is being modified
  if (!this.isModified('password')) {
    return next(); // Skip hashing if the password isn't modified
  }

  // Generate a salt and hash the password
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Pre-update middleware to hash the password before updating (useful for password updates)
userSchema.pre('findOneAndUpdate', async function (next) {
  const update = this.getUpdate();

  // Check if the password field is being updated
  if (update.password) {
    const salt = await bcrypt.genSalt(10);
    update.password = await bcrypt.hash(update.password, salt);
  }

  next();
});

// Method to compare the entered password with the stored hashed password
userSchema.methods.isPasswordMatched = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Create and export the User model
const User = mongoose.model('User', userSchema);
module.exports = User;
