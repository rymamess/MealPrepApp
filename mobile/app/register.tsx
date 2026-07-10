import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Link, useRouter } from 'expo-router';

import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getContrastTextColor } from '@/utils/color';

const MIN_PASSWORD_LENGTH = 8;

export default function RegisterScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const { register } = useAuth();
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleRegister = async () => {
    if (!email || !password) {
      Alert.alert('Erreur', 'E-mail et mot de passe requis');
      return;
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      Alert.alert('Erreur', `Le mot de passe doit contenir au moins ${MIN_PASSWORD_LENGTH} caractères`);
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas');
      return;
    }

    try {
      setSubmitting(true);
      await register(email, password, name || undefined);
      router.replace('/');
    } catch (err) {
      Alert.alert('Erreur', err instanceof Error ? err.message : "Inscription impossible");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.heading, { color: theme.text }]}>Créer un compte</Text>
        <Text style={[styles.caption, { color: `${theme.text}99` }]}>Rejoins MealPrep pour organiser tes recettes.</Text>
      </View>

      <View style={[styles.section, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <View style={styles.inputBlock}>
          <Text style={[styles.label, { color: theme.text }]}>Nom (optionnel)</Text>
          <TextInput
            style={[styles.input, { borderColor: theme.border, color: theme.text }]}
            placeholder="Ton prénom"
            placeholderTextColor={`${theme.text}55`}
            value={name}
            onChangeText={setName}
          />
        </View>
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
            placeholder={`Au moins ${MIN_PASSWORD_LENGTH} caractères`}
            placeholderTextColor={`${theme.text}55`}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>
        <View style={styles.inputBlock}>
          <Text style={[styles.label, { color: theme.text }]}>Confirmer le mot de passe</Text>
          <TextInput
            style={[styles.input, { borderColor: theme.border, color: theme.text }]}
            placeholder="••••••••"
            placeholderTextColor={`${theme.text}55`}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />
        </View>
      </View>

      <Pressable
        style={[styles.primaryButton, { backgroundColor: theme.tint, opacity: submitting ? 0.6 : 1 }]}
        onPress={handleRegister}
        disabled={submitting}
      >
        <Text style={[styles.primaryLabel, { color: getContrastTextColor(theme.tint) }]}>
          {submitting ? 'Création…' : 'Créer mon compte'}
        </Text>
      </Pressable>

      <Link href="/login" style={[styles.link, { color: theme.tint }]}>
        Déjà un compte ? Connecte-toi
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
