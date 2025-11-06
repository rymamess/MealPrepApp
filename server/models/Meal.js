import mongoose from "mongoose";

export const IngredientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  quantity: { type: String, required: true }
});

export const MealBaseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  photo: { type: String },
  category: { type: String, enum: ['Breakfast','Snack','Lunch','Dinner','Dessert'], required: true },
  prepTime: { type: Number },
  cookTime: { type: Number },
  difficulty: { type: String, enum: ['Easy','Medium','Hard'] },
  portions: { type: Number },
  ingredients: [IngredientSchema],
  spices: [IngredientSchema],
  description: { type: String },
});

export default mongoose.model("Meal", MealBaseSchema);
