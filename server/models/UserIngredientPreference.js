import mongoose from "mongoose";

// Override par ingrédient précis (identifié par son nom, comme dans l'agrégation de la
// liste de courses — server/utils/shoppingList.js — qui ne référence jamais l'_id du
// catalogue). `ingredientNameLower` sert uniquement au matching/index insensible à la
// casse ; `ingredientName` garde la casse d'origine pour l'affichage.
const UserIngredientPreferenceSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  ingredientName: { type: String, required: true, trim: true },
  ingredientNameLower: { type: String, required: true },
  store: { type: String, trim: true, default: null },
  category: { type: String, trim: true, default: null },
});

UserIngredientPreferenceSchema.pre("validate", function setLowerName(next) {
  if (this.ingredientName) this.ingredientNameLower = this.ingredientName.trim().toLowerCase();
  next();
});

UserIngredientPreferenceSchema.index({ userId: 1, ingredientNameLower: 1 }, { unique: true });

export default mongoose.model(
  "UserIngredientPreference",
  UserIngredientPreferenceSchema,
  "userIngredientPreferences"
);
