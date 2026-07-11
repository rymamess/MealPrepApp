import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import authRouter from "./routes/auth.js";
import ingredientsRouter from "./routes/ingredients.js";
import mealsRouter from "./routes/meals.js";
import mealPlanRouter from "./routes/mealPlan.js";
import shoppingListItemsRouter from "./routes/shoppingListItems.js";
import userMealsRouter from "./routes/userMeals.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

app.use((req, res, next) => {
  console.log("Incoming request:", req.method, req.url);
  next();
});

app.get("/", (req, res) => {
  res.send("🍲 MealPrep API is running!");
});

app.use("/auth", authRouter);
app.use("/ingredients", ingredientsRouter);
app.use("/meals", mealsRouter);
app.use("/mealPlan", mealPlanRouter);
app.use("/shoppingListItems", shoppingListItemsRouter);
app.use("/userMeals", userMealsRouter);

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(PORT, () => console.log(`🍲 MealPrep API running on port ${PORT}`));
  })
  .catch(err => console.log(err));
