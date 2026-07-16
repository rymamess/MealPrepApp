import express from "express";
import Meal from "../models/Meal.js";
import UserMeal from "../models/UserMeal.js";
import User from "../models/User.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { optionalAuth } from "../middleware/optionalAuth.js";

const router = express.Router();

const ITEM_TYPES = ["Meal", "UserMeal"];

// GET all meals
router.get("/", optionalAuth, async (req, res) => {
  try {
    const [meals, user] = await Promise.all([
      Meal.find().lean(),
      req.userId ? User.findById(req.userId) : null,
    ]);

    const favoriteKeys = new Set(
      (user?.favoriteMeals ?? []).map((f) => `${f.itemType}:${f.itemId}`)
    );

    const items = meals.map((meal) => ({
      ...meal,
      isFavorite: favoriteKeys.has(`Meal:${meal._id}`),
    }));

    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET meal by ID
router.get("/:id", optionalAuth, async (req, res) => {
  try {
    const meal = await Meal.findOne({ _id: req.params.id });
    if (!meal) return res.status(404).json({ error: "Meal not found" });
    res.json(meal);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST new meal
router.post("/", requireAuth, async (req, res) => {
  try {
    const meal = new Meal(req.body);
    await meal.save();
    res.status(201).json(meal);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 🔹 POST bascule une recette en favori / retire des favoris
router.post("/favorites/toggle", requireAuth, async (req, res) => {
  try {
    const { itemType, itemId } = req.body;

    if (!ITEM_TYPES.includes(itemType) || !itemId) {
      return res.status(400).json({ error: "Invalid itemType or itemId" });
    }

    if (itemType === "Meal") {
      const exists = await Meal.findById(itemId);
      if (!exists) return res.status(404).json({ error: "Meal not found" });
    } else {
      const exists = await UserMeal.findOne({ _id: itemId, userId: req.userId });
      if (!exists) return res.status(404).json({ error: "UserMeal not found" });
    }

    const user = await User.findById(req.userId);
    const index = user.favoriteMeals.findIndex(
      (f) => f.itemType === itemType && f.itemId.toString() === itemId
    );

    let isFavorite;
    if (index >= 0) {
      user.favoriteMeals.splice(index, 1);
      isFavorite = false;
    } else {
      user.favoriteMeals.push({ itemType, itemId });
      isFavorite = true;
    }

    await user.save();
    res.json({ isFavorite });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
