import mongoose from "mongoose";
import dotenv from "dotenv";
import fs from "fs";
import User from "../models/User.js";
import UserMeal from "../models/UserMeal.js";
import UserIngredient from "../models/UserIngredient.js";
import Ingredient, { INGREDIENT_CATEGORIES } from "../models/Ingredient.js";
import { UNITS, COOK_MODES } from "../models/Meal.js";

dotenv.config();

// Usage: node scripts/addUserRecipe.js <chemin-vers-recette.json> <email-utilisateur>
const [, , recipePath, userEmail] = process.argv;

const MEAL_CATEGORIES = ["Breakfast", "Snack", "Lunch", "Dinner", "Dessert"];
const DIFFICULTIES = ["Easy", "Medium", "Hard"];

function validateItemList(items, label) {
  const errors = [];
  (items || []).forEach((item, i) => {
    if (!item.name) errors.push(`${label}[${i}]: nom manquant`);
    if (typeof item.quantity !== "number") errors.push(`${label}[${i}] "${item.name}": quantity doit être un nombre`);
    if (!UNITS.includes(item.unit)) errors.push(`${label}[${i}] "${item.name}": unité invalide "${item.unit}"`);
    if (item.category && !INGREDIENT_CATEGORIES.includes(item.category)) {
      errors.push(`${label}[${i}] "${item.name}": catégorie invalide "${item.category}"`);
    }
  });
  return errors;
}

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Ingrédient "générique" (courant, trouvable dans une épicerie classique) -> catalogue
// partagé. Ingrédient "spécifique" (marqué `"specific": true` dans le JSON de la recette,
// typiquement un produit ethnique/spécialisé propre aux habitudes d'un utilisateur) ->
// collection UserIngredient, propre à cet utilisateur.
async function ensureIngredientInCatalog(name, category, isSpecific, userId, report) {
  const trimmed = name.trim();
  const nameRegex = new RegExp(`^${escapeRegExp(trimmed)}$`, "i");

  if (isSpecific) {
    const existing = await UserIngredient.findOne({ userId, name: nameRegex });
    if (existing) {
      report.existing.push(`${trimmed} (spécifique)`);
      return;
    }
    await UserIngredient.create({ userId, name: trimmed, category: category || "Other" });
    report.addedUser.push({ name: trimmed, category: category || "Other" });
    return;
  }

  const existing = await Ingredient.findOne({ name: nameRegex });
  if (existing) {
    report.existing.push(trimmed);
    return;
  }
  await Ingredient.create({ name: trimmed, category: category || "Other" });
  report.added.push({ name: trimmed, category: category || "Other" });
}

async function run() {
  if (!recipePath || !userEmail) {
    console.error("❌ Usage: node scripts/addUserRecipe.js <chemin-vers-recette.json> <email-utilisateur>");
    process.exit(1);
  }

  const raw = fs.readFileSync(recipePath, "utf-8");
  const parsed = JSON.parse(raw);
  const recipes = Array.isArray(parsed) ? parsed : [parsed];

  for (const recipe of recipes) {
    const errors = [];
    if (!recipe.name) errors.push("name manquant");
    const categories = Array.isArray(recipe.category) ? recipe.category : [recipe.category];
    if (!categories.length || categories.some((c) => !MEAL_CATEGORIES.includes(c))) {
      errors.push(`category invalide: ${JSON.stringify(recipe.category)}`);
    } else {
      recipe.category = categories;
    }
    if (recipe.difficulty && !DIFFICULTIES.includes(recipe.difficulty)) errors.push(`difficulty invalide: "${recipe.difficulty}"`);
    if (recipe.cookMode && !COOK_MODES.includes(recipe.cookMode)) errors.push(`cookMode invalide: "${recipe.cookMode}"`);
    errors.push(...validateItemList(recipe.ingredients, "ingredients"));
    errors.push(...validateItemList(recipe.spices, "spices"));

    if (errors.length) {
      console.error(`❌ Recette "${recipe.name || "?"}" invalide:`);
      errors.forEach((e) => console.error(`  - ${e}`));
      process.exitCode = 1;
      continue;
    }
    recipe.__valid = true;
  }

  if (recipes.some((r) => !r.__valid)) {
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);

  const user = await User.findOne({ email: userEmail.toLowerCase() });
  if (!user) {
    console.error(`❌ Aucun utilisateur trouvé avec l'e-mail "${userEmail}"`);
    await mongoose.disconnect();
    process.exit(1);
  }

  for (const recipe of recipes) {
    const report = { added: [], addedUser: [], existing: [] };
    for (const ing of recipe.ingredients || []) {
      await ensureIngredientInCatalog(ing.name, ing.category, ing.specific, user._id, report);
    }
    for (const sp of recipe.spices || []) {
      await ensureIngredientInCatalog(sp.name, sp.category, sp.specific, user._id, report);
    }

    const created = await UserMeal.create({
      userId: user._id,
      visibility: recipe.visibility || "private",
      name: recipe.name,
      photo: recipe.photo,
      category: recipe.category,
      prepTime: recipe.prepTime,
      cookTime: recipe.cookTime,
      cookMode: recipe.cookMode,
      cookTemp: recipe.cookTemp,
      difficulty: recipe.difficulty,
      servings: recipe.servings,
      ingredients: recipe.ingredients || [],
      spices: recipe.spices || [],
      description: recipe.description,
    });

    console.log(`\n✅ Recette créée: "${created.name}" (${created._id}) pour ${user.email}`);

    if (report.added.length) {
      console.log(`🆕 ${report.added.length} ingrédient(s) ajouté(s) au catalogue partagé:`);
      report.added.forEach((i) => console.log(`  - ${i.name} (${i.category})`));
    }
    if (report.addedUser.length) {
      console.log(`🆕 ${report.addedUser.length} ingrédient(s) spécifique(s) ajouté(s) pour ${user.email}:`);
      report.addedUser.forEach((i) => console.log(`  - ${i.name} (${i.category})`));
    }
    if (report.existing.length) {
      console.log(`♻️  ${report.existing.length} ingrédient(s) déjà dans le catalogue: ${report.existing.join(", ")}`);
    }
  }

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error("❌ Échec:", err);
  process.exit(1);
});
