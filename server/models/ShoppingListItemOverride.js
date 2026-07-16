import mongoose from "mongoose";

// Override ponctuel du magasin d'un item de liste de courses, pour une période
// donnée uniquement — ne modifie pas les défauts persistants (UserIngredientPreference,
// UserCategoryStore) gérés dans server/routes/preferences.js.
const ShoppingListItemOverrideSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  periodStart: { type: Date, required: true },
  periodEnd: { type: Date, required: true },
  itemKey: { type: String, required: true, trim: true }, // nom normalisé (trim+lowercase), même clé que l'agrégation dans utils/shoppingList.js
  store: { type: String, required: true, trim: true },
});

ShoppingListItemOverrideSchema.index({ userId: 1, periodStart: 1, periodEnd: 1, itemKey: 1 }, { unique: true });

export default mongoose.model(
  "ShoppingListItemOverride",
  ShoppingListItemOverrideSchema,
  "shoppingListItemOverrides"
);
