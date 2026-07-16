const MASS_UNITS = ['g', 'kg'];
const VOLUME_UNITS = ['ml', 'l'];
const DEFAULT_CATEGORY = 'Other';

function scaleFactor(entry, recipe) {
  return entry.servings && recipe?.servings ? entry.servings / recipe.servings : 1;
}

function toGrams(quantity, unit) {
  return unit === 'kg' ? quantity * 1000 : quantity;
}

function toMl(quantity, unit) {
  return unit === 'l' ? quantity * 1000 : quantity;
}

function getOrCreateGroup(groups, key, base) {
  const existing = groups.get(key);
  if (existing) return existing;
  groups.set(key, base);
  return base;
}

// Agrège une liste plate {name, quantity, unit, category, manualId?} par nom + famille
// d'unité (masse: g/kg, volume: ml/l, sinon exact). Un item avec `manualId` marque le
// groupe comme contenant une contribution manuelle (au plus une, les items manuels étant
// eux-mêmes fusionnés entre eux à la création) ; un groupe peut aussi contenir une
// contribution "recette". `source`/`id` en sortie reflètent ce mélange :
// - seulement manuel -> source 'manual', id du document manuel (supprimable)
// - manuel + recette -> source 'mixed', id du document manuel (le retirer ne supprime
//   que la contribution manuelle, la part "recette" réapparaît au prochain calcul)
// - seulement recette -> source 'recipe', pas d'id
function aggregate(items) {
  const groups = new Map();

  for (const { name, quantity, unit, category, manualId } of items) {
    const key = name.trim().toLowerCase();
    const itemCategory = category || DEFAULT_CATEGORY;
    const isManual = Boolean(manualId);

    let group;
    if (unit === 'au goût') {
      group = getOrCreateGroup(groups, `${key}|au goût`, { name: key, quantity: 0, unit: 'au goût', category: itemCategory });
    } else if (MASS_UNITS.includes(unit)) {
      group = getOrCreateGroup(groups, `${key}|mass`, { name: key, family: 'mass', grams: 0, category: itemCategory });
      group.grams += toGrams(quantity, unit);
    } else if (VOLUME_UNITS.includes(unit)) {
      group = getOrCreateGroup(groups, `${key}|volume`, { name: key, family: 'volume', ml: 0, category: itemCategory });
      group.ml += toMl(quantity, unit);
    } else {
      group = getOrCreateGroup(groups, `${key}|${unit}`, { name: key, quantity: 0, unit, category: itemCategory });
      group.quantity += quantity;
    }

    group.hasRecipe = group.hasRecipe || !isManual;
    if (isManual) group.manualId = manualId;
  }

  return [...groups.values()].map((g) => {
    const source = g.manualId ? (g.hasRecipe ? 'mixed' : 'manual') : 'recipe';
    const id = g.manualId;

    if (g.family === 'mass') {
      return {
        name: g.name,
        quantity: g.grams >= 1000 ? +(g.grams / 1000).toFixed(2) : g.grams,
        unit: g.grams >= 1000 ? 'kg' : 'g',
        category: g.category,
        source,
        id,
      };
    }
    if (g.family === 'volume') {
      return {
        name: g.name,
        quantity: g.ml >= 1000 ? +(g.ml / 1000).toFixed(2) : g.ml,
        unit: g.ml >= 1000 ? 'l' : 'ml',
        category: g.category,
        source,
        id,
      };
    }
    return { name: g.name, quantity: g.quantity, unit: g.unit, category: g.category, source, id };
  });
}

// Résout la catégorie et le magasin effectifs de chaque item selon les préférences
// personnelles de l'utilisateur (voir server/routes/preferences.js) :
// 1. Catégorie : override par ingrédient (UserIngredientPreference.category) sinon la
//    catégorie déjà présente sur l'item (comportement historique, inchangé).
// 2. Magasin : override ponctuel pour cette liste (ShoppingListItemOverride, priorité
//    la plus haute) sinon override par ingrédient sinon défaut de la catégorie effective
//    sinon null ("non classé"). L'override ponctuel ne modifie aucun défaut persistant.
// `ingredientPrefs` et `categoryStores` sont des Map indexées par nom d'ingrédient en
// minuscules et par nom de catégorie, respectivement. `itemOverrides` est une Map
// indexée par nom d'ingrédient en minuscules (optionnelle).
export function applyUserPreferences(items, { ingredientPrefs, categoryStores, itemOverrides }) {
  return items.map((item) => {
    const pref = ingredientPrefs.get(item.name);
    const category = pref?.category || item.category;
    const overrideStore = itemOverrides?.get(item.name);
    const store = overrideStore || pref?.store || categoryStores.get(category) || null;
    return { ...item, category, store };
  });
}

// Retourne une liste plate d'items {name, category, quantity, unit, source, id?},
// fusionnant les ingrédients/épices des recettes planifiées et les items ajoutés
// manuellement dès que le nom et l'unité correspondent.
export function computeShoppingList(entries, manualItems = []) {
  const flatItems = [];

  for (const entry of entries) {
    const recipe = entry.itemId; // doc populé ; peut être null si la référence est orpheline
    if (!recipe) continue;

    const scale = scaleFactor(entry, recipe);

    for (const ing of recipe.ingredients ?? []) {
      flatItems.push({ name: ing.name, quantity: ing.quantity * scale, unit: ing.unit, category: ing.category });
    }
    for (const sp of recipe.spices ?? []) {
      flatItems.push({ name: sp.name, quantity: sp.quantity * scale, unit: sp.unit, category: sp.category });
    }
  }

  for (const item of manualItems) {
    flatItems.push({
      name: item.name,
      quantity: item.quantity,
      unit: item.unit,
      category: item.category,
      manualId: item._id.toString(),
    });
  }

  return aggregate(flatItems);
}
