import mongoose from "mongoose";
const url = process.env.DB_URL;

export const connectToDB = async () => {
  try {
    await mongoose.connect(url, {});
    console.log(`Connected to MongoDB - ${url}`);
  } catch (error) {
    console.log('Error connecting to the database:', error);
  }
};

