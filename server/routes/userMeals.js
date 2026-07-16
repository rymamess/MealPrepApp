import express from "express";
import UserMeal from "../models/UserMeal.js";
import User from "../models/User.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = express.Router();

// 🔹 GET all user meals
router.get("/", requireAuth, async (req, res) => {
  try {
    const [userMeals, user] = await Promise.all([
      UserMeal.find({ userId: req.userId }).lean(),
      User.findById(req.userId),
    ]);

    const favoriteKeys = new Set(
      (user?.favoriteMeals ?? []).map((f) => `${f.itemType}:${f.itemId}`)
    );

    const items = userMeals.map((meal) => ({
      ...meal,
      isFavorite: favoriteKeys.has(`UserMeal:${meal._id}`),
    }));

    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// 🔹 POST create a user meal
router.post("/", requireAuth, async (req, res) => {
  try {
    console.log("POST /userMeals Body:", req.body);

    const newMeal = new UserMeal({
      userId: req.userId,
      visibility: req.body.visibility || "private",
      ...req.body, // champs comme name, category, ingredients, etc.
    });

    const savedMeal = await newMeal.save();
    console.log("✅ Created UserMeal:", savedMeal);
    res.status(201).json(savedMeal);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
});

// 🔹 GET one user meal
router.get("/:id", requireAuth, async (req, res) => {
  try {
    const meal = await UserMeal.findOne({
      _id: req.params.id,
      userId: req.userId,
    });
    if (!meal) return res.status(404).json({ error: "UserMeal not found" });
    res.json(meal);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// 🔹 PUT update a user meal
router.put("/:id", requireAuth, async (req, res) => {
  try {
    const disallowedFields = ["_id", "id", "userId", "createdAt", "updatedAt"];
    const updates = Object.fromEntries(
      Object.entries(req.body).filter(([key]) => !disallowedFields.includes(key))
    );

    const updatedMeal = await UserMeal.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      {
        $set: {
          ...updates,
          updatedAt: new Date(),
        },
      },
      { new: true, runValidators: true }
    );

    if (!updatedMeal) return res.status(404).json({ error: "UserMeal not found" });
    res.json(updatedMeal);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
});

// 🔹 DELETE remove a user meal
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const deletedMeal = await UserMeal.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!deletedMeal) return res.status(404).json({ error: "UserMeal not found" });
    res.json({ message: "UserMeal deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
