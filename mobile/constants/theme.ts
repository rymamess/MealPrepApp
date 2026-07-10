
export type ThemeColors = {
  background: string;
  text: string;
  tint: string;
  card: string;
  border: string;
};

// Hex sur 6 chiffres partout : le code ajoute souvent un suffixe alpha à 2 chiffres
// (ex. `${theme.text}aa`), qui ne produit une couleur valide qu'à partir d'un hex à 6 chiffres
// (`#RRGGBB` + `AA` = `#RRGGBBAA`). Un hex court (`#fff` + `aa` = `#fffaa`) est invalide et est
// silencieusement ignoré par React Native.
export const lightTheme: ThemeColors = {
  background: '#ffffff',
  text: '#000000',
  tint: '#2f95dc',
  card: '#f9f9f9',
  border: '#cccccc',
};

export const darkTheme: ThemeColors = {
  background: '#000000',
  text: '#ffffff',
  tint: '#ffffff',
  card: '#121212',
  border: '#333333',
};

export const Colors = {
  light: lightTheme,
  dark: darkTheme,
};

export const Fonts = {
  rounded: 'System',
  mono: 'Courier',
};

