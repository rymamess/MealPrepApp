import express from "express";
import Store from "../models/Store.js";
import UserCategory from "../models/UserCategory.js";
import UserCategoryStore from "../models/UserCategoryStore.js";
import UserIngredientPreference from "../models/UserIngredientPreference.js";
import { INGREDIENT_CATEGORIES } from "../models/Ingredient.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = express.Router();

router.use(requireAuth);

// ---------- Magasins ----------

router.get("/stores", async (req, res) => {
  const stores = await Store.find({ userId: req.userId }).sort({ name: 1 });
  res.json(stores);
});

router.post("/stores", async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ error: "Name is required" });
    const created = await Store.create({ userId: req.userId, name: name.trim() });
    res.status(201).json(created);
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ error: "Ce magasin existe déjà" });
    res.status(400).json({ error: err.message });
  }
});

router.delete("/stores/:id", async (req, res) => {
  const deleted = await Store.findOneAndDelete({ _id: req.params.id, userId: req.userId });
  if (!deleted) return res.status(404).json({ error: "Store not found" });
  res.json({ message: "Store deleted" });
});

// ---------- Catégories personnelles ----------

router.get("/categories", async (req, res) => {
  const categories = await UserCategory.find({ userId: req.userId }).sort({ name: 1 });
  res.json(categories);
});

router.post("/categories", async (req, res) => {
  try {
    const { name, color, icon } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ error: "Name is required" });
    if (!color || !icon) return res.status(400).json({ error: "color and icon are required" });

    const trimmed = name.trim();
    if (INGREDIENT_CATEGORIES.some((c) => c.toLowerCase() === trimmed.toLowerCase())) {
      return res.status(409).json({ error: "Une catégorie existante porte déjà ce nom" });
    }

    const created = await UserCategory.create({ userId: req.userId, name: trimmed, color, icon });
    res.status(201).json(created);
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ error: "Cette catégorie existe déjà" });
    res.status(400).json({ error: err.message });
  }
});

router.delete("/categories/:id", async (req, res) => {
  const deleted = await UserCategory.findOneAndDelete({ _id: req.params.id, userId: req.userId });
  if (!deleted) return res.status(404).json({ error: "UserCategory not found" });

  // Nettoie les associations catégorie->magasin et overrides d'ingrédients qui
  // pointaient sur cette catégorie custom, pour ne pas laisser de références mortes.
  await Promise.all([
    UserCategoryStore.deleteOne({ userId: req.userId, category: deleted.name }),
    UserIngredientPreference.updateMany(
      { userId: req.userId, category: deleted.name },
      { $set: { category: null } }
    ),
  ]);

  res.json({ message: "UserCategory deleted" });
});

// ---------- Défauts catégorie -> magasin ----------

router.get("/category-stores", async (req, res) => {
  const mappings = await UserCategoryStore.find({ userId: req.userId }).sort({ category: 1 });
  res.json(mappings);
});

router.put("/category-stores/:category", async (req, res) => {
  try {
    const { store } = req.body;
    const category = decodeURIComponent(req.params.category);
    if (!store || !store.trim()) return res.status(400).json({ error: "store is required" });

    const updated = await UserCategoryStore.findOneAndUpdate(
      { userId: req.userId, category },
      { $set: { store: store.trim() } },
      { new: true, upsert: true, runValidators: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete("/category-stores/:category", async (req, res) => {
  const category = decodeURIComponent(req.params.category);
  await UserCategoryStore.deleteOne({ userId: req.userId, category });
  res.json({ message: "Category store default deleted" });
});

// ---------- Overrides par ingrédient ----------

router.get("/ingredients", async (req, res) => {
  const prefs = await UserIngredientPreference.find({ userId: req.userId }).sort({ ingredientName: 1 });
  res.json(prefs);
});

router.put("/ingredients/:name", async (req, res) => {
  try {
    const ingredientName = decodeURIComponent(req.params.name).trim();
    if (!ingredientName) return res.status(400).json({ error: "ingredient name is required" });

    const store = req.body.store === undefined ? undefined : req.body.store?.trim() || null;
    const category = req.body.category === undefined ? undefined : req.body.category?.trim() || null;

    const ingredientNameLower = ingredientName.toLowerCase();
    const existing = await UserIngredientPreference.findOne({ userId: req.userId, ingredientNameLower });

    const nextStore = store !== undefined ? store : existing?.store ?? null;
    const nextCategory = category !== undefined ? category : existing?.category ?? null;

    if (!nextStore && !nextCategory) {
      if (existing) await existing.deleteOne();
      return res.json({ deleted: true });
    }

    const updated = await UserIngredientPreference.findOneAndUpdate(
      { userId: req.userId, ingredientNameLower },
      { $set: { ingredientName, store: nextStore, category: nextCategory } },
      { new: true, upsert: true, runValidators: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete("/ingredients/:name", async (req, res) => {
  const ingredientNameLower = decodeURIComponent(req.params.name).trim().toLowerCase();
  await UserIngredientPreference.deleteOne({ userId: req.userId, ingredientNameLower });
  res.json({ message: "Ingredient preference deleted" });
});

export default router;
