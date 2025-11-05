import React, { useEffect, useState } from 'react';
import { useLocalSearchParams } from 'expo-router';

import { MealDetailContent } from '@/components/MealDetailContent';
import { getUserMeal } from '@/services/userMealService';
import { UserMeal } from '@/types/UserMeal';

export default function UserMealDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [meal, setMeal] = useState<UserMeal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadUserMeal = async (mealId: string) => {
      try {
        const data = await getUserMeal(mealId);
        setMeal(data);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Erreur lors de la récupération de la recette";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    if (typeof id === 'string') {
      setLoading(true);
      setError(null);
      loadUserMeal(id);
    } else {
      setMeal(null);
      setError('Identifiant de recette invalide');
      setLoading(false);
    }
  }, [id]);

  return <MealDetailContent meal={meal} loading={loading} error={error} />;
}
