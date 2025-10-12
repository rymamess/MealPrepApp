import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import mealsRouter from "./routes/meals.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("🍲 MealPrep API is running!");
});

app.use("/meals", mealsRouter);

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(PORT, () => console.log(`🍲 MealPrep API running on port ${PORT}`));
  })
  .catch(err => console.log(err));
