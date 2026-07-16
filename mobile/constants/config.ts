// constants/config.ts
// En prod, définit EXPO_PUBLIC_API_BASE_URL (ex: dans eas.json ou un .env chargé par Expo)
// pour pointer vers le serveur déployé. Sans cette variable, on retombe sur l'IP locale du
// PC pour le dev — à remettre à jour si elle change (nouvelle box, reconnexion, etc.).
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://192.168.0.196:5000";
