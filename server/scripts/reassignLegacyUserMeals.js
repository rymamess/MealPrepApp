import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const APPLY = process.argv.includes("--apply");
const LEGACY_USER_ID = "64f1234567890abcdef12345";

// Usage: node scripts/reassignLegacyUserMeals.js <email> [--apply]
const targetEmail = process.argv.find((arg, i) => i >= 2 && !arg.startsWith("--"));

async function run() {
  if (!targetEmail) {
    console.error("❌ Usage: node scripts/reassignLegacyUserMeals.js <email> [--apply]");
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log(`Connecté à MongoDB (${APPLY ? "mode ÉCRITURE" : "mode DRY RUN, lecture seule"})`);

  const usersCollection = mongoose.connection.collection("users");
  const userMealsCollection = mongoose.connection.collection("userMeals");

  const user = await usersCollection.findOne({ email: targetEmail.toLowerCase() });
  if (!user) {
    console.error(`❌ Aucun utilisateur trouvé avec l'e-mail "${targetEmail}". Le compte doit être enregistré d'abord.`);
    await mongoose.disconnect();
    process.exit(1);
  }

  const legacyId = new mongoose.Types.ObjectId(LEGACY_USER_ID);
  const matching = await userMealsCollection.find({ userId: legacyId }).toArray();

  console.log(`\n${APPLY ? "Réassigné" : "À réassigner"}: ${matching.length} recette(s) de ${LEGACY_USER_ID} vers ${user._id} (${user.email}).`);
  matching.forEach((doc) => console.log(`  - ${doc._id}  "${doc.name}"`));

  if (APPLY && matching.length) {
    const result = await userMealsCollection.updateMany(
      { userId: legacyId },
      { $set: { userId: user._id, updatedAt: new Date() } }
    );
    console.log(`\n✅ ${result.modifiedCount} document(s) mis à jour.`);
  } else if (!APPLY && matching.length) {
    console.log("\n👉 Relance avec --apply pour appliquer les changements.");
  } else {
    console.log("\nAucune recette héritée à réassigner 🎉");
  }

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error("❌ Réassignation échouée:", err);
  process.exit(1);
});
