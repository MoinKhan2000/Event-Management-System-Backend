import express from 'express';
const app = express();

// Middleware to parse JSON request bodies
app.use(express.json());

// Middleware to parse URL query parameters
app.use(express.query());

// Middleware to handle CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});


// Centralized Error Handling Middleware
app.use((err, req, res, next) => {
  // Check if the error is an instance of ApplicationErrorHandler
  if (err instanceof ApplicationErrorHandler) {
    // Send a structured error response
    return res.status(err.code).json({
      success: false,
      message: err.message,
    });
  }

  // Handle any other unexpected errors
  return res.status(500).json({
    success: false,
    message: 'An unexpected error occurred!',
  });
});

export default app;
