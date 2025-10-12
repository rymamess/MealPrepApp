// /constants/theme.ts
export type ThemeColors = {
  background: string;
  text: string;
  tint: string;
};

export const lightTheme: ThemeColors = {
  background: '#fff',
  text: '#000',
  tint: '#2f95dc',
};

export const darkTheme: ThemeColors = {
  background: '#000',
  text: '#fff',
  tint: '#fff',
};

export const Colors = {
  light: lightTheme,
  dark: darkTheme,
};

export const Fonts = {
  rounded: 'System', // ou une police custom si tu l'as ajoutée
  mono: 'Courier', // exemple pour monospace
};

