import multer from 'multer';
import cloudinary from 'cloudinary';
import ApplicationErrorHandler from '../utils/errorHandler.js'; // Adjust the path as necessary

// Configure Cloudinary
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Set up multer for file upload handling
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Image upload function using Cloudinary
const uploadImage = async (file) => {
  try {
    // Upload the image to Cloudinary and return a promise
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.v2.uploader.upload_stream(
        { folder: 'event_management' },
        (error, result) => {
          if (error) {
            return reject(new ApplicationErrorHandler('Image upload failed', 500));
          }
          resolve(result);
        }
      );
      stream.end(file.buffer);
    });

    // Return the URL of the uploaded image
    return result.secure_url;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new ApplicationErrorHandler('Image upload failed', 500);
  }
};

// Middleware to handle image uploads
export const uploadMiddleware = (req, res, next) => {
  upload.single('image')(req, res, async (err) => {
    if (err) {
      return next(new ApplicationErrorHandler('Image upload failed', 400));
    }
    try {
      if (req.file) {
        // Upload the image to Cloudinary
        const imageUrl = await uploadImage(req.file);
        req.imageUrl = imageUrl;
      }
      next();
    } catch (error) {
      next(error); // Pass any errors to the error-handling middleware
    }
  });
};

export default uploadMiddleware;
