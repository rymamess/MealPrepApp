import React from "react";
import { Text, TextInput, Button, StyleSheet, ScrollView } from "react-native";
import { UserMeal } from "@/types/UserMeal";
import { Picker } from "@react-native-picker/picker";

type Props = {
  meal: Partial<UserMeal>;
  onChange: (key: keyof UserMeal, value: any) => void;
  onSubmit: () => void;
  submitLabel?: string;
};

export const UserMealForm: React.FC<Props> = ({ meal, onChange, onSubmit, submitLabel = "Enregistrer" }) => {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.label}>Nom de la recette</Text>
      <TextInput
        style={styles.input}
        value={meal.name}
        onChangeText={(text) => onChange("name", text)}
      />

      <Text style={styles.label}>Photo (URL)</Text>
      <TextInput
        style={styles.input}
        value={meal.photo}
        onChangeText={(text) => onChange("photo", text)}
      />

      <Text style={styles.label}>Catégorie</Text>
      <Picker
        selectedValue={meal.category}
        onValueChange={(value) => onChange("category", value)}
        style={styles.picker}
      >
        <Picker.Item label="Breakfast" value="Breakfast" />
        <Picker.Item label="Snack" value="Snack" />
        <Picker.Item label="Lunch" value="Lunch" />
        <Picker.Item label="Dinner" value="Dinner" />
        <Picker.Item label="Dessert" value="Dessert" />
      </Picker>

      <Text style={styles.label}>Temps préparation (min)</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={meal.prepTime?.toString()}
        onChangeText={(text) => onChange("prepTime", parseInt(text))}
      />

      <Text style={styles.label}>Temps cuisson (min)</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={meal.cookTime?.toString()}
        onChangeText={(text) => onChange("cookTime", parseInt(text))}
      />

      <Text style={styles.label}>Difficulté</Text>
      <Picker
        selectedValue={meal.difficulty}
        onValueChange={(value) => onChange("difficulty", value)}
        style={styles.picker}
      >
        <Picker.Item label="Easy" value="Easy" />
        <Picker.Item label="Medium" value="Medium" />
        <Picker.Item label="Hard" value="Hard" />
      </Picker>

      <Text style={styles.label}>Portions</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={meal.servings?.toString()}
        onChangeText={(text) => onChange("servings", parseInt(text))}
      />

      <Text style={styles.label}>Visibilité</Text>
      <Picker
        selectedValue={meal.visibility}
        onValueChange={(value) => onChange("visibility", value)}
        style={styles.picker}
      >
        <Picker.Item label="Privé" value="private" />
        <Picker.Item label="Groupe" value="group" />
      </Picker>

      <Text style={styles.label}>Description</Text>
      <TextInput
        style={[styles.input, { height: 80 }]}
        multiline
        value={meal.description}
        onChangeText={(text) => onChange("description", text)}
      />

      <Button title={submitLabel} onPress={onSubmit} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  label: { fontWeight: "bold", marginTop: 12 },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 8, marginTop: 4 },
  picker: { marginTop: 4 },
});
