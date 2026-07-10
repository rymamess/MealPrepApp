import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Link, useRouter } from 'expo-router';

import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getContrastTextColor } from '@/utils/color';

export default function LoginScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const { login } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erreur', 'E-mail et mot de passe requis');
      return;
    }
    try {
      setSubmitting(true);
      await login(email, password);
      router.replace('/');
    } catch (err) {
      Alert.alert('Erreur', err instanceof Error ? err.message : 'Connexion impossible');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ThemedView safeTop style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.heading, { color: theme.text }]}>Bon retour</Text>
        <Text style={[styles.caption, { color: `${theme.text}99` }]}>Connecte-toi pour retrouver tes recettes.</Text>
      </View>

      <View style={[styles.section, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <View style={styles.inputBlock}>
          <Text style={[styles.label, { color: theme.text }]}>E-mail</Text>
          <TextInput
            style={[styles.input, { borderColor: theme.border, color: theme.text }]}
            placeholder="toi@exemple.com"
            placeholderTextColor={`${theme.text}55`}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>
        <View style={styles.inputBlock}>
          <Text style={[styles.label, { color: theme.text }]}>Mot de passe</Text>
          <TextInput
            style={[styles.input, { borderColor: theme.border, color: theme.text }]}
            placeholder="••••••••"
            placeholderTextColor={`${theme.text}55`}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>
      </View>

      <Pressable
        style={[styles.primaryButton, { backgroundColor: theme.tint, opacity: submitting ? 0.6 : 1 }]}
        onPress={handleLogin}
        disabled={submitting}
      >
        <Text style={[styles.primaryLabel, { color: getContrastTextColor(theme.tint) }]}>
          {submitting ? 'Connexion…' : 'Se connecter'}
        </Text>
      </Pressable>

      <Link href="/register" style={[styles.link, { color: theme.tint }]}>
        Pas de compte ? Inscris-toi
      </Link>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    gap: 20,
  },
  header: {
    gap: 8,
  },
  heading: {
    fontSize: 28,
    fontWeight: '700',
  },
  caption: {
    fontSize: 14,
    lineHeight: 20,
  },
  section: {
    padding: 22,
    borderRadius: 24,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 16,
  },
  inputBlock: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
  },
  primaryButton: {
    borderRadius: 999,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryLabel: {
    fontWeight: '700',
    fontSize: 15,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  link: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
  },
});
