
export type ThemeColors = {
  background: string;
  text: string;
  tint: string;
  card: string;
  border: string;
};

export const lightTheme: ThemeColors = {
  background: '#fff',
  text: '#000',
  tint: '#2f95dc',
  card: '#f9f9f9',
  border: '#ccc',
};

export const darkTheme: ThemeColors = {
  background: '#000',
  text: '#fff',
  tint: '#fff',
  card: '#121212',
  border: '#333',
};

export const Colors = {
  light: lightTheme,
  dark: darkTheme,
};

export const Fonts = {
  rounded: 'System',
  mono: 'Courier',
};

