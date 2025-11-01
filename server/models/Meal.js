import mongoose from "mongoose";

export const IngredientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  quantity: { type: String, required: true }
});

export const MealBaseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  photo: { type: String },
  category: { type: String, enum: ['breakfast','snack','lunch','dinner','dessert'], required: true },
  prepTime: { type: Number },
  cookTime: { type: Number },
  difficulty: { type: String, enum: ['easy','medium','hard'] },
  portions: { type: Number },
  ingredients: [IngredientSchema],
  spices: [IngredientSchema],
  description: { type: String },
});

export default mongoose.model("Meal", MealBaseSchema);
