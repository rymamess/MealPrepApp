const MASS_UNITS = ['g', 'kg'];
const VOLUME_UNITS = ['ml', 'l'];

function scaleFactor(entry, recipe) {
  return entry.servings && recipe?.servings ? entry.servings / recipe.servings : 1;
}

function toGrams(quantity, unit) {
  return unit === 'kg' ? quantity * 1000 : quantity;
}

function toMl(quantity, unit) {
  return unit === 'l' ? quantity * 1000 : quantity;
}

function aggregate(items) {
  const groups = new Map();

  for (const { name, quantity, unit } of items) {
    const key = name.trim().toLowerCase();

    if (unit === 'au goût') {
      const k = `${key}|au goût`;
      if (!groups.has(k)) groups.set(k, { name: key, quantity: 0, unit: 'au goût' });
      continue;
    }

    if (MASS_UNITS.includes(unit)) {
      const k = `${key}|mass`;
      const g = groups.get(k) ?? { name: key, family: 'mass', grams: 0 };
      g.grams += toGrams(quantity, unit);
      groups.set(k, g);
      continue;
    }

    if (VOLUME_UNITS.includes(unit)) {
      const k = `${key}|volume`;
      const g = groups.get(k) ?? { name: key, family: 'volume', ml: 0 };
      g.ml += toMl(quantity, unit);
      groups.set(k, g);
      continue;
    }

    const k = `${key}|${unit}`;
    const g = groups.get(k) ?? { name: key, quantity: 0, unit };
    g.quantity += quantity;
    groups.set(k, g);
  }

  return [...groups.values()].map((g) => {
    if (g.family === 'mass') {
      return {
        name: g.name,
        quantity: g.grams >= 1000 ? +(g.grams / 1000).toFixed(2) : g.grams,
        unit: g.grams >= 1000 ? 'kg' : 'g',
      };
    }
    if (g.family === 'volume') {
      return {
        name: g.name,
        quantity: g.ml >= 1000 ? +(g.ml / 1000).toFixed(2) : g.ml,
        unit: g.ml >= 1000 ? 'l' : 'ml',
      };
    }
    return { name: g.name, quantity: g.quantity, unit: g.unit };
  });
}

export function computeShoppingList(entries) {
  const ingredientItems = [];
  const spiceItems = [];

  for (const entry of entries) {
    const recipe = entry.itemId; // populated doc; may be null if the reference is dangling
    if (!recipe) continue;

    const scale = scaleFactor(entry, recipe);

    for (const ing of recipe.ingredients ?? []) {
      ingredientItems.push({ name: ing.name, quantity: ing.quantity * scale, unit: ing.unit });
    }
    for (const sp of recipe.spices ?? []) {
      spiceItems.push({ name: sp.name, quantity: sp.quantity * scale, unit: sp.unit });
    }
  }

  return { ingredients: aggregate(ingredientItems), spices: aggregate(spiceItems) };
}
