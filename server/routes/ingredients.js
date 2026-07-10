import express from "express";
import Ingredient, { INGREDIENT_CATEGORIES } from "../models/Ingredient.js";
import UserIngredient from "../models/UserIngredient.js";
import User from "../models/User.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = express.Router();

const ITEM_TYPES = ["Ingredient", "UserIngredient"];

router.use(requireAuth);

// 🔹 GET catalogue partagé + ajouts privés de l'utilisateur, avec statut favori
router.get("/", async (req, res) => {
  try {
    const [shared, personal, user] = await Promise.all([
      Ingredient.find({}),
      UserIngredient.find({ userId: req.userId }),
      User.findById(req.userId),
    ]);

    const favoriteKeys = new Set(
      (user?.favoriteIngredients ?? []).map((f) => `${f.itemType}:${f.itemId}`)
    );

    const items = [
      ...shared.map((doc) => ({
        itemType: "Ingredient",
        itemId: doc._id,
        name: doc.name,
        category: doc.category,
      })),
      ...personal.map((doc) => ({
        itemType: "UserIngredient",
        itemId: doc._id,
        name: doc.name,
        category: doc.category,
      })),
    ].map((item) => ({
      ...item,
      isFavorite: favoriteKeys.has(`${item.itemType}:${item.itemId}`),
    }));

    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔹 POST créer un ingrédient personnel (toujours privé, jamais dans le catalogue partagé)
router.post("/", async (req, res) => {
  try {
    const { name, category } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: "Name is required" });
    }
    if (!INGREDIENT_CATEGORIES.includes(category)) {
      return res.status(400).json({ error: "Invalid category" });
    }

    const created = await UserIngredient.create({ userId: req.userId, name: name.trim(), category });
    res.status(201).json({
      itemType: "UserIngredient",
      itemId: created._id,
      name: created.name,
      category: created.category,
      isFavorite: false,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 🔹 POST bascule un ingrédient en favori / retire des favoris
router.post("/favorites/toggle", async (req, res) => {
  try {
    const { itemType, itemId } = req.body;

    if (!ITEM_TYPES.includes(itemType) || !itemId) {
      return res.status(400).json({ error: "Invalid itemType or itemId" });
    }

    if (itemType === "Ingredient") {
      const exists = await Ingredient.findById(itemId);
      if (!exists) return res.status(404).json({ error: "Ingredient not found" });
    } else {
      const exists = await UserIngredient.findOne({ _id: itemId, userId: req.userId });
      if (!exists) return res.status(404).json({ error: "UserIngredient not found" });
    }

    const user = await User.findById(req.userId);
    const index = user.favoriteIngredients.findIndex(
      (f) => f.itemType === itemType && f.itemId.toString() === itemId
    );

    let isFavorite;
    if (index >= 0) {
      user.favoriteIngredients.splice(index, 1);
      isFavorite = false;
    } else {
      user.favoriteIngredients.push({ itemType, itemId });
      isFavorite = true;
    }

    await user.save();
    res.json({ isFavorite });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
