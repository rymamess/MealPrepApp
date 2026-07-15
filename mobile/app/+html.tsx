import { ScrollViewStyleReset } from "expo-router/html";

// Personnalise le document HTML généré pour le web, afin que l'app
// s'installe correctement en PWA plein écran depuis l'écran d'accueil iOS.
export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover"
        />
        <title>MealPrep</title>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#E6F4FE" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="MealPrep" />
        <ScrollViewStyleReset />
      </head>
      <body>{children}</body>
    </html>
  );
}
