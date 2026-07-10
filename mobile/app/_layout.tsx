import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-reanimated';

import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';

function RootNavigator() {
  const { token, loading } = useAuth();

  if (loading) return null;

  return (
    <Stack
      screenOptions={{
        headerShadowVisible: false,
        headerTitleStyle: { fontWeight: '600' },
      }}
    >
      <Stack.Protected guard={!token}>
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="register" options={{ headerShown: false }} />
      </Stack.Protected>

      <Stack.Protected guard={!!token}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="meals/[id]" options={{ title: 'Détails de la recette' }} />
        <Stack.Screen name="userMeals/index" options={{ title: 'Mes recettes' }} />
        <Stack.Screen name="userMeals/[id]" options={{ title: 'Détails de ma recette' }} />
        <Stack.Screen name="userMeals/new" options={{ title: 'Nouvelle recette' }} />
        <Stack.Screen name="userMeals/edit/[id]" options={{ title: 'Modifier la recette' }} />
        <Stack.Screen name="planning/pick-recipe" options={{ presentation: 'modal', title: 'Choisir une recette' }} />
        <Stack.Screen name="planning/configure-entry" options={{ presentation: 'modal', title: 'Planifier la recette' }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <RootNavigator />
          <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        </ThemeProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
