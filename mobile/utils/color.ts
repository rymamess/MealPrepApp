export const getRelativeLuminance = (color: string) => {
  const normalized = color.replace('#', '');
  const fallback = normalized[normalized.length - 1] ?? '0';
  const hex = normalized.length === 3
    ? normalized
        .split('')
        .map((char) => `${char}${char}`)
        .join('')
    : normalized.padEnd(6, fallback);

  const value = (channel: string) => {
    const parsed = parseInt(channel, 16);
    const raw = Number.isNaN(parsed) ? 0 : parsed / 255;
    return raw <= 0.03928 ? raw / 12.92 : Math.pow((raw + 0.055) / 1.055, 2.4);
  };

  const r = value(hex.substring(0, 2));
  const g = value(hex.substring(2, 4));
  const b = value(hex.substring(4, 6));

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

export const getContrastTextColor = (backgroundColor: string) =>
  getRelativeLuminance(backgroundColor) > 0.65 ? '#111' : '#fff';
