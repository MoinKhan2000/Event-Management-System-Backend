import './config/env.js'
import app from "./app.js";
import { connectToDB } from './config/connectToDB.js';

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectToDB();
})