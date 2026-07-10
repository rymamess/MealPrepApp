import mongoose from "mongoose";
import { INGREDIENT_CATEGORIES } from "./Ingredient.js";

const UserIngredientSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true, trim: true },
  category: { type: String, enum: INGREDIENT_CATEGORIES, required: true },
});

UserIngredientSchema.index({ userId: 1, name: 1 }, { unique: true });

export default mongoose.model("UserIngredient", UserIngredientSchema, "userIngredients");
