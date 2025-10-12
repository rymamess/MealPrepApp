// /app/(tabs)/index.tsx
import { Slot, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { View } from 'react-native';

export default function IndexRedirect() {
  const router = useRouter();

  useEffect(() => {
    // attend que le composant ait monté
    const timeout = setTimeout(() => {
      router.replace('/meals');
    }, 0);

    return () => clearTimeout(timeout);
  }, []);

  return <View />; // juste un conteneur vide
}
