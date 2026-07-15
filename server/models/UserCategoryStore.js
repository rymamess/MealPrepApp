import mongoose from "mongoose";

// Magasin par défaut pour une catégorie donnée (catégorie fixe du catalogue partagé
// OU nom d'une UserCategory personnelle) — pas de contrainte enum ici, la valeur est
// juste comparée au champ `category` (déjà résolu) de chaque item de la liste de courses.
const UserCategoryStoreSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  category: { type: String, required: true, trim: true },
  store: { type: String, required: true, trim: true },
});

UserCategoryStoreSchema.index({ userId: 1, category: 1 }, { unique: true });

export default mongoose.model("UserCategoryStore", UserCategoryStoreSchema, "userCategoryStores");
