import mongoose from "mongoose";

// Catégorie d'ingrédient définie par l'utilisateur, en plus des INGREDIENT_CATEGORIES
// fixes du catalogue partagé. Utilisée uniquement pour organiser sa propre liste de
// courses (voir UserIngredientPreference), jamais écrite dans Ingredient.js.
const UserCategorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true, trim: true },
  color: { type: String, required: true },
  icon: { type: String, required: true },
});

UserCategorySchema.index({ userId: 1, name: 1 }, { unique: true });

export default mongoose.model("UserCategory", UserCategorySchema, "userCategories");
