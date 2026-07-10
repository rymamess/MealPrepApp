import mongoose from "mongoose";

export const INGREDIENT_CATEGORIES = [
  "Meat",
  "Seafood",
  "Dairy",
  "Vegetables",
  "Fruits",
  "Grains",
  "Spices",
  "Condiments",
  "Other",
];

const IngredientCatalogSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  category: { type: String, enum: INGREDIENT_CATEGORIES, required: true },
});

export default mongoose.model("Ingredient", IngredientCatalogSchema, "ingredients");
