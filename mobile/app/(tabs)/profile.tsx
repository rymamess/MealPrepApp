import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const { user, logout } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    await logout();
    // Le RootNavigator réagit au changement de `token` et bascule vers l'écran de connexion.
  };

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Text style={[styles.label, { color: `${theme.text}99` }]}>Connecté en tant que</Text>
        <Text style={[styles.email, { color: theme.text }]}>{user?.email}</Text>
        {user?.name ? <Text style={[styles.name, { color: theme.text }]}>{user.name}</Text> : null}
      </View>

      <Pressable
        style={[styles.logoutButton, { borderColor: theme.border, opacity: loggingOut ? 0.6 : 1 }]}
        onPress={handleLogout}
        disabled={loggingOut}
      >
        <Text style={styles.logoutLabel}>{loggingOut ? 'Déconnexion…' : 'Se déconnecter'}</Text>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    gap: 20,
  },
  card: {
    padding: 22,
    borderRadius: 24,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 6,
  },
  label: {
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    fontWeight: '600',
  },
  email: {
    fontSize: 20,
    fontWeight: '700',
  },
  name: {
    fontSize: 15,
    opacity: 0.8,
  },
  logoutButton: {
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: '#ff6b6b1a',
  },
  logoutLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#d64545',
  },
});
