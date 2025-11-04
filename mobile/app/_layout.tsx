import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack
        screenOptions={{
          headerShadowVisible: false,
          headerTitleStyle: { fontWeight: '600' },
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="meals/index" options={{ title: 'Toutes les recettes' }} />
        <Stack.Screen name="meals/[id]" options={{ title: 'Détails de la recette' }} />
        <Stack.Screen name="userMeals/index" options={{ title: 'Mes recettes' }} />
        <Stack.Screen name="userMeals/new" options={{ title: 'Nouvelle recette' }} />
        <Stack.Screen name="userMeals/edit/[id]" options={{ title: 'Modifier la recette' }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
    </ThemeProvider>
  );
}
