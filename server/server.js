import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import mealsRouter from "./routes/meals.js";
import userMealsRouter from "./routes/userMeals.js";

dotenv.config();

const app = express();

const allowedOrigins = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

app.use((req, res, next) => {
  console.log("Incoming request:", req.method, req.url);
  next();
});

app.get("/", (req, res) => {
  res.send("🍲 MealPrep API is running!");
});

app.use("/meals", mealsRouter);
app.use("/userMeals", userMealsRouter);

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(PORT, () => console.log(`🍲 MealPrep API running on port ${PORT}`));
  })
  .catch(err => console.log(err));
