# MealPrepApp

Structure du MVP
MealPrepApp/
│
├─ server/                # Backend Node/Express
│   ├─ models/            # Modèles MongoDB
│   │   └─ Meal.js
│   ├─ routes/            # Routes API
│   │   └─ meals.js
│   └─ server.js          # Point d’entrée du backend
│
├─ mobile/                # Frontend Expo/React Native
│   ├─ app/               # Pages Expo Router
│   │   ├─ index.tsx      # Page d’accueil : recap de la semaine
│   │   ├─ meals/         # Pages liées aux meals
│   │   │   ├─ index.tsx      # Liste des recettes
│   │   │   └─ [id].tsx       # Détail d’une recette
│   │   └─ _layout.tsx    # Layout général (tabs, header)
│   │
│   ├─ components/        # Composants réutilisables
│   │   ├─ MealCard.tsx   # Carte d’une recette
│   │   ├─ IngredientList.tsx
│   │   └─ ...            # Autres composants
│   │
│   ├─ constants/         # Valeurs globales (couleurs, fonts, etc.)
│   │   └─ theme.tsx
│   │
│   ├─ hooks/             # Hooks personnalisés
│   │   └─ useColorScheme.ts
│   │
│   └─ assets/            # Images, icônes
│
└─ README.md

## Commandes utiles

Depuis la racine du dépôt, utilisez les scripts npm suivants :

- `npm run mobile:start` – lance Expo en mode standard à l’intérieur du dossier `mobile/`.
- `npm run mobile:start:tunnel` – lance Expo avec l’option `--tunnel` sans erreur de `package.json` manquante.
- `npm run mobile:lint` – exécute l’analyse ESLint du projet mobile.

> 💡 Expo recherche un `package.json` à la racine courante. Les scripts ci-dessus redirigent automatiquement les commandes vers `mobile/`, ce qui évite l’erreur `ConfigError: The expected package.json path ... does not exist` rencontrée avec `npx expo start --tunnel` exécuté depuis la racine.
