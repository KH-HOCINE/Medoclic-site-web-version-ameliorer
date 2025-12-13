// backend/database/dbConnection.js
import mongoose from "mongoose"; // <<< UNE SEULE FOIS

export const dbConnection = () => {
  mongoose
    .connect(process.env.MONGO_URI, {
      dbName: "MERN_STACK_HOSPITAL_MANAGEMENT_SYSTEM",
    })
    .then(() => {
      console.log("Connected to database!");
    })
    .catch((err) => {
      console.log(`Some Error occured while connecting to database: ${err}`);
    });
};