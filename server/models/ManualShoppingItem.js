import mongoose from "mongoose";
import { INGREDIENT_CATEGORIES } from "./Ingredient.js";
import { UNITS } from "./Meal.js";

const ManualShoppingItemSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true, trim: true },
  category: { type: String, enum: INGREDIENT_CATEGORIES, required: true },
  quantity: { type: Number, required: true, min: 0 },
  unit: { type: String, enum: UNITS, required: true },
  periodStart: { type: Date, required: true },
  periodEnd: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
});

ManualShoppingItemSchema.index({ userId: 1, periodStart: 1 });

export default mongoose.model("ManualShoppingItem", ManualShoppingItemSchema, "manualShoppingItems");
