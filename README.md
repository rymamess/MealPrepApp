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
