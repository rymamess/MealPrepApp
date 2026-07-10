import mongoose from "mongoose";

const FavoriteIngredientSchema = new mongoose.Schema(
  {
    itemType: { type: String, enum: ["Ingredient", "UserIngredient"], required: true },
    itemId: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: "favoriteIngredients.itemType" },
  },
  { _id: false }
);

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  name: { type: String },
  favoriteIngredients: { type: [FavoriteIngredientSchema], default: [] },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("User", UserSchema, "users");
