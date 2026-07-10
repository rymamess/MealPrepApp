import React from 'react';
import { Text } from 'react-native';
import { Tabs } from 'expo-router';

import { Colors } from '@/constants/theme';
import { PlanningPeriodProvider } from '@/contexts/PlanningPeriodContext';
import { useColorScheme } from '@/hooks/use-color-scheme';

const tabIcon = (emoji: string) => ({ focused }: { focused: boolean }) => (
  <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.6 }}>{emoji}</Text>
);

export default function TabsLayout() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  return (
    <PlanningPeriodProvider>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: theme.tint,
          tabBarInactiveTintColor: `${theme.text}88`,
          tabBarStyle: { backgroundColor: theme.card, borderTopColor: theme.border },
        }}
      >
        <Tabs.Screen name="index" options={{ title: 'Recettes', tabBarIcon: tabIcon('🍽️') }} />
        <Tabs.Screen name="planning" options={{ title: 'Planning', tabBarIcon: tabIcon('🗓️') }} />
        <Tabs.Screen name="shopping-list" options={{ title: 'Courses', tabBarIcon: tabIcon('🛒') }} />
        <Tabs.Screen name="profile" options={{ title: 'Profil', tabBarIcon: tabIcon('👤') }} />
      </Tabs>
    </PlanningPeriodProvider>
  );
}
