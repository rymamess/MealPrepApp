import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const APPLY = process.argv.includes("--apply");

// Clés déjà normalisées (accents retirés, espace unique, minuscules) : voir normalizeUnitToken.
const UNIT_ALIASES = {
  g: "g", gr: "g", gramme: "g", grammes: "g",
  kg: "kg", kilo: "kg", kilos: "kg", kilogramme: "kg", kilogrammes: "kg",
  ml: "ml", millilitre: "ml", millilitres: "ml",
  l: "l", litre: "l", litres: "l",
  u: "unité", unite: "unité", unites: "unité",
  "c. a soupe": "c. à soupe", "c a soupe": "c. à soupe", cas: "c. à soupe", "c.a.s.": "c. à soupe",
  "cuillere a soupe": "c. à soupe", "cuilleres a soupe": "c. à soupe",
  "c. a cafe": "c. à café", "c a cafe": "c. à café", cac: "c. à café", "c.a.c.": "c. à café",
  "cuillere a cafe": "c. à café", "cuilleres a cafe": "c. à café",
  pincee: "pincée", pince: "pincée",
  tasse: "tasse", tasses: "tasse",
};

const stripAccents = (str) => str.normalize("NFD").replace(/[̀-ͯ]/g, "");

function normalizeUnitToken(token) {
  const cleaned = stripAccents(token.toLowerCase()).replace(/\s+/g, " ").trim();
  if (!cleaned) return "unité"; // pas d'unité écrite (ex: "2") -> on compte à l'unité
  return UNIT_ALIASES[cleaned] ?? null;
}

function parseNumber(token) {
  const fraction = token.match(/^(\d+)\s*\/\s*(\d+)$/);
  if (fraction) {
    return parseInt(fraction[1], 10) / parseInt(fraction[2], 10);
  }
  const value = parseFloat(token.replace(",", "."));
  return Number.isNaN(value) ? null : value;
}

// Retourne { quantity, unit } si le parsing réussit, ou { failed: true } sinon.
function parseLegacyQuantity(raw) {
  if (typeof raw !== "string") return { failed: true };

  const trimmed = raw.trim().toLowerCase();
  if (/^au go[uû]t/.test(trimmed)) {
    return { quantity: 0, unit: "au goût" };
  }

  const match = trimmed.match(/^(\d+\s*\/\s*\d+|[\d.,]+)\s*(.*)$/);
  if (!match) return { failed: true };

  const quantity = parseNumber(match[1].trim());
  if (quantity === null) return { failed: true };

  const unit = normalizeUnitToken(match[2]);
  if (!unit) return { failed: true };

  return { quantity, unit };
}

function migrateList(list, listKey, docLabel, failures) {
  if (!Array.isArray(list)) return list;

  return list.map((item, index) => {
    if (typeof item.quantity === "number" && item.unit) {
      return item; // déjà migré, on ne touche pas
    }

    const result = parseLegacyQuantity(item.quantity);

    if (result.failed) {
      failures.push({ doc: docLabel, listKey, index, name: item.name, raw: item.quantity });
      return {
        ...item,
        name: `${item.name} [⚠ ancienne quantité: "${item.quantity}"]`,
        quantity: 0,
        unit: "unité",
      };
    }

    return { ...item, quantity: result.quantity, unit: result.unit };
  });
}

async function migrateCollection(collection, label, failures) {
  const docs = await collection.find({}).toArray();
  let migratedCount = 0;

  for (const doc of docs) {
    const hasLegacyIngredients = (doc.ingredients ?? []).some((i) => typeof i.quantity !== "number");
    const hasLegacySpices = (doc.spices ?? []).some((i) => typeof i.quantity !== "number");
    if (!hasLegacyIngredients && !hasLegacySpices) continue;

    const docLabel = `${label} ${doc._id}`;
    const ingredients = migrateList(doc.ingredients, "ingredients", docLabel, failures);
    const spices = migrateList(doc.spices, "spices", docLabel, failures);

    migratedCount += 1;

    if (APPLY) {
      await collection.updateOne({ _id: doc._id }, { $set: { ingredients, spices } });
    }
  }

  return migratedCount;
}

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log(`Connecté à MongoDB (${APPLY ? "mode ÉCRITURE" : "mode DRY RUN, lecture seule"})`);

  const failures = [];

  // Lecture via la collection brute (driver natif), pas via les Models Mongoose :
  // les anciens documents ont quantity en string, et le schema exige désormais un Number,
  // donc passer par les Models provoquerait une CastError à la lecture.
  const mealsMigrated = await migrateCollection(mongoose.connection.collection("meals"), "Meal", failures);
  const userMealsMigrated = await migrateCollection(mongoose.connection.collection("userMeals"), "UserMeal", failures);

  console.log(`\n${APPLY ? "Migré" : "À migrer"}: ${mealsMigrated} meal(s), ${userMealsMigrated} userMeal(s).`);

  if (failures.length) {
    console.log(
      `\n⚠️  ${failures.length} ingrédient(s)/épice(s) n'ont pas pu être parsés automatiquement ` +
      `(valeur par défaut appliquée: quantité 0, unité "unité", texte original conservé dans le nom) :`
    );
    failures.forEach((f) => {
      console.log(`  - [${f.doc}] ${f.listKey}[${f.index}] "${f.name}" -> quantité brute: "${f.raw}"`);
    });
    console.log("\n👉 Corrige-les manuellement dans l'app (écran Modifier) après la migration.");
  } else {
    console.log("\nAucun échec de parsing 🎉");
  }

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error("❌ Migration échouée:", err);
  process.exit(1);
});
