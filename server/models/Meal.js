import mongoose from "mongoose";
import { INGREDIENT_CATEGORIES } from "./Ingredient.js";

export const UNITS = ['g', 'kg', 'ml', 'l', 'unité', 'c. à soupe', 'c. à café', 'pincée', 'tasse', 'au goût'];

export const IngredientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  quantity: { type: Number, required: true, min: 0 },
  unit: { type: String, enum: UNITS, required: true },
  category: { type: String, enum: INGREDIENT_CATEGORIES },
});

export const MealBaseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  photo: { type: String },
  category: { type: String, enum: ['Breakfast','Snack','Lunch','Dinner','Dessert'], required: true },
  prepTime: { type: Number },
  cookTime: { type: Number },
  difficulty: { type: String, enum: ['Easy','Medium','Hard'] },
  servings: { type: Number },
  ingredients: [IngredientSchema],
  spices: [IngredientSchema],
  description: { type: String },
});

export default mongoose.model("Meal", MealBaseSchema);
